import axios from "axios";
import jwt from "jsonwebtoken";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Outlet from "../models/Outlet.js";


export const addOutlet = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if(!user){
    return res.status(401).json({ message: "Unauthorized" });
  }

  const existingOutlet = await Outlet.findOne({ ownerId: user?._id });
  if (existingOutlet) {
    return res.status(400).json({ message: "You already have an outlet" });
  }

  const { name, description, phone, latitude, longitude, formattedAddress } = req.body;
  if (!name || !latitude || !longitude ) {
    return res.status(400).json({ message: "Name, latitude and longitude are required" });
  }

  const file = req.file;
  if(!file){
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
  

  const outlet = await Outlet.create({
    name,
    description,
    phone,
    image: uploadResult.url,
    ownerId: user._id,
    autoLocation: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
      formattedAddress,
    },
    isVerified: false,
  });

  return res.status(201).json({
    message: "Outlet created successfully",
    outlet,
  });

});

export const fetchMyOutlet = TryCatch(async (req: AuthenticatedRequest, res) => {
  if(!req.user){
    return res.status(401).json({ message: "Please Login" });
  }

  const existingOutlet = await Outlet.findOne({ ownerId: req.user?._id });
  if (!existingOutlet) {
    return res.status(400).json({ message: "No outlet found" });
  }

  if (!req.user.outletId) {
    const token = jwt.sign(
      {
        user: {
          ...req.user,
          outletId: existingOutlet._id,
        },
      },
      process.env.JWT_SEC as string,
      { expiresIn: "15d" }
    );
    return res.json({ token });
  }
  res.json({ outlet: existingOutlet });
});

export const updateOutlet = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({ message: "Please Login" });
    }

    const { name, description } = req.body;

    const outlet = await Outlet.findOneAndUpdate(
      { ownerId: req.user._id },
      { name: name, description: description },
      { returnDocument: "after" }
    );

    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    res.json({
      message: "Outlet Updated",
      outlet,
    });
});

export const updateStatusOutlet = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({ message: "Please Login" });
    }

    const { status } = req.body;
    if (typeof status !== "boolean") {
      return res.status(400).json({ message: "Status must be boolean" });
    }

    const outlet = await Outlet.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { isOpen: status },
      { returnDocument: "after" }
    );
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    res.json({
      message: "Outlet status Updated",
      outlet,
    });
});

export const getNearbyOutlet = TryCatch(async (req: AuthenticatedRequest, res) => {
  
  const { latitude, longitude, radius = 5000, search = "" } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Latitude and longitude are required" });
  }

  const query: any = { isVerified: true };
  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }

  const outlets = await Outlet.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        spherical: true,
        query,
      },
    },
    {
      $sort: {
        isOpen: -1,
        distance: 1,
      },
    },
    {
      $addFields: {
        distanceKm: {
          $round: [{ $divide: ["$distance", 1000] }, 2],
        },
      },
    },
  ]);

  res.json({
    success: true,
    count: outlets.length,
    outlets,
  });
});

export const fetchSingleOutlet = TryCatch(async (req: AuthenticatedRequest, res) => {
  const outlet = await Outlet.findById(req.params.outletId);
  res.json(outlet);
});
