import express from "express"
//importing controllers 


//middleware
import { protectRoute } from "../middlewares/auth.middleware.js"

const router =express.Router();

router.route("/create").get(protectRoute,createPost)
// router.route("/like/:id").get(protectRoute,likeUnlikePost)
// router.route("/comment/:id").post(protectRoute,commentOnPost)
// router.route("/").delete(protectRoute,deletePost)



export default router;