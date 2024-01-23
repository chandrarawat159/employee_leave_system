const {validationResult, checkSchema} = require('express-validator');

const validate = schema => {
    return async (req, res, next) => {
        // await Promise.all(validations.map(validation => validation.run(req)));
        await Promise.all(checkSchema(schema).map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        let extract_errors = [];
        errors.array().map(err => extract_errors.push({[err.param] : err.msg}));

        res.status(422).json({
            errors: extract_errors
        });
    };
};

module.exports = validate;