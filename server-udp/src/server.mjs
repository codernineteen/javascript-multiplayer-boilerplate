import geckos from "@geckos.io/server";
import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createUser } from "./functions/createUser.mjs";

const app = express();
const server = http.createServer(app);
const io = geckos({ cors: { allowAuthorization: true } });
const clients = {};

//config & middleware
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions)); //To allow CORS policy
app.use(bodyParser.json()); //To parser request body

// game-server
io.addServer(server);
io.onConnection((channel) => {
  // web-server;
  channel.onDisconnect(() => {
    //!!ISSUE: There is a delay in detecting channel disconnection
    console.log(`a user ${channel.id} disconnected`);
    delete clients[channel.id];
  });

  console.log(`a user ${channel.id} connected`);
  clients[channel.id] = createUser(channel);

  channel.on("chat message", (data) => {
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit("chat message", data);
  });
});

app.post("/leave", (req, res) => {
  const clientId = req.body.key;
  const client = clients[clientId];
  client.cleanup();
});

// run server
server.listen(5555, () => {
  console.log("listening on port : 5555");
});
// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
