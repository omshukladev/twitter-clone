import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Post } from "../models/post.model.js";
import { cloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req,res)=>{
  const {text} = req.body;
  let {img} =req.body;

  const userId=req.user._id.toString();

  let user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "Username does not exist");
  }

  if(!text && !img){
    throw new apiError(404, "Post must have text or image");
  }

  // Must have either text or image
  if (!text && !img) {
    throw new apiError(400, "Post must contain text or an image");
  }

  // Handle image upload if image file is provided
    if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    if (uploadedResponse?.secure_url) {
      img = uploadedResponse.secure_url;
    }
  }

  

  const newPost = new Post({
			user: userId,
			text,
			img,
		});
    await newPost.save();

    return res.status(200).json(new apiResponse(201, newPost, "User Posted Successfully"));
})

export {createPost}
