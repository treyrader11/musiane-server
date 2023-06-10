require("dotenv/config");
const User = require("../models/User");
const hashToken = require("../utils/hashToken.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");
const Token = require("../models/Token.js");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, AuthenticationError } = require("../errors");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const Cryptr = require("cryptr");
const { sendEmail } = require("../utils/sendEmail");
const parser = require("ua-parser-js");

console.clear();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cryptr = new Cryptr(process.env.CRYPTR_KEY);

const register = async (req, res) => {
	let user = await User.findOne({ email: req.body.email });
    console.log('req.body', req.body)
	if (user) throw new BadRequestError("User already exists");
    const ua = parser(req.headers["user-agent"]);
    const userAgent = [ua.ua];
	user = await User.create({ ...req.body, userAgent });
	const { _id: id, name, profileImage, isVerified, role } = user;
	const token = user.createJWT();

	res.status(StatusCodes.CREATED).json({
		id,
		token,
		name,
		profileImage,
		isVerified,
		role,
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) throw new BadRequestError("Please provide email and password");
    const user = await User.findOne({ email });
    console.log('user', user)
	if (!user) throw new NotFoundError("User doesn't exist");
    const isPasswordCorrect = await user.comparePassword(password);
    //const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('isPasswordCorrect', isPasswordCorrect);
	if (!isPasswordCorrect) throw new AuthenticationError("Invalid password");

    // Trigger 2FA for unknown userAgent/device
    const ua = parser(req.headers["user-agent"]);
    const userAgent = ua.ua;
    console.log(userAgent);
    const allowedDevice = user.userAgent.includes(userAgent);
   
    if (!allowedDevice) {
        const loginCode = Math.floor(100000 + Math.random() * 900000);
        console.log("access code:", loginCode);
        const encryptedLoginCode = cryptr.encrypt(loginCode.toString());
        // Delete token if it exists in DB
        let userToken = await Token.findOne({ userId: user._id });
        if (userToken) await userToken.deleteOne();
   
        // Save Access Token to DB
        await new Token({
            userId: user._id,
            loginToken: encryptedLoginCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 1000) // Thirty minutes
        }).save();
        throw new BadRequestError("New device detected. To confirm it's you, please check your email for an access code");
    }

	const { _id: id, name, profileImage, isVerified, role } = user;
	const token = user.createJWT();
	res.status(StatusCodes.OK).json({
		id,
		token,
		name,
		profileImage,
		isVerified,
		role,
	});
};

const loginWithGoogle = async (req, res) => {
    try {
        const { userToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: userToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { name, email, email_verified: isVerified, picture: profileImage, sub } = payload;
        const password = Date.now() + sub;
        let user = await User.findOne({ email });
  
        if (!user) {
            console.log("no user exists");
            user = await User.create({
                name,
                email,
                password,
                profileImage,
                isVerified,
            });
            if (user) {
                const { _id: id, name, profileImage, role, isVerified } = user;
                const token = user.createJWT();

                return res.status(StatusCodes.CREATED).json({
                    id,
                    token,
                    name,
                    profileImage,
                    isVerified,
                    role,
                });
            }
        }
        if (user) {
            const { _id: id, name, profileImage, role, isVerified } = user;
            const token = user.createJWT();
            return res.status(StatusCodes.OK).json({
                id,
                token,
                name,
                profileImage,
                isVerified,
                role,
            });
        }
    } catch (err) {
      console.error("Error logging in with Google:", err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ err: "Failed to login with Google. Please try again" });
    }
};

const sendAutomatedEmail = async (req, res) => {
    try {
      const { subject, send_to, reply_to, template, url } = req.body;
      if (!subject || !send_to || !reply_to || !template) throw new Error("Missing email parameter");
      const user = await User.findOne({ email: send_to });
      if (!user) throw new Error("User not found");

      const sent_from = process.env.EMAIL_USER;
      const name = user.name;
      const link = `${process.env.FRONTEND_URL}${url}`;
  
      await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
      res.status(StatusCodes.OK).json({ message: "Email sent" });
    } catch (error) {
        console.error("Error sending automated email:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Email not sent. Please try again" });
    }
};

const sendVerificationEmail = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        console.log("user being verified:", user);
        if (!user) throw new NotFoundError("User doesn't exist");
        if (user.isVerified) throw new BadRequestError("User already verified");
        // Delete token if already exists
        const token = await Token.findOne({ userId: user._id });
        if (token) await token.deleteOne();
  
        const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
        const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
        const hashedToken = hashToken(verificationToken);

        await new Token({
            userId: user._id,
            vToken: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 10000), // 60 mins
        }).save();
  
        const subject = "Verify Your Account - Musiane";
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = "noreply@musiane.co";
        const template = "verifyEmail";
        const name = user.name;
        const link = verificationUrl;
  
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
        res.status(StatusCodes.CREATED).json({ msg: "Please check your email for verification link"})
        } catch (err) {
        throw new BadRequestError(err);
    }
};

// const verifyUser = async (req, res) => {
//     try {
//         const { verificationToken } = req.params;
//         console.log("verifyUser - req.params:", req.params);
//         const hashedToken = crypto
//             .createHash("sha256")
//             .update(verificationToken)
//             .digest("hex");
//         const userToken = await Token.findOne({
//             vToken: hashedToken,
//             expiresAt: { $gt: Date.now() },
//         });

//         if (!userToken) throw new BadRequestError("Invalid or expired token");
//         const user = await User.findById(userToken.userId);
//         if (!user) throw new NotFoundError("User not found");
//         if (user.isVerified) throw new BadRequestError("User is already verified");
//         user.isVerified = true;
//         const verifiedUser = await user.save();
//         const { _id: id, name, profileImage, isVerified, role, token } = verifiedUser;
//         console.log("verifiedUser", verifiedUser);
//         res.status(StatusCodes.OK).json({
//             id,
//             name,
//             profileImage,
//             role,
//             isVerified,
//             token,
//             msg: "User is successfully verified",
//         });
//     } catch (err) {
//         console.error("Error verifying user:", err);
//         res.status(StatusCodes.BAD_REQUEST).json({ err: "Wups! Something went wrong" });
//     }
// };

const verifyUser = async (req, res) => {
    try {
        const { verificationToken } = req.params;
        console.log('verificationToken', verificationToken)
        console.log("verifyUser - req.params:", req.params);
        const hashedToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");
        const userToken = await Token.findOne({
            vToken: hashedToken,
            expiresAt: { $gt: Date.now() },
        });

        if (!userToken) throw new BadRequestError("Invalid or expired token");
        const user = await User.findById(userToken.userId);
        if (!user) throw new NotFoundError("User not found");
        if (user.isVerified) {
            //throw new BadRequestError("User is already verified");
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "User is already verified" });
        }
        user.isVerified = true;
        const verifiedUser = await user.save();
        console.log("verifiedUser", verifiedUser);
        return res.status(StatusCodes.OK).json({
            msg: "User is successfully verified",
            isVerified: verifiedUser.isVerified,
        });
    } catch (err) {
        console.error("Error verifying user:", err);
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Wups! Something went wrong" });
    }
};

module.exports = { 
    register,
	login, 
	loginWithGoogle,
	sendAutomatedEmail, 
	sendVerificationEmail, 
	verifyUser,
};
