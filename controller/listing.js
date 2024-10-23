const Listing = require("../models/listing");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const maptoken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: maptoken });

// Index Controller
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  console.log(req.user);
  res.render("./listings/index.ejs", { allListings });
};

// New Controller
module.exports.new = async (req, res) => {
  res.render("./listings/edit.ejs");
};

// Edit Controller
module.exports.edit = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.url;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing was updated ");
  res.redirect("/listings");
};
// Update Controller
module.exports.update = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing was not found.");
    res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  originalImage = originalImage.replace("/upload", "/upload/h_300,w_250");
  res.render("./listings/form.ejs", { listing, originalImage });
};
//Create Controller
module.exports.create = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  let url = req.file.url;
  let filename = req.file.filename;
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = response.body.features[0].geometry;
  await newlisting.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};
// Destroy Controller
module.exports.destroy = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted!");
  res.redirect("/listings");
};
// Show Controller
module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Your request was not found.");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};
