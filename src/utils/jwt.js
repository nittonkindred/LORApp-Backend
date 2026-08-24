import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };
  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
  };
  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};
