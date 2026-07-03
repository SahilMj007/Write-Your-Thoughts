import { Article } from "../models/articleSchema.model.js";
import ApiError from "../utils/apiErrorHandler.js";
import ApiResponse from "../utils/apiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const publishArticle = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    throw new ApiError(401, "Title And Content Both are Required");
  }

  const thumbnail = req.file?.path;
  if (!thumbnail) {
    throw new ApiError(401, "Thumbnail is Missing");
  }

  const thumbnailUrl = await uploadOnCloudinary(thumbnail);
  if (!thumbnailUrl) {
    throw new ApiError(
      500,
      `There is Some Error While Getting Response From Cloudinary`,
    );
  }

  const article = await Article.create({
    title,
    content,
    thumbnail: thumbnailUrl?.secure_url,
    createdBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { article }, "Article Created Succefully"));
});

export const getAllArticle = asyncHandler(async (req, res) => {
  const { page = 1, limit = 4 } = req.query;

  const articles = await Article.paginate(
    {},
    { page, limit, sort: { createdAt: -1 } },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { articles }, "Getting Articles"));
});

export const getArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  if (!articleId) throw new ApiError(401, "Article Id is Required");

  const article = await Article.findById(articleId).select(
    "title content thumbnail createdAt",
  );
  if (!article) throw new ApiError(401, "Article Not Found");

  return res
    .status(201)
    .json(new ApiResponse(201, article, "Article Get Succesufully"));
});

export const updateArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const { title, content, isPublic } = req.body;
  if (!title || !content) {
    throw new ApiError(401, "Title and Content Required");
  }

  const data = {
    title,
    content,
    isPublic,
  };

  const thumbnail = req.file?.path;
  if (thumbnail) {
    const thumbnailUrl = await uploadOnCloudinary(thumbnail);
    if (!thumbnailUrl) {
      throw new ApiError(
        401,
        "There is Some Error Getting Response From Cloudinary",
      );
    }
    data.thumbnail = thumbnailUrl?.secure_url;
  }

  console.time("MongoDB");
  const updatedArticle = await Article.findByIdAndUpdate(articleId, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!updatedArticle) throw new ApiError(401, "Article not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedArticle, "Article Updated Succefully"));
});
