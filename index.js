const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = 9000 || process.env.PORT;

app.use(cors());
app.get("/", (req, res) => {
  res.send("working on socket");
});

const users = [];
const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("joined", ({ user, Group }, cb) => {
    socket.join(Group);

    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the chat, ${user}`,
    });
    const name = { id: socket.id, user, Group };
    users.push(name);
    console.log(`Welcome to the chat, ${user}`);

    socket.broadcast.to(Group).emit("userJoined", {
      user: "Admin",
      message: `${user} has joined`,
    });
    console.log(`${user} has joined`);
  });

  socket.on("message", ({ message, id, Group }) => {
    const name = users.find((name) => name.id === id);
    io.to(name.Group).emit("sendMessage", { user: name.user, message, id });
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
        user: "Admin",
        message: `${leftuser.user} has left`,
      });
      console.log(`${leftuser.user} has left`);
    }
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
