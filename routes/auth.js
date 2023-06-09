const express = require("express");
const { 
    register, 
    login, 
    loginWithGoogle, 
    sendAutomatedEmail, 
    sendVerificationEmail, 
    verifyUser 
} = require("../controllers/auth");
const authorize = require("../middleware/authorization");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google/callback", loginWithGoogle);
router.post("/sendAutomatedEmail", sendAutomatedEmail);
router.post("/sendVerificationEmail", sendVerificationEmail);
router.patch("/verifyUser/:verificationToken", verifyUser);

module.exports = router;
