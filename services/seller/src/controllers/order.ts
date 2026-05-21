import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import { MenuItemDocument } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import Outlet, { OutletDocument } from "../models/Outlet.js";
import { publishOrderReadyEvent } from "../config/order.publisher.js";

// apis for customers (frontend)
export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { paymentMethod, addressId } = req.body;

  if (!addressId) {
    return res.status(400).json({
      message: "Address is required",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    userId: user._id,
  });

  if (!address) {
    return res.status(404).json({
      message: "Address Not found",
    });
  }

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const cartItems = await Cart.find({ userId: user._id })
    .populate<{ itemId: MenuItemDocument }>("itemId")
    .populate<{ outletId: OutletDocument }>("outletId");

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const firstCartItem = cartItems[0];

  if (!firstCartItem || !firstCartItem.outletId) {
    return res.status(400).json({
      message: "Invalid Cart Data",
    });
  }

  const outletId = firstCartItem.outletId._id;

  const outlet = await Outlet.findById(outletId);

  if (!outlet) {
    return res.status(404).json({
      message: "No outlet with this id",
    });
  }

  if (!outlet.isOpen) {
    return res.status(404).json({
      message: "Sorry this outlet is closed for now",
    });
  }

  const distance = getDistanceKm(
    address.location.coordinates[1],
    address.location.coordinates[0],
    outlet.autoLocation.coordinates[1],
    outlet.autoLocation.coordinates[0]
  );

  if (distance > 10) {
    return res.status(400).json({
      message: "Failed: Location is too far from the outlet. We only deliver within 10 km",
    });
  }

  let subtotal = 0;

  const orderItems = cartItems.map((cartItem) => {
    const item = cartItem.itemId;

    if (!item) {
      throw new Error("Invalid cart item");
    }

    const itemTotal = item.price * cartItem.quantity;

    subtotal += itemTotal;

    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quantity: cartItem.quantity,
    };
  });

  const deliveryFee = subtotal < 250 ? 49 : 0;
  const platformFee = 7;
  const totalAmount = subtotal + deliveryFee + platformFee;

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [longitude, latitude] = address.location.coordinates;

  const riderAmount = 10 + Math.ceil(distance) * 17;

  const order = await Order.create({
    userId: user._id.toString(),
    outletId: outletId.toString(),
    outletName: outlet.name,
    riderId: null,
    distance,
    riderAmount,
    items: orderItems,
    subtotal,
    deliveryFee,
    platformFee,
    totalAmount,
    addressId: address._id.toString(),
    deliveryAddress: {
      formattedAddress: address.formattedAddress,
      mobile: address.mobile,
      latitude,
      longitude,
    },

    paymentMethod,
    paymentStatus: "pending",
    status: "placed",
    expiresAt,
  });

  // await Cart.deleteMany({ userId: user._id });

  res.json({
    message: "Order created successfully",
    orderId: order._id.toString(),
    amount: totalAmount,
  });
});

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const orders = await Order.find({
    userId: req.user._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });

  res.json({ orders });
});

export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to view this order",
      });
    }

    res.json(order);
  }
);

// api for utils microservice (internal)
export const fetchOrderForPayment = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      message: "Order already paid",
    });
  }

  res.json({
    orderId: order._id,
    amount: order.totalAmount,
    currency: "INR",
  });
});


// apis for outlet owner (frontend)
export const fetchOutletOrders = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { outletId } = req.params;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!outletId) {
      return res.status(400).json({
        message: "Outlet id is required",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
      outletId: outletId,
      paymentStatus: "paid",
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  }
);

const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"] as const;
export const updateOrderStatusByOutletOwner = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(404).json({
        message: "Order not completed",
      });
    }

    const outlet = await Outlet.findById(order.outletId);
    if (!outlet) {
      return res.status(404).json({
        message: "Outlet not found",
      });
    }

    if (outlet.ownerId.toString() !== user._id) {
      return res.status(401).json({
        message: "You are not allowed to update this order",
      });
    }

    order.status = status;
    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `user:${order.userId}`, // customer room
        payload: {
          orderId: order._id,
          status: order.status,
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    // now assign riders
    if (status === "ready_for_rider") {
      console.log(
        "Publishing Order ready for rider event for order: ",
        order._id
      );

      await publishOrderReadyEvent("ORDER_READY_FOR_RIDER", {
        orderId: order._id.toString(),
        outletId: outlet._id.toString(),
        location: outlet.autoLocation,
      });

      console.log("Event Published successfully");
    }

    res.json({
      message: "order status updated successfully",
      order,
    });
  }
);

export const reNotifyRiders = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  const { orderId } = req.params;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const outlet = await Outlet.findById(order.outletId);
  if (!outlet) {
    return res.status(404).json({
      message: "Outlet not found",
    });
  }

  if (outlet.ownerId.toString() !== user._id) {
    return res.status(401).json({
      message: "You are not allowed to update this order",
    });
  }

  await publishOrderReadyEvent("ORDER_READY_FOR_RIDER", {
    orderId: order._id.toString(),
    outletId: outlet._id.toString(),
    location: outlet.autoLocation,
  });

  res.json({
    message: "Riders notified successfully",
  });
});


// apis for rider microservice (internal)
export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { orderId, riderId, riderName, riderPhone } = req.body;
  const orderAvailable = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  });
  if (orderAvailable) {
    return res.status(400).json({ message: "You already have an order" });
  }

  const order = await Order.findById(orderId);
  if (order?.riderId !== null) {
    return res.status(400).json({ message: "Order Already taken" });
  }

  const orderUpdated = await Order.findOneAndUpdate(
    { _id: orderId, riderId: null },
    {
      riderId,
      riderName,
      riderPhone,
      status: "rider_assigned",
    },
    { returnDocument: "after" }
  );

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `user:${order.userId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `outlet:${order.outletId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );

  res.json({
    success: true,
    message: "Rider Assigned Successfully",
    order: orderUpdated,
  });
});

export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { riderId } = req.query;
  if (!riderId) {
    return res.status(400).json({ message: "Rider id is required" });
  }

  const order = await Order.findOne({
    riderId: riderId.toString(),
    status: { $ne: "delivered" },
  }).populate("outletId");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json(order);
});

export const updateOrderStatusByRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!order.riderId === riderId) {
    return res.status(401).json({ message: "You are not assigned to this order" });
  }
  if (order.status === "delivered") {
    return res.status(400).json({ message: "Order is already delivered" });
  }

  if (order.status === "rider_assigned") {
    order.status = "picked_up";
    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:picked_up",
        room: `outlet:${order.outletId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:picked_up",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }

  if (order.status === "picked_up") {
    order.status = "delivered";
    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:delivered",
        room: `outlet:${order.outletId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:delivered",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }
});

export const updateRiderLocation = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId, riderLocation } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!order.riderId === riderId) {
    return res.status(401).json({ message: "You are not assigned to this order" });
  }
  if (order.status === "delivered") {
    return res.status(400).json({ message: "Order is already delivered" });
  }

  axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "rider:location",
      room: `user:${order.userId}`,
      payload: riderLocation,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    }
  );
  
  return res.json({
    message: "Rider location updated successfully",
  });
});
