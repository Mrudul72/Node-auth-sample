var express = require("express");
var router = express.Router();
var users = require("./model/userModel");
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Mrudul" });
});

router.post("/register", async (req, res, next) => {
  var user = new users({
    name: req.body.name,
    password: req.body.password,
    email:req.body.email,
    mobile:req.body.mobile
  });
  var response = await user.save();
  console.log(response);
  if (response) {
    res.status(200).json({ message: "success" });
  } else {
    res.status(401).json({ status: "failed" });
  }
});
router.post("/login", async (req, res, next) => {
  try {
    //validation
    if (!req.body.email || !req.body.password)
      return res.status(400).json({
        status: false,
        message: "Validation Failed",
      });

    const user = await users.findOne({
      email: req.body.email,
    });
    console.log(user);
    if (!user)
      return res.status(404).json({
        status: false,
        message: "User does not exist",
      });
    const pwdMatch = await bcrypt.compare(req.body.password, user.password);

    if (!pwdMatch)
      return res.status(401).json({
        status: false,
        message: "Password Incorrect",
      });

    const token = jwt.sign(
      { userid: user._id, email: user.email },
      process.env.SECRET_CODE,
      { expiresIn: "1d" }
    );
    res.header("auth-token", token).send(token);
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: "Something went wrong",
      data: err,
    });
  }
});

module.exports = router;
