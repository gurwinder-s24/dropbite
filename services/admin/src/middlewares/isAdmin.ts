import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./isAuth.js"
 

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction)
: Promise<void> => {
    if(req.user && req.user.role !== "admin"){
        res.status(403).json({ message: "Access denied. Only admins can perform this action." });
        return;
    }
    next();
}