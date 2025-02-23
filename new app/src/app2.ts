import express from "express";
import morgan from "morgan";
import authRouter from "./router2/auth.routes";
import postRouter from "./router2/post.routes"
import config from "./config";

const app = express();

app.set("port", config.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
//router
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
export default app;
