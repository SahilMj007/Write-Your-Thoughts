import JWT from "jsonwebtoken";
import ApiError from "../utils/apiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userSchema.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(400, "Unauthorised Request");

    const decodedValue = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedValue._id).select(
      "-password -refreshToken",
    );

    if (!user) throw new ApiError(401, "Invalid Token");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      400,
      `There is Some Error WHile Verify Token :: ${error.message}`,
    );
  }
});
