const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { jwtValidation } = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/userDetails", jwtValidation, userController.userDetails);
router.post("/getAllUser", jwtValidation, userController.getAllUser);

module.exports = router;
