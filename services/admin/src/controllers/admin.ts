import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import { getOutletCollection, getRiderCollection, getUserCollection } from "../utils/collections.js";


export const getPendingOutlet = TryCatch(async (req, res) => {
  const outlets = await (await getOutletCollection())
    .find({ isVerified: false })
    .toArray();

  res.json({
    outlets,
  });
});

export const getPendingRiders = TryCatch(async (req, res) => {
  const riders = await (await getRiderCollection())
    .find({ isVerified: false })
    .toArray();

  const userIds = riders.map((r) => {
    return typeof r.userId === "string" ? new ObjectId(r.userId) : r.userId;
  });
  const users = await (await getUserCollection())
    .find({ _id: { $in: userIds } })
    .toArray();

  // Create a quick lookup map of userId -> userName for fast access
  const userMap = new Map(users.map(u => [u._id.toString(), u.name]));

  const ridersWithNames = riders.map((rider) => ({
    ...rider,
    // Look up the name using the rider's userId, fallback to "Unknown" if not found
    riderName: userMap.get(rider.userId?.toString()) || "Unknown Rider",
  }));

  res.json({
    riders: ridersWithNames,
  });
});

export const verifyOutlet = TryCatch(async (req, res) => {
  const { outletId } = req.params;
  if (typeof outletId !== "string") {
    return res.status(400).json({ message: "invalid outlet id" });
  }
  if (!ObjectId.isValid(outletId)) {
    return res.status(400).json({ message: "Invalid object id" });
  }

  const result = await (await getOutletCollection())
  .updateOne(
    { _id: new ObjectId(outletId) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "Outlet not found",
    });
  }

  res.json({
    message: "Outlet verified successfully",
  });
});

export const verifyRider = TryCatch(async (req, res) => {
  const { riderId } = req.params;
  if (typeof riderId !== "string") {
    return res.status(400).json({ message: "invalid rider id" });
  }
  if (!ObjectId.isValid(riderId)) {
    return res.status(400).json({ message: "Invalid object id" });
  }

  const result = await (await getRiderCollection())
  .updateOne(
    { _id: new ObjectId(riderId) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "rider not found",
    });
  }

  res.json({
    message: "rider verified successfully",
  });
});
