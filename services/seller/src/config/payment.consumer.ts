import axios from "axios";
import Order from "../models/Order.js";
import { getChannel } from "./rabbitmq.js";
import Cart from "../models/Cart.js";

export const startPaymentConsumer = async () => {
  const channel = getChannel();

  console.log("Starting consumer to consume from:", process.env.PAYMENT_QUEUE);

  channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      console.log("event type", event.type);
      if (event.type !== "PAYMENT_SUCCESS") {
        console.log("skipping non-payment-success event");
        channel.ack(msg);
        return;
      }

      // update order payment status
      const { orderId } = event.data;
      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            status: "placed",
          },
          $unset: {
            expiresAt: true,
          },
        },
        { returnDocument: "after" }
      );

      if (!order) {
        channel.ack(msg);
        return;
      }
      await Cart.deleteMany({ userId: order.userId });
      console.log("✅ Order Placed:", order._id);

      //   socket work - notify outlet about new order
      await axios.post(
        `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
        {
          event: "order:new",
          room: `outlet:${order.outletId}`,
          payload: {
            orderId: order._id,
          },
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        }
      );

      channel.ack(msg);
      console.log("Message acknowledged");
    } 
    catch (error) {
      console.error("❌ Payment consumer error:", error);
    }
  });
};
