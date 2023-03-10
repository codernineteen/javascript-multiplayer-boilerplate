import mongoose from "mongoose";

const connectDB = (url: string) => {
  mongoose.connect(url).catch((err) => {
    console.log("connecting error: " + err);
  });
};

export { connectDB };
