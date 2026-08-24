import prisma from "../db/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import ApiError from "../utils/api-error.js";

export const registerUser = async (userData) => {
  const { email, username, password } = userData;

  // Check if the user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new ApiError(400, "Email or username already exists");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  // Create a new user

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash, // In a real application, make sure to hash the password before storing it
    },
  });
  const { passwordHash: _, ...safeUser } = newUser;

  return safeUser;
};

export const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email");
  }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  // Check if the password matches
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: refreshToken,
    },
  });
  const { passwordHash: _, ...safeUser } = user;

  return { ...safeUser, accessToken, refreshToken };
};
export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { passwordHash: _, ...safeUser } = user;

  return safeUser;
};

export const logoutUser = async (userId) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: null,
    },
  });

  return { message: "User logged out successfully" };
};

export const refreshToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "User not found");
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const { passwordHash: _, ...safeUser } = user;

    return {
      ...safeUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 3600000);

  return { token, hashedToken, expires };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { token, hashedToken, expires } = generateResetToken();

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    },
  });

  // You would send the reset token to the user's email address
  // For example, using a mail service like nodemailer or any other email service
  // sendResetEmail(user.email, token);
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });
};
