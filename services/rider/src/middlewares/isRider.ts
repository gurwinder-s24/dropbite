import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./isAuth.js"
 

export const isRider = async (req: AuthenticatedRequest, res: Response, next: NextFunction)
: Promise<void> => {
    if(req.user && req.user.role !== "rider"){
        res.status(403).json({ message: "Access denied. Only riders can perform this action." });
        return;
    }
    next();
}