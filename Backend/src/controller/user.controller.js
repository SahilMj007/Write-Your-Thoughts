import { OTP } from "../models/otpSchema.model.js";
import { User } from "../models/userSchema.model.js";
import ApiError from "../utils/apiErrorHandler.js";
import ApiResponse from "../utils/apiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import JWT from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();
    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });
    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(401, "There is Some Error While Generating Tokens");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, email, password, otp } = req.body;
  if (!fullName || !userName || !email || !password) {
    throw new ApiError(401, "All Fields are Required");
  }

  const exist = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (exist) throw new ApiError(409, "User Already Registered!");

  if (!otp) throw new ApiError(401, "OTP REQUIRED");

  const OtpValidator = await OTP.findOne({ email });

  if (OtpValidator.otp !== Number(otp)) {
    throw new ApiError(400, "Otp Not Valid");
  }

  const user = await User.create({
    fullName,
    userName,
    email,
    password,
  });

  const CreatedUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, CreatedUser, "User Created Succesfully"));
});

export const userLogin = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if (!email && !userName) {
    throw new ApiError(401, "Email Or userName is Required");
  }
  if (!password) throw new ApiError(401, "Password is Required");

  const exist = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!exist) throw new ApiError(401, "User Does Not exist");

  const passwordValidChecker = await exist.isPasswordCorrect(password);
  if (!passwordValidChecker) throw new ApiError(401, "Password is Incorrect");

  const { AccessToken, RefreshToken } = await generateAccessRefreshToken(
    exist._id,
  );

  const loggingUser = await User.findById(exist._id).select(
    "-password -refreshToken",
  );
  return res
    .status(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { AccessToken, RefreshToken, loggingUser },
        "User Login",
      ),
    );
});

export const userlogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { refreshToken: "" },
    },
    {
      returnDocument: "after",
    },
  );

  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, {}, "User Logout Succefully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new ApiError(401, "Unauthorised Request");

    const decodedValue = JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedValue._id).select("-password");
    if (!user) throw new ApiError(401, "Inavalid Token");

    if (user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid Token");
    }
    const { AccessToken, RefreshToken } = await generateAccessRefreshToken(
      user._id,
    );
    return res
      .status(200)
      .cookie("accessToken", AccessToken, options)
      .cookie("refreshToken", RefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { AccessToken, RefreshToken },
          "Access and Refresh Token Re-Isuued",
        ),
      );
  } catch (error) {
    throw new ApiError(
      401,
      `There is Some Error While Re-Generating Token :: ${error.message}`,
    );
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { userName, email, otp, currentPassword, oldPassword } = req.body;

  if (!userName && !email) {
    throw new ApiError(201, "Email or Username is Required");
  }
  const userExist = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!userExist) throw new ApiError(201, "User Not Exist");

  if (!otp) throw new ApiError(401, "Otp Required");

  if (!currentPassword && !oldPassword) {
    throw new ApiError(201, "Old & Current Password is Required");
  }

  const userEmail = userExist?.email;

  const otpDetails = await OTP.findOne({ email: userEmail });

  if (otpDetails?.otp != otp) {
    throw new ApiError(201, "Invalid Otp");
  }

  await OTP.findByIdAndDelete(otpDetails?._id);

  if (currentPassword === oldPassword) {
    throw new ApiError(401, "Use Different New Password");
  }

  const passwordValidChecker = await userExist.isPasswordCorrect(oldPassword);

  if (!passwordValidChecker) throw new ApiError(401, "Invalid Old Password");

  userExist.password = currentPassword;
  await userExist.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Forgot Successfully"));
});

export const currentUser = asyncHandler(async (req, res) => {
  const loginUser = await User.findById(req.user?._id).select(
    "-password -refreshToken -__v",
  );
  return res
    .status(200)
    .json(new ApiResponse(201, loginUser, "Current Login User"));
});

export const userUpdate = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (!fullName) throw new ApiError(401, "New Full Name is Required!");

  const loginUser = req.user?._id;

  const updatedUser = await User.findByIdAndUpdate(
    loginUser,
    { fullName },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!updatedUser) throw new ApiError(401, "User Not Exist");

  return res
    .status(201)
    .json(new ApiResponse(201, updatedUser, "User Updated Succefull"));
});
