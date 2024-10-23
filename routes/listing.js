const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const passport = require("passport");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const {storage}  = require("../cloudCOnfig.js");
const upload = multer({ storage });

// Index Route
router.get("/", listingController.index);
// New Route
router.get("/new", isLoggedIn, listingController.new);

// SHow route
router.get("/:id", listingController.show);

//Create Route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  (listingController.create)
);

// Update Route
router.get("/:id/edit", isLoggedIn, isOwner, listingController.update);
//Edit Route
router.put("/:id", isLoggedIn,upload.single("listing[image]"), isOwner, listingController.edit);
// Delete Route
router.delete("/:id/edit", isLoggedIn, isOwner, listingController.destroy);

module.exports = router;
