import mongoose from "mongoose";

type UserDocument = mongoose.Document & {
  googleId: string;
  name: string;
  email: string;
  photos: string;
  provider: string;
};

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    photos: {
      type: String,
    },
    provider: {
      type: String,
    },
  },
  { collection: "user-data" }
);

const User = mongoose.model<UserDocument>("UserData", UserSchema);
export default User;
export { UserDocument };
