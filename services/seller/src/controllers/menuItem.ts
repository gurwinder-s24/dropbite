import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Outlet from "../models/Outlet.js";
import MenuItems from "../models/MenuItems.js";

export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please login" });
  }

  const outlet = await Outlet.findOne({ ownerId: req.user._id });
  if (!outlet) {
    return res.status(404).json({ message: "Outlet not found" });
  }

  const { name, description, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "Image is required" });
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) {
    return res.status(500).json({ message: "Failed to create file buffer" });
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/upload`,
    {
      buffer: fileBuffer.content,
    }
  );


  const item = await MenuItems.create({
    name,
    description,
    price,
    outletId: outlet._id,
    image: uploadResult.url,
  });

  res.json({
    message: "Item Added Successfully",
    item,
  });
});

export const getAllItems = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { outletId } = req.params;
  if (!outletId) {
    return res.status(400).json({ message: "Outlet ID is required" });
  }

  const items = await MenuItems.find({ outletId: outletId });
  res.json(items);
});

export const deleteMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please login" });
  }

  const { itemId } = req.params;
  if (!itemId) {
    return res.status(400).json({ message: "itemId is required" });
  }

  const item = await MenuItems.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const outlet = await Outlet.findOne({ _id: item.outletId, ownerId: req.user._id });
  if (!outlet) {
    return res.status(404).json({ message: "Outlet not found" });
  }

  await item.deleteOne();
  res.json({
    message: "Menu item deleted successfully",
  });
});

export const toggleMenuItemAvailability = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please login" });
  }

  const { itemId } = req.params;
  if (!itemId) {
    return res.status(400).json({ message: "itemId is required" });
  }

  const item = await MenuItems.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const outlet = await Outlet.findOne({ _id: item.outletId, ownerId: req.user._id });
  if (!outlet) {
    return res.status(404).json({ message: "Outlet not found" });
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.json({
    message: `Item Marked as ${
      item.isAvailable ? "available" : "unavailable"
    }`,
    item,
  });
});

