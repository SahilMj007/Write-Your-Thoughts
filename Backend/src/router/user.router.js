import express from "express";
import {
  currentUser,
  forgotPassword,
  refreshAccessToken,
  registerUser,
  userLogin,
  userlogout,
  userUpdate,
} from "../controller/user.controller.js";
import { OtpController } from "../controller/otp.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/sendOtp", OtpController);
userRouter.post("/registerUser", registerUser);
userRouter.post("/login", userLogin);
userRouter.post("/logout", verifyJWT, userlogout);
userRouter.post("/reissueToken", verifyJWT, refreshAccessToken);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.get("/currentUser", verifyJWT, currentUser);
userRouter.post("/userUpdate", verifyJWT, userUpdate);

export default userRouter;
