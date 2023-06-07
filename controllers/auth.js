require("dotenv/config");
const User = require("../models/User");
const hashToken = require("../utils/hashToken.js");
const generateToken = require("../utils/generateToken.js");
const Token = require("../models/Token.js");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, AuthenticationError } = require("../errors");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
// const { parser } = require("ua-parser-js");

console.clear();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
	let user = await User.findOne({ email: req.body.email });
	if (user) throw new BadRequestError("User already exists");
	user = await User.create({ ...req.body });
	const { _id: id, name, profileImage, isVerified, role } = user;
	const token = user.createJWT();

    sendVerificationEmail(id);

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
	const user = await User.findOne({ email: req.body.email });
	if (!user) throw new NotFoundError("User doesn't exist");
	const isPasswordCorrect = await user.comparePassword(req.body.password);
	if (!isPasswordCorrect) throw new AuthenticationError("It's Ezio's password!! Enter yours");

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
    const { userToken } = req.body;
    const ticket = await client.verifyIdToken({
        idToken: userToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { name, email, email_verified, picture, sub } = payload;
    const password = Date.now() + sub;
    let user = await User.findOne({email: email});
      
    if (!user) {
		console.log('no user exist');
        user = await User.create({
            name,
            email,
            password,
            profileImage: picture,
            isVerified: email_verified,
        });

        if (user) {
			const token = user.createJWT();
			const { _id: id, name, profileImage, role, isVerified } = user;
			res.status(StatusCodes.CREATED).json({
				id,
				name,
				profileImage,
				role,
                isVerified,
                token,
			});
        };
    }
      
    if (user) {
		const token = user.createJWT();
        const { id, name, profileImage, role, isVerified } = user;
		res.status(StatusCodes.OK).json({
			id,
            name,
            profileImage,
            role,
            isVerified,
            token,
		});
    };
};

const sendAutomatedEmail = async (req, res) => {

	console.log("sendAutomatedEmail: req.body", req.body);
	const { subject, send_to, reply_to, template, url } = req.body;

    if (!subject || !send_to || !reply_to || !template) {
        res.status(500);
        throw new Error("Missing email parameter");
    }

    // Get user
    const user = await User.findOne({ email: send_to });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const sent_from = process.env.EMAIL_USER;
    const name = user.name;
    const link = `${process.env.FRONTEND_URL}${url}`;
	console.log('link', link)

	try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link,
        );
    
		res.status(StatusCodes.OK).json({ message: "Email sent" });
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again");
    }
};

async function sendVerificationEmail(userId) {
    const user = await User.findById(userId);
    //console.log('inside of sendEmail, user:', user);
    console.log("user being verified:", user);

    // if (!user) {
    //     res.status(404);
    //     throw new Error("User not found");
    // }

    if (user?.isVerified) {
		console.log('user.isVerified', user.isVerified);
        // res.status(400);
        // throw new Error("User already verified");
    }

    // Delete token if already exists
    let token = await Token.findOne({ userId: user._id});
	console.log('token', token);

    if (token) {
        await token.deleteOne();
    }

     // Create verification token adn save to db
     const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

     console.log("verification token:", verificationToken);

     // Construct verification url
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

     // Hash token and save
    const hashedToken = hashToken(verificationToken);
    await new Token({
        userId: user._id,
        vToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * (60*10000) // 60 mins
    }).save();

    // Send email
    const subject = "Verify Your Account - Musiane";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@musiane.co";
    const template = "verifyEmail";
    const name = user.name;
    const link = verificationUrl;

	try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link,
        );
        console.log('Email sent!!!');
		//res.status(StatusCodes.OK).json({ message: "Verification email sent" });
    } catch {
        console.log('email not sent!!!!!');
        // res.status(500);
        // throw new Error("Email not sent, please try again");
    }
};

// const sendVerificationEmail = async (req, res) => {
//     console.log('sendEmail, req.user', req.user);
//     console.log('req.header', req.headers)
//     console.log('req.headers.auth', req.headers.authorization);
//     console.log('req.body', req.body)
// 	const user = await User.findById(req.user.id);

	// console.log("user being verified:", user);
    
    // if (!user) {
    //     res.status(404);
    //     throw new Error("User not found");
    // }

    // if (user?.isVerified) {
	// 	console.log('user.isVerified', user.isVerified);
    //     res.status(400);
    //     throw new Error("User already verified");
    // }

    // // Delete token if already exists
    // let token = await Token.findOne({ userId: user.id});
	// console.log('token', token)
    // if (token) {
    //     await token.deleteOne();
    // }

    // // Create verification token adn save to db
    // const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

    // console.log("verification token:", verificationToken);
    
    // // Hash token and save
    // const hashedToken = hashToken(verificationToken);
    // await new Token({
    //     userId: user.id,
    //     vToken: hashedToken,
    //     createdAt: Date.now(),
    //     expiresAt: Date.now() + 60 * (60*10000) // 60 mins
    // }).save();

//     // Construct verification url
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

//     // Send email
//     const subject = "Verify Your Account - Musiane";
//     const send_to = user.email;
//     const sent_from = process.env.EMAIL_USER;
//     const reply_to = "noreply@musiane.co";
//     const template = "verifyEmail";
//     const name = user.name;
//     const link = verificationUrl;

// 	try {
//         await sendEmail(
//             subject,
//             send_to,
//             sent_from,
//             reply_to,
//             template,
//             name,
//             link,
//         );
// 		res.status(StatusCodes.OK).json({ message: "Verification email sent" });
//     } catch {
//         res.status(500);
//         throw new Error("Email not sent, please try again");
//     }
// };

const verifyUser = async (req, res) => {
	const { verificationToken } = req.params;
    console.log("verifyUser - req.params:", req.params)

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const userToken = await Token.findOne({
        vToken: hashedToken,
        expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token!!!");
    }

    const user = await User.findOne({ _id: userToken.userId });

    if (user.isVerified) {
        res.status(400);
        throw new Error("User is already verified");
    }

	if (user) {
        user.isVerified = true;
        const verifiedUser = await user.save();
        console.log("verifiedUser.isVerified", verifiedUser.isVerified)

        res.status(200).json({ 
            message: "User is successfully verified", 
            isVerified: verifiedUser.isVerified,
        });
    } else {
        res.send(404);
        throw new Error("User not found"); 
    };
    next();
};

module.exports = { 
	register, 
	login, 
	loginWithGoogle,
	sendAutomatedEmail, 
	sendVerificationEmail, 
	verifyUser,
};
