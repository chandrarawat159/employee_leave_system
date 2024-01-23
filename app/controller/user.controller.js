const { append } = require("express/lib/response");
const prisma = require("../db");
const { generateJwtAuthToken } = require("../utility/jwt.helper");
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const jsonwebtoken = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { sendEmail } = require('../nodemailer/nodemailer');


// register a User
let register = async (req, res) => {
  try {
    // Create 
    const salt = await bcrypt.genSalt(10)
    const hash_password = await bcrypt.hash(req.body.password, salt)
    const user = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: hash_password
    };

    // Save user in the database

    const users = await prisma.user.create({ data: user });
    res.status(200).send({
      data: users,
      response: {
        status: 200,
        message: 'Success'
      }
    });
  } catch (err) {
    res.status(500).send({
      data: err.message,
      response: {
        status: 500,
        message: 'Internal Server Error'
      }
    });
  }

};
//login user
let login = async (req, res) => {
  try {
    // Create 
    const user = {
      email: req.body.email,
      password: req.body.password,
    };
    const users = await prisma.user.findFirst({ where: { email: req.body.email } });
    //console.log({ users })
    if (!users) {
      return res.status(400).send({
        data: null,

        response: {
          status: 400,
          message: 'Invalid username or password'
        }
      });
    }
    const isvalid = await bcrypt.compare(req.body.password, users.password)
    console.log(users.password, isvalid)
    if (isvalid) {
      const tokenObj = await generateJwtAuthToken({ userid: users.userId });
      console.log({ tokenObj })
      if (!tokenObj.success) {
        return res.status(500).send({
          data: null,
          response: {
            status: 500,
            message: 'Internal Server Error'
          }
        });
      }
      return res.status(200).send({
        data: { token: tokenObj.token },
        response: {
          status: 200,
          message: 'Success'
        }
      });
    }

    return res.status(401).json({
      message: 'invalid username or password'
    })


  } catch (err) {
    return res.status(500).send({
      data: err.message,
      response: {
        status: 500,
        message: 'Internal Server Error'
      }
    });
  }

};

//dashboard
let dashboard = async (req, res) => {
  try {
    const { userId } = req.metaData;

    const user = await prisma.user.findUnique({ where: { userId: userId } });
    if (!user) {
      return res.status(404).send({
        response: {
          status: 404,
          message: 'error..! no such record'
        }
      });
    }
    return res.status(200).send({
      data: user,
      response: {
        status: 200,
        message: 'Success'
      }
    });
  } catch (err) {
    return res.status(500).send({
      data: null,
      response: {
        status: 500,
        message: 'Internal Server Error'
      }
    });
  }

};

let logout = async (req, res) => {
  try {
    const token = await prisma.authToken.findFirst({
      where: {
        token: req.headers['authorization'].split(' ')[1]
      }
    });

    await prisma.authToken.delete({
      where: {
        id: token.id
      }
    })

    return res.status(200).send({
      data: {},
      response: {
        status: 200,
        message: 'Logged out successfully'
      }
    })
  } catch (err) {

    console.error(err)
  }
}

//resetPassword
let resetPassword = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        // mode: 'insensitive'
      }
    });
    if (!user) {
      return res.status(404).send({
        data: {},
        response: {
          status: 404,
          message: 'User with said email was not found in our database'
        }
      })
    }

    // clear existing token
    await prisma.resetpasswordtoken.deleteMany({
      where: {
        userId: user.userId
      }
    });

    const token = randomstring.generate({
      length: 6,
      charset: 'alphabetic'
    });
    await prisma.resetpasswordtoken.create({
      data: {
        userId: user.userId,
        resetToken: token
      }
    })

    return await sendEmail(user, token)
      .then((data) => {
        return res.status(200).send({
          data: {},
          response: {
            status: 200,
            message: 'We have sent you a mail to help you reset your password. Please check your mail.'
          }
        })
      })
      .catch((error) => {
        let message
        if (error.code === 'EDNS') {
          message = 'Could not connect to mail provider!!';
        } else {
          message = 'Some error occurred while sending mail!'
        }
        return res.status(400).send({
          data: {},
          response: {
            status: 400,
            message: message
          }
        })
      });

  } catch (error) {
    console.error(error)
    return res.status(500).send({
      data: {},
      response: {
        status: 500,
        message: 'Internal server error'
      }
    })
  }
}

//update password
let updatePassword = async (req, res) => {
  try {
    // Create 
    const { email, token } = req.params;
    const { password } = req.body;
    const user = await prisma.user.findFirst({ where: { email: email } });
    if (!user) {
      return res.status(400).send({
        data: null,
        response: {
          status: 400,
          message: 'User does not exist'
        }
      });
    }
    const tokenExists = await prisma.resetpasswordtoken.findFirst({
      where: {
        AND: [
          {
            userId: user.userId,
          },
          {
            resetToken: token
          }
        ]
      }
    })

    if (!tokenExists) {
      return res.status(400).send({
        data: null,
        response: {
          status: 400,
          message: 'Token does not exist'
        }
      });
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    await prisma.user.update({
      where: {
        userId: user.userId
      },
      data: {
        password: hashedPassword
      }
    })
    await prisma.authtoken.deleteMany({
      where: {
        userId: user.userId
      }
    })
    await prisma.resetpasswordtoken.deleteMany({
      where: {
        userId: user.userId
      }
    })

    await prisma.$transaction([
      prisma.user.update({
        where: {
          userId: user.userId
        },
        data: {
          password: hashedPassword
        }
      }),
      prisma.authtoken.deleteMany({
        where: {
          userId: user.userId
        }
      }),
      prisma.resetpasswordtoken.deleteMany({
        where: {
          userId: user.userId
        }
      })
    ])
    return res.status(200).send({
      data: user,
      response: {
        status: 200,
        message: 'Successfully reset password. Please try to log in using your new password'
      }
    })
  } catch (err) {
    return res.status(500).send({
      data: err.message,
      response: {
        status: 500,
        message: 'Internal Server Error'
      }

    });
  }

};


//getMyprofile
let profile = async (req, res) => {
  try {
    const { userId } = req.metaData;

    const user = await prisma.user.findUnique({ where: { userId: userId } });
    if (!user) {
      return res.status(404).send({
        response: {
          status: 404,
          message: 'error..! no such record'
        }
      });
    }
    return res.status(200).send({
      data: {
        fullName: user.fullName,
        email: user.email
      },
      response: {
        status: 200,
        message: 'Success'
      }
    });
  } catch (err) {
    return res.status(500).send({
      data: null,
      response: {
        status: 500,
        message: 'Internal Server Error'
      }
    });
  }

};


module.exports = { register, login, dashboard, logout, resetPassword, updatePassword, profile }



