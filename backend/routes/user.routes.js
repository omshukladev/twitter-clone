import express from "express"
//importing controllers 
import { getUserProfile } from "../controllers/user.controllers.js";
import {followUnfollowUser} from "../controllers/user.controllers.js"
import { getSuggestedProfile } from "../controllers/user.controllers.js";

//middleware
import { protectRoute } from "../middlewares/auth.middleware.js"

const router =express.Router();

router.route("/profile/:username").get(protectRoute,getUserProfile)
router.route("/suggested").get(protectRoute,getSuggestedProfile)
router.route("/follow/:id").post(protectRoute,followUnfollowUser)
// router.route("/update").post(protectRoute,updateUser)



export default router;