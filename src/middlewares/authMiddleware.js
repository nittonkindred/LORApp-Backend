import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";
import prisma from "../db/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    let token;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Access token not found");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const { id, email, username } = decoded;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new ApiError(401, "User not found");
    }
    req.user = user;

    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};
