const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(400)
        .send({ status: 0, message: "Email / Password is invalid." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ status: 0, message: "Email / Password is invalid" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    );
    user.save();

    return res.status(200).send({
      status: 1,
      message: "Login successfully done",
      data: user,
      token: token,
    });
  } catch (err) {
    console.log("Something went to wrong into login.", err);
    res.status(500).json({ error: "Login failed", err: err });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { loginUser } = req;
    const { userId } = req.body;
    if (loginUser._id != userId) {
      return res.status(400).send({ message: "Unauthorized Access." });
    }

    const allUser = await User.find().select("-password -role");
    if (!allUser || allUser.length === 0) {
      return res.status(404).send({ message: "Empty set", data: [] });
    }
    return res
      .status(200)
      .send({ message: "Users find successfully", data: allUser });
  } catch (err) {
    console.log("Something went to wrong into get all user", err);
    return res
      .status(500)
      .send({ message: "Something went to wong in get all user" });
  }
};

exports.userDetails = async (req, res) => {
  try {
    const { loginUser } = req;
    const allUser = await User.findOne({ _id: loginUser._id }).select(
      "-password"
    );
    if (!allUser || allUser.length === 0) {
      return res.status(404).send({ message: "Empty set", data: [] });
    }
    return res
      .status(200)
      .send({ message: "Users find successfully", data: allUser });
  } catch (err) {
    console.log("Something went to wrong into get all user", err);
    return res
      .status(500)
      .send({ message: "Something went to wong in get all user" });
  }
};
