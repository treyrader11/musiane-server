const { AuthenticationError } = require("../errors");
const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
	const authHeader = req.headers.authorization;
	console.log('authorize, authHeader', authHeader);
	console.log('req.body', req.body);
	console.log('req.user', req.user);
	console.log('req.cookies:', req.cookies);
	if (!authHeader || !authHeader.startsWith("Bearer")) {
		throw new AuthenticationError("Authentication Invalid");
	}
	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: payload.id, name: payload.name, profileImage: payload.profileImage };
		next();
	} catch (error) {
		throw new AuthenticationError("Authentication Invalid");
	}
};

module.exports = authorize;
