// Copyright (c) 2021, Yannick Deubel (https://github.com/yandeu)
// All rights reserved.
import geckos, { Data, ServerChannel, iceServers } from "@geckos.io/server";
//packages
import http from "http";
import awsServerlessExpress from "aws-serverless-express";
import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
//classes
import Player from "./classes/Player.js";
//modules
import { connectDB } from "./db/connectMongo.js";
import { passportSetup } from "./config/passport-setup.js";
//instances
import indexRoute from "./routes/index.js";
import userRoute from "./routes/user.js";
import passport from "passport";
//types
import type { ConnectMongoOptions } from "connect-mongo/build/main/lib/MongoStore.js";
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    views: number;
  }
}

//Global function & global variables
dotenv.config();
passportSetup(passport);

//Environment variables
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI as string;

//Server instances
const app = express();
const server = awsServerlessExpress.createServer(app);
const io = geckos({
  iceServers: process.env.NODE_ENV === "production" ? iceServers : [],
  cors: { origin: `${process.env.CLIENT_URL}`, allowAuthorization: true },
  portRange: {
    min: 10000,
    max: 10007,
  },
});

const players: Map<string, Player> = new Map();

//Options
const whiteList = [`${process.env.CLIENT_URL}`];
const corsOptions: CorsOptions = {
  origin: whiteList,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
const mongoStoreOptions: ConnectMongoOptions = {
  mongoUrl: process.env.MONGO_URI,
  ttl: 24 * 60, //test용으로 짧은 시간만 설정
};

//Middlewares
app.use(
  session({
    name: "google-session",
    secret: process.env.GOOGLE_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create(mongoStoreOptions),
  })
);

app.use(cors(corsOptions)); //지정한 whitelist를 위한 cors 허용
app.use(express.json()); //json형식 디코딩을 위한 미들웨어

app.use("/", indexRoute);
app.use("/auth", userRoute);

//Game server
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

//Application server
app.post("/leave", (req, res) => {
  console.log("url : /leave, message : a user left server");
  const clientId = req.body.key;
  const player = players.get(clientId);
  player?.CleanUp();
});

//Run server asynchronously
const startServer = async () => {
  try {
    await connectDB(MONGO_URI);
    server.listen(PORT || 5555, () => {
      console.log(`Server listening on port : ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
