import { Router } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", userRegisterValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/refresh-token", refreshToken);
router.post(
  "/forgot-password",
  userForgotPasswordValidator(),
  validate,
  forgotPassword,
);
router.post(
  "/reset-password",
  userResetPasswordValidator(),
  validate,
  resetPassword,
);
router.get(
  "/change-password",
  userChangePasswordValidator(),
  validate,
  authMiddleware,
  changePassword,
);
export default router;
