const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const keys = require("../config/keys");
const passport = require("passport");

module.exports = (io) => {
  router.get("/", async (req, res) => {
    try {
      // Get all users from database
      const users = await User.find().select("-password");

      console.log(process.env.JWT_SECRET);

      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Register a new user
  router.post("/register", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      // Save user to database
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Login user and return JWT token
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const payload = {
        id: user.id,
        firstName: user.firstName,

        lastName: user.lastName,
        profile_pic: user.profile_pic,
        email: user.email,
      };
      // Create JWT token
      jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
        res.json({
          success: true,
          token: `${token}`,
        });
        console.log(token);
      });

      // res.status(200).json({ token });
      // console.log(payload);

      // res.status(200).json("Hello");
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post(
    "/addBuddie/:id",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const user = await User.findById(req.user.id);
        const buddyToAdd = await User.findById(req.params.id);

        if (!buddyToAdd) {
          return res.status(400).json({ error: "User not found" });
        }

        if (user.buddies.includes(buddyToAdd._id)) {
          return res
            .status(400)
            .json({ error: "User already added as a buddy" });
        }

        user.buddies.push(buddyToAdd._id);
        await user.save();

        return res
          .status(200)
          .json({ success: true, message: "Buddy added successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
    }
  );

  // Remove Buddie
  router.post(
    "/removeBuddie/:id",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const user = await User.findById(req.user.id);
        const buddyToRemove = await User.findById(req.params.id);

        if (!buddyToRemove) {
          return res.status(400).json({ error: "User not found" });
        }

        if (!user.buddies.includes(buddyToRemove._id)) {
          return res.status(400).json({ error: "User not added as a buddy" });
        }

        user.buddies = user.buddies.filter(
          (buddy) => buddy.toString() !== buddyToRemove._id.toString()
        );
        await user.save();

        return res
          .status(200)
          .json({ success: true, message: "Buddy removed successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
    }
  );
  return router;
};
