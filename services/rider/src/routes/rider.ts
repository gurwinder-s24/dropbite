import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isRider } from "../middlewares/isRider.js";
import {
  acceptOrder,
  addRiderProfile,
  fetchMyCurrentOrder,
  fetchMyProfile,
  toggleRiderAvailablity,
  updateOrderStatus,
  updateRiderLocation,
} from "../controllers/rider.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isRider, uploadFile, addRiderProfile);
router.get("/myprofile", isAuth, isRider, fetchMyProfile);
router.patch("/toggle", isAuth, isRider, toggleRiderAvailablity);
router.post("/accept/:orderId", isAuth, isRider, acceptOrder);
router.get("/order/current", isAuth, isRider, fetchMyCurrentOrder);
router.put("/order/update/status/:orderId", isAuth, isRider, updateOrderStatus);
router.post("/order/update/location/:orderId", isAuth, isRider, updateRiderLocation);

export default router;
