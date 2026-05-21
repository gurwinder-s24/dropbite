import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserInterface } from "../dto/User.js";

export interface AuthenticatedRequest extends Request {
    user?: UserInterface | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction)
: Promise<void> => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized: No Bearer token provided" });
            return;
        }
        
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: Token value is missing" });
            return;
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
        if (!decodedPayload || !decodedPayload.user) {
            res.status(401).json({ message: "Unauthorized: Invalid token provided" });
            return;
        }

        req.user = decodedPayload.user;
        next();
    } catch (error) {
        res.status(500).json({ message: "Please login - Jwt error" });
    }

};