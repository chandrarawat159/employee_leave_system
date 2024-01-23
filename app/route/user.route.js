const { checkSchema } = require("express-validator");
const { route } = require("express/lib/application");
const user = require("../controller/user.controller.js");
const router = require("express").Router();
// const { check } = require('express-validator');
const { UserSchema } = require('../validators/user.validator');
const validate = require('../validators/index');
const { bearerMiddleware } = require("../middleware/bearer.middleware.js");

// Create a new user
router.post('/resetPassword/:email', user.resetPassword);
router.post('/updatePassword/:email/:token', user.updatePassword);
router.post("/register", validate(UserSchema), user.register);
router.post("/login", user.login);
router.get("/dashboard", bearerMiddleware, user.dashboard);
router.post('/logout', bearerMiddleware, user.logout);
router.get("/profile", bearerMiddleware, user.profile);




module.exports = router;






































































// router.delete("/delete/:id", employee.delete);

// module.exports = router;
































































































































































































































































































































