//packages
import geckos, { Data, ServerChannel } from "@geckos.io/server";
import http from "http";
import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
//classes
import Player from "./classes/Player.js";
//modules
import { connectDB } from "./db/connectMongo.js";
import { passportSetup } from "./config/passport-setup.js";
//instances
import indexRoute from "./routes/index.js";
import userRoute from "./routes/user.js";
import passport from "passport";

//Global function execution
dotenv.config();
passportSetup(passport);

//Environment variables
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI as string;

//Server instances
const app = express();
const server = http.createServer(app);
const io = geckos({
  cors: { origin: "http://localhost:5173", allowAuthorization: true },
});
const players: Map<string, Player> = new Map();

//Options
const whiteList = ["http://localhost:5173"];
const corsOptions: CorsOptions = {
  origin: whiteList,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

//Middlewares
app.use(
  cookieSession({
    name: "session",
    keys: ["cyberyechan"],
    maxAge: 24 * 60 * 60 * 100,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors(corsOptions));
app.use("/", indexRoute);
app.use("/auth", userRoute);
app.use(express.json()); //To parser request body

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
