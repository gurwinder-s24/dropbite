import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sellerRoutes from "./routes/seller.js";
import itemRoutes from "./routes/menuItem.js";
import cartRoutes from "./routes/cart.js";
import addressRoutes from "./routes/address.js";
import orderRoutes from "./routes/order.js";
import cors from "cors";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";

dotenv.config();
await connectRabbitMQ();
startPaymentConsumer();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/outlet", sellerRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Seller service is running on port ${PORT}`);
  connectDB();
});
