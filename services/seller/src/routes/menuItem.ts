import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isSeller } from "../middlewares/isSeller.js";
import {
  addMenuItem,
  deleteMenuItem,
  getAllItems,
  toggleMenuItemAvailability,
} from "../controllers/menuItem.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addMenuItem);
router.get("/all/:outletId", isAuth, getAllItems);
router.delete("/:itemId", isAuth, isSeller, deleteMenuItem);
router.put("/status/:itemId", isAuth, isSeller, toggleMenuItemAvailability);

export default router;
