import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types/socket-server-types";

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

const Clients = [];

io.on("connection", (socket) => {
  console.log("A user connected. Current users in server : " + Clients.length);
});

httpServer.listen(process.env.PORT || 5555, () => {
  console.log("server listening to port number: 5555");
});
