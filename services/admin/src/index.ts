import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());

app.use("/api/v1", adminRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Admin Service is running on port ${PORT}`);
});
