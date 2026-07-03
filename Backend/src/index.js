import dotenv from "dotenv";
import { connectDb } from "./db/index.js";
import app from "./app.js";
dotenv.config({
  path: "./.env",
});
connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8005, () => {
      console.log(`Server Running On http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`There is Some Error while Connecting DB : ${err}`);
  });
