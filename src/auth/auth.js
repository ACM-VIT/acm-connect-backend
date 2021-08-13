const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
  }),
  (req, res) => {
    console.log(req.user);
    res.redirect(process.env.CLIENT_HOME_URL);
  }
);

router.get("/failure", (req, res) => {
  res.json({ success: false, message: "User not allowed!" });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
