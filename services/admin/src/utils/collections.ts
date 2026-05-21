import { connectDb } from "../config/db.js";

export const getOutletCollection = async () => {
  const db = await connectDb();

  return db.collection("outlets");
};

export const getRiderCollection = async () => {
  const db = await connectDb();

  return db.collection("riders");
};

export const getUserCollection = async () => {
  const db = await connectDb();

  return db.collection("users");
};
