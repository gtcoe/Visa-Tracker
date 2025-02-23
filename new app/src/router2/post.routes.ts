import { Router } from "express";
import * as postCtrl from "../controller2/post.controller";
import validateToken from "./validateToken";

const router = Router();

router.post("/", validateToken, postCtrl.createPost);
router.get("/:id", postCtrl.getPost);
router.get("/", postCtrl.getPosts);
router.put("/:id", validateToken, postCtrl.updatePost);
router.delete("/:id", validateToken, postCtrl.deletePost);

export default router;
