import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./isAuth.js"
 

export const isSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction)
: Promise<void> => {
    if(req.user && req.user.role !== "seller"){
        res.status(403).json({ message: "Access denied. Only sellers can perform this action." });
        return;
    }
    next();
}