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

  socket.on("joined", ({ name, groupName }, cb) => {
    socket.join(groupName);

    socket.emit("welcome", {
      name: name,
      message: `${name},Welcome to the chat`,
    });
    const user = { id: socket.id, name, groupName };
    console.log("user", user);
    users.push(user);
    console.log(`Welcome to the chat`);

    socket.broadcast.to(groupName).emit("userJoined", {
      name: name,
      message: `has joined`,
    });

    socket.emit("sendOldMessage", groupMessage[groupName] || []);

    console.log(`${name} has joined`);
  });

  socket.on("message", ({ message, id, groupName, name }) => {
    const messageUser = { name: name, message, id };
    if (groupMessage[groupName]) {
      groupMessage[groupName].push(messageUser);
    } else {
      groupMessage[groupName] = [messageUser];
    }
    io.to(groupName).emit("sendMessage", messageUser);
    console.log("gddfgdf", messageUser.id);
  });

  socket.on("disconnect", () => {
    const id = socket.id;
    const index = users.findIndex((user) => user.id === id);

    var leaveuser;
    if (index !== -1) {
      leaveuser = users.splice(index, 1)[0];
    }
    if (leaveuser) {
      socket.broadcast.to(leaveuser.groupName).emit("leave", {
        name: leaveuser.name,
        message: `has left`,
      });
      console.log(`${leaveuser.name} has left`);
    }
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
