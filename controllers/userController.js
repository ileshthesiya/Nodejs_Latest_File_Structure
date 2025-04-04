const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const SubscriptionPlan = require("../models/subscriptionPlan");
const UserSubscription = require("../models/userSubscription");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required." });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
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

// User login
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

// User subscribes to a plan
exports.subscribeToPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const { loginUser } = req;
    if (!userId || !planId) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // if (loginUser?._id != userId || loginUser?.role !== "user") {
    //   return res.status(401).send({ message: "Unauthorized access." });
    // }

    await UserSubscription.deleteMany({
      userId: userId,
    });

    const plan = await SubscriptionPlan.findById(planId);

    let currentDate = new Date();
    let expirationDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 1)
    );

    // Add 5 hours and 30 minutes
    expirationDate.setHours(expirationDate.getHours() + 5);
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);

    const userSubscription = new UserSubscription({
      userId,
      planId,
      features: [...plan.features], // Snapshot the features
      validUntil: expirationDate, // Set expiration to exactly 1 month from today
    });

    await userSubscription.save();
    res
      .status(200)
      .json({ message: "Subscription successful", userSubscription });
  } catch (err) {
    console.log("Somthing went to wrong into subscribe to plan.", err);
    res.status(500).json({ error: "Subscription failed" });
  }
};

// Get user's subscription features
exports.getUserFeatures = async (req, res) => {
  try {
    const { userId } = req.body;
    const { loginUser } = req;
    if (!userId) {
      return res.status(400).send({ message: "All fields are required." });
    }

    if (loginUser?._id != userId) {
      return res.status(401).send({ message: "Unauthorized access." });
    }
    const userSubscription = await UserSubscription.findOne({ userId: userId });
    if (!userSubscription) {
      return res.status(404).json({ message: "Empty set" });
    }

    const planData = await SubscriptionPlan.findOne({
      _id: userSubscription.planId,
    });

    const features = Array.from(
      new Set([...userSubscription.features, ...planData.features])
    );

    const result = {
      _id: planData?._id,
      name: planData?.name,
      description: planData?.description,
      price: planData?.price,
      features: features,
      subscriptionDate: userSubscription?.subscriptionDate,
      validUntil: userSubscription?.validUntil,
    };

    res.status(200).json({ data: result });
  } catch (err) {
    console.log("Something went to wrong into get user feature.", err);
    res.status(500).json({ error: "Error retrieving features" });
  }
};

exports.getSingleSubscription = async (req, res) => {
  try {
    const { planId, userId } = req.body;
    const { loginUser } = req;
    if (!userId || !planId) {
      return res.status(400).send({ message: "All fields are required." });
    }

    if (loginUser?._id != userId) {
      return res.status(401).send({ message: "Unauthorized access." });
    }

    const planData = await SubscriptionPlan.findOne({
      _id: planId,
    });

    res.status(200).json({ data: planData });
  } catch (err) {
    console.log("Something went to wrong into get user feature.", err);
    res.status(500).json({ error: "Error retrieving features" });
  }
};
