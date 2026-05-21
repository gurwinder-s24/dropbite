import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { 
  getPendingOutlet,
  getPendingRiders,
  verifyOutlet,
  verifyRider,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/admin/outlet/pending", isAuth, isAdmin, getPendingOutlet);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.patch("/verify/outlet/:outletId", isAuth, isAdmin, verifyOutlet);
router.patch("/verify/rider/:riderId", isAuth, isAdmin, verifyRider);

export default router;
