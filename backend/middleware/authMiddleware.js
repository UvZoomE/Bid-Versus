const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  // (Standard practice is to send tokens as: "Bearer eyJhbGciOiJIUzI1NiIsInR5...")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract the token from the header string
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the token using our secret key
      // If it's valid, it will decode back into the object we signed: { id: "12345...", iat: ..., exp: ... }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Fetch the user from the database using that decoded ID
      // .select('-password') ensures we NEVER accidentally attach the password hash to the request object
      req.user = await User.findById(decoded.id).select("-password");

      // 5. The user is legit! Pass control to the actual controller
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res
        .status(401)
        .json({ message: "Not authorized, token failed or expired" });
    }
  }

  // 6. If no token was found at all
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
