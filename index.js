const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const { group } = require("console");

const app = express();
const port = 9000 || process.env.PORT;

app.use(cors());
app.get("/", (req, res) => {
  res.send("working on socket");
});

const users = [];
const groupMessage = {};
const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("joined", ({ user, Group }, cb) => {
    socket.join(Group);

    socket.emit("welcome", {
      user: user,
      message: `Welcome to the chat`,
    });
    const name = { id: socket.id, user, Group };
    users.push(name);
    console.log(`Welcome to the chat, ${user}`);

    socket.broadcast.to(Group).emit("userJoined", {
      user: user,
      message: `has joined`,
    });
    // oldMessages.map((i) => {
    socket.emit("sendOldMessage", groupMessage[Group] || []);
    // });

    console.log(`${user} has joined`);
  });

  socket.on("message", ({ message, id, Group, user }) => {
    const messageUser = { user: user, message, id };
    console.log(groupMessage);
    if (groupMessage[Group]) {
      groupMessage[Group].push(messageUser);
    } else {
      groupMessage[Group] = [messageUser];
    }
    io.to(Group).emit("sendMessage", messageUser);
  });

  socket.on("disconnect", () => {
    const id = socket.id;
    const index = users.findIndex((name) => name.id === id);

    var leftuser;
    if (index !== -1) {
      leftuser = users.splice(index, 1)[0];
    }
    if (leftuser) {
      socket.broadcast.to(leftuser.Group).emit("leave", {
        user: leftuser.user,
        message: `has left`,
      });
      console.log(`${leftuser.user} has left`);
    }
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
