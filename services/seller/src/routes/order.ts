import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isSeller } from "../middlewares/isSeller.js";
import {
  getMyOrders,
  fetchSingleOrder,
  createOrder,

  fetchOrderForPayment,
  fetchOutletOrders,
  updateOrderStatusByOutletOwner,
  reNotifyRiders,
  
  assignRiderToOrder,
  getCurrentOrderForRider,
  updateOrderStatusByRider,
  updateRiderLocation,
} from "../controllers/order.js";

const router = express.Router();

router.get("/myorder", isAuth, getMyOrders);
router.get("/:orderId", isAuth, fetchSingleOrder);
router.post("/new", isAuth, createOrder);

router.get("/payment/:orderId", fetchOrderForPayment);
router.get("/outlet/:outletId", isAuth, isSeller, fetchOutletOrders );
router.put("/:orderId", isAuth, isSeller, updateOrderStatusByOutletOwner);
router.post("/:orderId/notify_riders", isAuth, isSeller, reNotifyRiders);

router.put("/assign/rider", assignRiderToOrder);
router.get("/current/rider", getCurrentOrderForRider);
router.put("/update/status/rider", updateOrderStatusByRider);
router.post("/update/location/rider", updateRiderLocation);

export default router;
