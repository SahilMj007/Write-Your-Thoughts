import cookieParser from "cookie-parser";
import express from "express";
import userRouter from "./router/user.router.js";
import cors from "cors";
import articleRouter from "./router/article.router.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/article", articleRouter);
export default app;
