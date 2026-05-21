import { HydratedDocument, Schema, model } from "mongoose";

export interface UserInterface {
  name: string;
  email: string;
  image: string;
  role: string;
}

export type UserDocument = HydratedDocument<UserInterface>;

const schema = new Schema<UserInterface>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    role: { type: String, default: null },
  },
  { timestamps: true }
);

const User = model<UserInterface>("User", schema);
export default User;
