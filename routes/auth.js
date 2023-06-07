const express = require("express");
const { 
    //register, 
    registerUser,
    loginStatus,
    loginUser,
    login, 
    loginWithGoogle, 
    getUser,
    sendAutomatedEmail, 
    sendVerificationEmail, 
    verifyUser 
} = require("../controllers/auth");
const authorize = require("../middleware/authorization");

const router = express.Router();

// router.post("/register", register);
router.post("/register", registerUser);
router.get('/loginStatus', loginStatus);
router.post("/login", loginUser);
//router.post("/login", login);
router.post("/google/callback", loginWithGoogle);
router.get("/getUser", getUser);
router.post("/sendAutomatedEmail", sendAutomatedEmail);
router.post("/sendVerificationEmail", authorize, sendVerificationEmail);
router.patch("/verifyUser/:verificationToken", verifyUser);

module.exports = router;
