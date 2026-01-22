import jwt from "jsonwebtoken";
import connectDB from "./mongodb";
import User from "@/models/User";
import { errorResponse } from "@/utils/apiResponse";

export async function requireAuth(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return {
                error: errorResponse("Authentication required", {
                    status: 401,
                    errorCode: "UNAUTHORIZED"
                })
            };
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return {
                error: errorResponse("Invalid or expired token", {
                    status: 401,
                    errorCode: "INVALID_TOKEN"
                })
            };
        }

        if (!decoded?.userId) {
            return {
                error: errorResponse("Invalid token", {
                    status: 401,
                    errorCode: "INVALID_TOKEN"
                })
            };
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return {
                error: errorResponse("User not found", {
                    status: 401,
                    errorCode: "USER_NOT_FOUND"
                })
            };
        }

        if (!user.isActive) {
            return {
                error: errorResponse("User account is inactive", {
                    status: 403,
                    errorCode: "ACCOUNT_INACTIVE"
                })
            };
        }

        // Role spoofing prevention: do not accept role claims that don't match DB.
        // If an account's role changes after token issuance, force re-auth.
        if (decoded?.role && decoded.role !== user.role) {
            return {
                error: errorResponse("Token role mismatch", {
                    status: 401,
                    errorCode: "ROLE_MISMATCH"
                })
            };
        }
        //authrized user
        return { user };

    } catch (err) {
        console.error("Auth middleware error:", err);
        return {
            error: errorResponse("Authentication failed", {
                status: 500,
                errorCode: "AUTH_FAILED"
            })
        };
    }
}

export function requireRole(requiredRole) {
    return (user) => {
        if (!user || user.role !== requiredRole) {
            return errorResponse("Access denied", {
                status: 403,
                errorCode: "FORBIDDEN"
            });
        }

        return null;
    };
}
