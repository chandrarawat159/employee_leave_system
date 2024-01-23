const prisma = require("../db");
const { verifyJWTToken } = require("../utility/jwt.helper");

module.exports = {
    bearerMiddleware: async (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(400).send({
                response: {
                    status: 400,
                    message: 'Bad request. No authorization token passed!!'
                }
            })
        }
        const parsed_token = token.split(' ')[1];
        const findToken = await prisma.authtoken.findFirst({
            where: {
                token: parsed_token.trim()
            }
        })
        if (!findToken) {
            return res.status(401).send({
                response: {
                    status: 401,
                    message: 'Invalid token'
                }
            })
        }
        const { success, message, data } = await verifyJWTToken(parsed_token);
        if (!success) {
            return res.status(401).send({
                response: {
                    status: 401,
                    message: 'unauthorized'
                }
            })
        }
        req.metaData.userId = data.userid;
        console.log(data)
        next()
    }
}