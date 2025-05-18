import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"

//we are taking username form url and finding their profile
const getUserProfile =  asyncHandler( async (req,res)=>{
  const {username} =req.params; //we have taken username it should be same as the route one :username

  const user = await User.findOne({ username }).select("-password -refreshToken -email -likedPosts -createdAt -updatedAt -__v");

  if (!user) {
    throw new apiError(404, "Username does not exist");
  }

   return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user,
        "Username Found  Successfully"
      )
    );
})

//we are maing follow and unfollow function in this function we will take id of current user and the user you want to follow and unfollow and modify both users id follow and unfollow 
const followUnfollowUser = asyncHandler(async (req,res)=>{
   const { id } = req.params;
   const userToModify = await User.findById(id);//find the user you have stored in id variable 
   const currentUser = await User.findById(req.user._id); //find the user you are currently logged in 

   //user cant follow them self 
   if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}
   //check if both user are present or not
    if (!userToModify || !currentUser) {
    throw new apiError(404, "User does not exist");
  }
  //It checks whether the current user is following another user, identified by id.
  //.includes(id): A method that checks if the id is present in the following array.
  const isFollowing = currentUser.following.includes(id);

  if(isFollowing){
    //unfollow the user
    //okojiojiojoviowcncnnconv
  }
  else{
    //follow the user 
  }
})

export {getUserProfile, followUnfollowUser}