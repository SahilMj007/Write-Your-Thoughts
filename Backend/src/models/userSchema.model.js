import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, lowerCase: true },
    userName: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
    },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 12);
  next;
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return JWT.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      userName: this.userName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    },
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return JWT.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    },
  );
};
export const User = mongoose.model("User", userSchema);
