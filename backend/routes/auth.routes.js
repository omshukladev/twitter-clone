import express from "express"
import { login, logout, signup, getMe } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js"


const router =express.Router();


router.route("/login").post(login);

router.route("/signup").post(signup);

router.route("/logout").post(logout);

router.route("/me").get(protectRoute, getMe);



// router.get("/signup",(req,res)=>{
//   res.json({
//     data:"You have hit the signup endpoint"
//   });
// });


// router.get("/login",(req,res)=>{
//   res.json({
//     data:"You have hit the login endpoint"
//   });
// });

// router.get("/logout",(req,res)=>{
//   res.json({
//     data:"You have hit the logout endpoint"
//   });
// });

export default router;