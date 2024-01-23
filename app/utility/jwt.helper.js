
'use strict';
const jwt = require('jsonwebtoken');
const prisma = require('../db');

module.exports = {
  verifyJWTToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.AUTH_TOKEN_SECRET, { algorithm: process.env.AUTH_HASH_ALGORITHM }, (err, decoded) => {
        if (err) {
          return resolve({ success: false, message: err.name, data: null });
        }
        return resolve({ success: true, message: 'success', data: decoded });
      });
    });
  },

  generateJwtAuthToken: async (signObject, expiryTime) => {
    const token = jwt.sign(signObject, process.env.AUTH_TOKEN_SECRET, {
      algorithm: process.env.AUTH_HASH_ALGORITHM,
      expiresIn: expiryTime || process.env.AUTH_TOKEN_EXPIRES // expires in given hours
    });
    await prisma.authtoken.create({
      data: {
        userId: signObject.userid,
        token: token
      }
    })
    return {
      success: true,
      token: token
    };
  }
};