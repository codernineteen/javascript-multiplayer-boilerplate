import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
//types, classes and modules
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types/socket-server-types";
import ConnectedUser from "./classes/ConnectedUser";
import indexRoute from "./routes/index";
import userRoute from "./routes/user";
import roomRoute from "./routes/room";
import { connectDB } from "./db/connectMongo";
import type { UserDocument } from "./db/models/user.model";

//add custom type to Request type of express module
declare global {
  namespace Express {
    interface Request {
      user: UserDocument;
    }
  }
}

//Global configuration
dotenv.config();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

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
    origin: process.env.CLIENT_URI,
  },
});
const Clients: { [id: string]: ConnectedUser } = {};
const Rooms: { [id: string]: string } = {};

/**
 * Options
 */
const whiteList = [`${process.env.CLIENT_URI}`];
const corsOptions: CorsOptions = {
  origin: whiteList,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

//Middlewares
// -- package middleware
app.use(cors(corsOptions)); //지정한 whitelist를 위한 cors 허용
app.use(express.json()); //json형식 디코딩을 위한 미들웨어
// -- routes middleware
app.use("/", indexRoute);
app.use("/auth", userRoute);
app.use("/room", roomRoute);

io.on("connection", (socket) => {
  console.log(`a user ${socket.id} connected`);

  //Handle chat function
  socket.on("RequestMessage", (message, id) => {
    io.emit("ResponseMessage", message, id);
  });

  //Handle room entrance
  socket.on("JoinRoom", (data) => {
    const { roomId, userId } = data;
    Clients[socket.id] = new ConnectedUser(socket, Clients);
    socket.join(roomId); //current socket to join the room
    Rooms[socket.id] = roomId;
    socket.to(roomId).emit("UserConnected", roomId, userId); //broadcast enterance of current user to other users in room
  });

  //Handle peer offer
  socket.on("PeerOffer", (payload, roomId) => {
    //if server get an offer from new client
    //broadcast to all clients in room about the offer
    socket.to(roomId).emit("PeerOffer", payload, roomId);
  });

  //Handle peer answer
  socket.on("PeerAnswer", (payload, roomId) => {
    //if server get an offer from new client
    //broadcast to all clients in room about the offer
    socket.to(roomId).emit("PeerAnswer", payload, roomId);
  });

  socket.on("disconnect", () => {
    const roomId = Rooms[socket.id];
    if (roomId) {
      console.log("processing clean up for user in room..");
      socket.to(roomId).emit("CleanUpMesh", socket.id);
      delete Clients[socket.id];
      delete Rooms[socket.id];
      console.log("successfully cleaned up mesh");
    } else {
      console.log(`no room found for disconnected user ${socket.id}`);
    }
  });
});

//Application server
app.post("/leave", (req, res) => {
  console.log("url : /leave, message : a user left server");
  const clientId = req.body.key;
  io.emit("CleanUpMesh", clientId);
});

const startServer = async () => {
  try {
    await connectDB(MONGO_URI as string);
    httpServer.listen(PORT || 3333, () => {
      console.log(`Server listening on port : ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
