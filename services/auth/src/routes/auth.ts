import { Router } from "express";
import { addUserRole, loginUser, myProfile } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.post("/login", loginUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;

