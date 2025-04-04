const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { jwtValidation } = require("../middleware/auth");

// Admin routes for adding/removing features
router.post(
  "/addSubscriptionPlan",
  jwtValidation,
  adminController.addSubscriptionPlan
);
router.post("/addFeature", jwtValidation, adminController.addFeature);
router.post("/removeFeature", jwtValidation, adminController.removeFeature);
router.post(
  "/getAllSubscriptionPlan",
  jwtValidation,
  adminController.getAllSubscriptionPlan
);

module.exports = router;
