const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Please login first!");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send("Please login first!");
    }
    const decodedToken = await jwt.verify(token, process.env.SECRET);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new Error("User not found!");
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .send({ message: "Invalid or expired token!", ERROR: error.message });
  }
};

module.exports = {
  userAuth,
};
