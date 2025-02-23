import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/auth";
import MySql from "../database/mySqlConnection";
import asyncHooks from "../hooks/asyncHooks";
import dayjs from "dayjs"; // Lighter alternative to moment.js

// Extending Request type to include `user` in res.locals
interface AuthRequest extends Request {
    headers: {
        languagecode?: string;
        "accept-version"?: string;
        auth_token?: string;
    };
}

// JWT Payload Type
interface DecodedToken extends JwtPayload {
    user_id: number;
}

// Middleware to verify JWT token
const verifyToken = async (req: AuthRequest, res: any, next: NextFunction): Promise<Response | void> => {
    req.headers.languagecode = req.headers.languagecode || "en";
    req.headers["accept-version"] = req.headers["accept-version"] || "1.0.0";

    const token = req.body.token || req.query.token || req.headers.auth_token;
    if (!token) {
        return res.status(401).json({ status: false, message: "No token provided." });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

        // Fetch user details from DB
        const query = `SELECT * FROM users WHERE id = ? AND status = 1`;
        const params = [decoded.user_id];
        const queryRes = await MySql.query(query, params);

        if (!queryRes.data.length) {
            return res.status(403).json({ status: false, message: "Invalid token or user not found." });
        }

        const user = queryRes.data[0];

        if (!user.last_login_at) {
            return res.status(401).json({ status: false, message: "Session Expired. Please Login Again." });
        }

        const lastLoginDate = dayjs(user.last_login_at);
        if (dayjs().isAfter(lastLoginDate.add(30, "days"))) {
            return res.status(401).json({ status: false, message: "This account is currently inactive. Please contact Admin." });
        }

        // Attach user details to res.locals (best practice)
        res.locals.user = {
            id: user.id,
            type: user.type,
            name: user.name,
            email: user.email,
            phone: user.phone,
        };

        // Set user context in async hooks
        const reqContext = asyncHooks.getRequestContext();
        asyncHooks.setRequestContext({
            ...reqContext,
            user_id: user.id,
            type: user.type,
        });

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ status: false, message: "Failed to authenticate token." });
    }
};

export default verifyToken;
