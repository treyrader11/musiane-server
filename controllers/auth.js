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
	if (user) throw new BadRequestError("User already exists");
	user = await User.create({ ...req.body });
	const { _id: id, name, profileImage, isVerified, role } = user;
	const token = user.createJWT();

    //sendVerificationEmail(id);

	res.status(StatusCodes.CREATED).json({
		id,
		token,
		name,
		profileImage,
		isVerified,
		role,
	});
};

// Register User
// const registerUser = async (req, res) => {
//     const { name, email, password } = req.body;
//     console.log("registerUser controller - req.body:", req.body);
//     if (!name || !email || !password) {
//         res.status(400);
//         throw new Error("Please fill in all the required fields");
//     }

//     if (password.length < 6) {
//         throw new Error("Password must contain at least 6 characters.");
//     }

//     // Check if user email already exists
//     const userExists = await User.findOne({email});

//     if (userExists) {
//         res.status(400);
//         throw new Error("Email already registered.");
//     }

//     const ua = parser(req.headers["user-agent"]);
//     const userAgent = [ua.ua];

//     const user = await User.create({
//         ...req.body, 
//         userAgent
//     });

//     const token = generateToken(user._id);

//     res.cookie("token", token, {
//         path: "/",
//         httpOnly: true,
//         expires: new Date(Date.now() + 1000 * 86400), // 1 day
//         sameSite: "none",
//         secure: true
//     });

//     if (user) {
//        const { _id, name, email, profileImage, role, isVerified } = user;
//         res.status(201).send({
//             _id, 
//             name, 
//             email, 
//             profileImage, 
//             role, 
//             isVerified,
//         });
//     } else {
//         res.send(400);
//         throw new Error("Invalid user data");
//     };
// };



// const loginStatus = async (req, res) => {
//     const { token } = req.cookies;

//     if (!token) {
//         res.json(false); 
//         return;
//     }

//     try {
//         const verified = jwt.verify(token, process.env.JWT_SECRET);
//         if (verified) {
//             res.json(true);
//         } else {
//             res.json(false);
//         }
//     } catch (error) {
//         res.json(false);
//     }
// };


// Login User
// const loginUser = async (req, res) => {
//     const { email, password } = req.body;
//     console.log("user to login:", req.body);
//     if (!email || !password) {
//       res.status(400);
//       throw new Error("Please add email and password");
//     }
  
//     // Check if user exists
//     const user = await User.findOne({ email });
//     console.log('user', user)
  
//     if (!user) {
//       res.status(400);
//       throw new Error("User not found, please signup");
//     }
  
//     // If User exists, check if password is correct
//     const passwordIsCorrect = await bcrypt.compare(password, user.password);
  
//     if (!passwordIsCorrect) {
//       res.status(400);
//       throw new Error("Invalid email or password");
//     }

//      // Trigger 2FA for unknown userAgent/device
//      const ua = parser(req.headers["user-agent"]);
//      const thisUserAgent = ua.ua;
//      console.log(thisUserAgent);
//      const allowedDevice = user.userAgent.includes(thisUserAgent);
   
//      if (!allowedDevice) {
//          const loginCode = Math.floor(100000 + Math.random() * 900000);
//          console.log("access code:", loginCode);

//          // Hash token before saving to DB
//          const encryptedLoginCode = cryptr.encrypt(loginCode.toString());
   
//          // Delete token if it exists in DB
//          let userToken = await Token.findOne({ userId: user._id });
//          if (userToken) {
//              await userToken.deleteOne();
//          }
   
//          // Save Access Token to DB
//          await new Token({
//              userId: user._id,
//              loginToken: encryptedLoginCode,
//              createdAt: Date.now(),
//              expiresAt: Date.now() + 60 * (60 * 1000) // Thirty minutes
//          }).save();
     
//          res.status(400);
//          throw new Error("New device detected. Please check your email for an access code.");
//      }

//      //   Generate Token
//     const token = generateToken(user._id);
//     if (user && passwordIsCorrect) {
//         // Send HTTP-only cookie
//         res.cookie("token", token, {
//             path: "/",
//             httpOnly: true,
//             expires: new Date(Date.now() + 1000 * 86400), // 1 day
//             sameSite: "none",
//             secure: true
//         });

//         const { _id, name, email, photo, students, enrolledStudents, bio, isVerified, role } = user;
//         res.status(200).json({
//             _id,
//             name,
//             email,
//             photo,
//             students,
//             enrolledStudents,
//             bio,
//             isVerified,
//             role,
//             token
//         });
//     } else {
//         res.status(400);
//         throw new Error("hmm... Something went wrong. Please try again");
//     }
// };

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
    let user = await User.findOne({ email });
      
    if (!user) {
		console.log("no user exist");
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
        const { _id: id, name, profileImage, role, isVerified } = user;
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

	try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
		res.status(StatusCodes.OK).json({ message: "Email sent" });
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent. Please try again");
    }
};

// const getUser = async (req, res) => {
//     console.log("req.body", req.body)
//     console.log('getUser called');
//     const user = await User.findById(req.body._id);
//     if (user) {
//         res.status(200).json(user);
//     } else {
//         res.status(404);
//         throw new Error("User not found");
//     } 
// };

async function sendVerificationEmail(userId) {
    const user = await User.findById(userId);
    console.log("user being verified:", user);

    // if (!user) {
    //     res.status(404);
    //     throw new Error("User not found");
    // }

    if (user?.isVerified) {
		console.log("user.isVerified", user.isVerified);
        // res.status(400);
        // throw new Error("User already verified");
    }

    // Delete token if already exists
    let token = await Token.findOne({ userId: user._id});
	console.log("token", token);

    if (token) {
        await token.deleteOne();
    }

    const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    const hashedToken = hashToken(verificationToken);
    await new Token({
        userId: user._id,
        vToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * (60*10000) // 60 mins
    }).save();

    const subject = "Verify Your Account - Musiane";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@musiane.co";
    const template = "verifyEmail";
    const name = user.name;
    const link = verificationUrl;

	try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link );
        console.log("Email sent!");
		res.status(StatusCodes.OK).json({ message: "Verification email sent" });
    } catch {
        res.status(StatusCodes.BAD_REQUEST);
        throw new BadRequestError("Error sending email");
        // throw new Error("Email not sent, please try again");
    }
};

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
