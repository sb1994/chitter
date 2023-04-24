const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("List of messages");
});

router.get("/:id", (req, res) => {
  res.send(`Details of message with ID ${req.params.id}`);
});

router.post("/", (req, res) => {
  res.send("Create a message");
});

router.put("/:id", (req, res) => {
  res.send(`Update message with ID ${req.params.id}`);
});

router.delete("/:id", (req, res) => {
  res.send(`Delete message with ID ${req.params.id}`);
});

module.exports = router;
