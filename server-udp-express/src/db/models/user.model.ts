import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    provider: { type: String },
    id: { type: String },
  },
  { collection: "user-data" }
);

const userModel = mongoose.model("UserData", User);
export default userModel;
