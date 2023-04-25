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

const connectedUsers = {};

io.on("connection", (socket) => {
  // add the user to the connectedUsers object
  socket.on("login", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} connected`);
  });

  // remove the user from the connectedUsers object
  socket.on("logout", (userId) => {
    delete connectedUsers[userId];
    console.log(`User ${userId} disconnected`);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
