import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  getAllArticle,
  getArticle,
  publishArticle,
  updateArticle,
} from "../controller/article.controller.js";

const articleRouter = express.Router();

articleRouter.post(
  "/publishArticle",
  upload.single("thumbnail"),
  verifyJWT,
  publishArticle,
);

articleRouter.get("/getAllArticles", verifyJWT, getAllArticle);
articleRouter.get("/getArticle/:articleId", verifyJWT, getArticle);
articleRouter.post(
  "/updateArticle/:articleId",
  upload.single("thumbnail"),
  verifyJWT,
  updateArticle,
);

export default articleRouter;
