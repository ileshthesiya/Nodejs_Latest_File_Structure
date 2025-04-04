const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.jwtValidation = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (token) {
      jwt.verify(token, process.env.JWT_TOKEN, async (error, decoded) => {
        if (error) {
          return res.status(401).send({
            status: 0,
            isAuthenticated: false,
            message: "Session expired. Please login again.",
          });
        }

        const { email, id, role } = decoded;

        if (!email || !id || !role) {
          return res.status(400).send({ status: 0, message: "Invalid token." });
        }

        let findUser = await User.findOne({ email: email.toLowerCase() });
        if (!findUser) {
          return res
            .status(401)
            .send({ status: 0, message: "Unauthorized access." });
        }

        req.loginUser = findUser;
        next();
      });
    } else {
      return res.status(400).send({ message: "Please provide valid token." });
    }
  } catch (error) {
    console.log(error);
    return res.send({ status: 0, message: "Something went wrong.", error });
  }
};
