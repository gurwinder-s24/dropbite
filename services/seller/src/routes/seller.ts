import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isSeller } from "../middlewares/isSeller.js";
import {
  addOutlet,
  fetchMyOutlet,
  updateOutlet,
  updateStatusOutlet,
  getNearbyOutlet,
  fetchSingleOutlet,
} from "../controllers/seller.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addOutlet);
router.get("/my", isAuth, isSeller, fetchMyOutlet);
router.put("/status", isAuth, isSeller, updateStatusOutlet);
router.put("/edit", isAuth, isSeller, updateOutlet);
router.get("/all", isAuth, getNearbyOutlet);
router.get("/:outletId", isAuth, fetchSingleOutlet);

export default router;