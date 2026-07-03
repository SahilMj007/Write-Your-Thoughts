import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, uppercase: true },
    content: { type: String, required: true, trim: true },
    thumbnail: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ArticleSchema.plugin(mongoosePaginate);

export const Article = mongoose.model("Article", ArticleSchema);
