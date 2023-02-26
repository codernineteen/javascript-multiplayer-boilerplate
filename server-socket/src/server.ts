import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types/socket-server-types";
import ConnectedUser from "./user/ConnectedUser";

/**
 * Socket.io server
 */

const app = express();
const httpServer = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
  },
});

const Clients: { [id: string]: ConnectedUser } = {};

io.on("connection", (socket) => {
  console.log(`a user ${socket.id} connected`);
  Clients[socket.id] = new ConnectedUser(socket, Clients);

  socket.on("RequestMessage", (message, id) => {
    io.emit("ResponseMessage", message, id);
  });

  socket.on("disconnect", () => {
    console.log(
      `a user ${socket.id} disconnected, processing on clean up disconnected user`
    );
    socket.broadcast.emit("CleanUpMesh", socket.id);
    delete Clients[socket.id];
  });
});

httpServer.listen(process.env.PORT || 3333, () => {
  console.log("server listening to port number: 3333");
});
