import geckos, { ChannelId, Data, ServerChannel } from "@geckos.io/server";
import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Player from "./classes/Player.js";

const app = express();
const server = http.createServer(app);
const io = geckos({
  cors: { origin: "http://localhost:5173", allowAuthorization: true },
});
const players: Map<string, Player> = new Map();

//config & middleware
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions)); //To allow CORS policy
app.use(bodyParser.json()); //To parser request body

// game-server
io.addServer(server);
io.onConnection((channel: ServerChannel) => {
  console.log(`a user ${channel.id} connected`);
  players.set(channel.id as string, new Player(channel));

  channel.on("chat message", (data: Data) => {
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit("chat message", data);
  });

  channel.onDisconnect(() => {
    //!!ISSUE: There is a delay in detecting channel disconnection
    console.log(`a user ${channel.id} disconnected`);
    players.delete(channel.id as string);
  });
});

app.post("/leave", (req, res) => {
  const clientId = req.body.key;
  const player = players.get(clientId);
  player?.CleanUp();
});

// run server
server.listen(5555, () => {
  console.log("listening on port : 5555");
});
// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
