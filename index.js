const express = require("express");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const http = require("http");
const passport = require("passport"); // Import the passport object

const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//attach the io
app.io = io;

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/talker";

app.use(cors());
app.use(express.json());
// Use passport for authentication
app.use(passport.initialize());
require("./config/passport")(passport);

const userRoutes = require("./routes/userRoutes")(io);
const postRoutes = require("./routes/postRoutes")(io);

app.use("/api/users", userRoutes);
// app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/api/test", (req, res) => {
  res.send("Hello, World!");
});

const users = {};

io.on("connection", (socket) => {
  // Store user's socket ID in the object
  // users[socket.id] = { username: "Anonymous" };
  // console.log(`User connected: ${socket.id}`);
  // // Emit the updated users object to all clients
  // io.emit("users", users);
  // socket.on("disconnect", () => {
  //   // Remove user's socket ID from the object
  //   delete users[socket.id];
  //   console.log(`User disconnected: ${socket.id}`);
  //   // Emit the updated users object to all clients
  //   io.emit("users", users);
  // });
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
