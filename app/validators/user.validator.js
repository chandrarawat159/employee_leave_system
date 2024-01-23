const prisma = require("../db");
module.exports = {
    UserSchema: {
        fullName: {
            notEmpty: true,
            isLength: {
                options: {
                    min: 3,
                    max: 25
                },
                errorMessage: 'Full name must be at least 3 and max 7 characters.'
            },
            errorMessage: 'Full name is required'
        },
        email: {
            trim: true,
            notEmpty: true,
            isEmail: {
                errorMessage: 'Must be a valid email address'
            },
            isLength: {
                errorMessage: 'Email must have length greater than 1',
                options: { min: 1 }
            },
            errorMessage: 'Email is required',
            custom: {
                options: async (value, { req }) => {
                    const user = await prisma.user.findFirst({
                        where: {
                            email: value
                        }
                    });
                    if (user) {
                        throw 'Email is already taken'
                    }
                }
            }
        },
        password: {
            notEmpty: true,
            isLength: {
                errorMessage: 'Password should be at least 7 chars long',
                // Multiple options would be expressed as an array
                options: { min: 7 },
            },
            errorMessage: 'Password is required'
        },
        confirmPassword: {
            notEmpty: true,
            errorMessage: 'Confirm password is required',
            bail: true,
            custom: {
                options: async (value, { req }) => {
                    return new Promise((resolve, reject) => {
                        if (value !== req.body.password) {
                            reject('Password donot match')
                        }
                        resolve(true);
                    });
                }
            },
        }
    }
}; 
