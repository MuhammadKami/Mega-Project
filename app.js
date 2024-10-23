if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require('express');

const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const Listings = require("./routes/listing.js");
const Reviews = require("./routes/review.js");
const user = require("./routes/user.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// const dbURL = process.env.ATLAS_STR;
main()
  .then((res) => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: "mongodb://127.0.0.1:27017/wanderlust",
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in mongo session", err);
});
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.send("Hi I am Kamran");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/demo", async (req, res) => {
  let fakeUser = {
    email: "delta@gmail.com",
    username: "delta-student",
  };

  let registeredUser = await User.register(fakeUser, "HelloWorld");
  res.send(registeredUser);
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});
// app.use((req, res, next) => {
//   console.log("Current User:", req.user);  // Add this line for debugging
//   res.locals.currUser = req.user || null;
//   next();
// });


app.use("/listings", Listings);
app.use("/listings/:id/reviews", Reviews);
app.use("/", user);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
});
app.use((err, req, res, next) => {
  let { statusCode, message } = err;
  res.render("error.ejs", { message });
  // res.status(statusCode).send(message);
});
app.listen(8080, () => {
  console.log("Server is listening on 8080");
});
