import { OTP } from "../models/otpSchema.model.js";
import { User } from "../models/userSchema.model.js";
import ApiResponse from "../utils/apiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiErrorHandler.js";
import { sendMail } from "../utils/sendMail.js";

export const OtpController = asyncHandler(async (req, res) => {
  const { email, userName } = req.body;
  if (!email && !userName) {
    throw new ApiError(401, "Email & UserName is Required");
  }
  const user = await User.findOne({ $or: [{ userName }, { email }] });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const userEmail = user?.email || email;

  await OTP.findOneAndDelete({ email: userEmail });

  const OtpDetails = await OTP.create({
    email: userEmail,
    otp,
    expireTime: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendMail(userEmail, otp);
  return res.status(200).json(new ApiResponse(200, { OtpDetails }, "OTP Send"));
});
