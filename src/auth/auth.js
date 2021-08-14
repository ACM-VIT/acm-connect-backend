const jwt = require("jsonwebtoken");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const createError = require("http-errors");

router.get("/google", passport.authenticate("google", { scope: ["email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
  }),
  // eslint-disable-next-line consistent-return
  (req, res, next) => {
    const token = jwt.sign({ id: req.user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(`${process.env.CLIENT_HOME_URL}?token=${token}`);

    try {
      // JWT token Verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        complete: false,
      });

      // Get userId from token
      const userId = decoded.id;
      console.log({ userId });
    } catch (err) {
      return next(createError.Unauthorized());
    }
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
