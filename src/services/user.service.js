import prisma from "../db/prisma.js";

import ApiError from "../utils/api-error.js";

export const registerUser = async (userData) => {
  const { email, username, password } = userData;

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  // Create a new user

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password, // In a real application, make sure to hash the password before storing it
    },
  });
  return newUser;
};

export const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  // Check if the password matches
  if (user.password !== password) {
    throw new ApiError(401, "Invalid email or password");
  }

  return user;
};
