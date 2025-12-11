import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "unauthorized" })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.json({
                message: "invalid token",
                success: false
            })
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log("Error in auth middleware", error);
    }
}