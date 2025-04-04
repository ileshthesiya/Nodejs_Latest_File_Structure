const SubscriptionPlan = require("../models/subscriptionPlan");

exports.addSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, features, userId } = req.body;
    const { loginUser } = req;
    if (!name || !description || !price || !features || !userId) {
      return res.status(400).send({ message: "All Fields are required." });
    }
    // if (loginUser._id != userId || loginUser.role !== "admin") {
    //   return res.status(400).send({ message: "Unauthorized access." });
    // }
    // Check if a plan with the same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res
        .status(400)
        .json({ message: "Subscription plan already exist." });
    }

    // Create the new subscription plan
    const newPlan = new SubscriptionPlan({
      name,
      description,
      price,
      features,
      userId: userId,
    });

    await newPlan.save();
    res.status(201).json({ message: "Subscription plan added successfully", data: newPlan });
  } catch (err) {
    console.log("Something went to wrong into add subscription plan", err);
    res.status(500).json({ error: "Error adding subscription plan" });
  }
};

exports.getAllSubscriptionPlan = async (req, res) => {
  try {
    const { userId } = req.body;
    const { loginUser } = req;
    if (!userId) {
      return res.status(400).send({ message: "All Fields are required." });
    }
    if (loginUser._id != userId) {
      return res.status(400).send({ message: "Unauthorized access." });
    }
    // Check if a plan with the same name already exists
    const allPlan = await SubscriptionPlan.find();
    if (!allPlan || allPlan.length === 0) {
      return res.status(404).json({ message: "Empty set." });
    }

    return res
      .status(200)
      .send({ message: "All plan getting successfull", data: allPlan });
  } catch (err) {
    console.log("Something went to wrong into add subscription plan", err);
    res.status(500).json({ error: "Error adding subscription plan" });
  }
};

// Add a new feature to a plan
exports.addFeature = async (req, res) => {
  try {
    const { planId, featureToAdd, userId } = req.body;
    const { loginUser } = req;
    if (!planId || !featureToAdd || !userId) {
      return res.status(400).send({ message: "All fields are required." });
    }
    // if (loginUser._id != userId || loginUser.role !== "admin") {
    //   return res.status(400).send({ message: "Unauthorized access." });
    // }
    const plan = await SubscriptionPlan.findOne({
      _id: planId,
    });

    if (plan.features.includes(featureToAdd)) {
      return res
        .status(410)
        .send({ message: "This feature is alreary have into this plan." });
    }
    plan.features.push(featureToAdd);
    await plan.save();
    res.status(200).json({ message: "Feature added successfully", plan });
  } catch (err) {
    console.log("Something went to wrong into add feature.", err);
    res.status(500).json({ error: "Failed to add feature" });
  }
};

// Remove a feature from a plan
exports.removeFeature = async (req, res) => {
  try {
    const { planId, featureToRemove, userId } = req.body;
    const { loginUser } = req;
    if (!planId || !featureToRemove || !userId) {
      return res.status(400).send({ message: "All fields are required." });
    }
    // if (loginUser?._id != userId || loginUser?.role !== "admin") {
    //   return res.status(400).send({ message: "Unauthorized access." });
    // }
    const plan = await SubscriptionPlan.findOne({
      _id: planId,
      features: { $in: featureToRemove },
    });
    if (!plan) {
      return res
        .status(404)
        .send({ message: "Plan not fount with given data." });
    }
    plan.features = plan.features.filter((f) => f !== featureToRemove);
    await plan.save();
    res.status(200).json({ message: "Feature removed successfully", plan });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove feature" });
  }
};
