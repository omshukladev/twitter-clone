import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinary } from "../utils/cloudinary.js"; //alternative
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";

//we are taking username form url and finding their profile
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; //we have taken username it should be same as the route one :username

  const user = await User.findOne({ username }).select(
    "-password -refreshToken -email -likedPosts -createdAt -updatedAt -__v"
  );

  if (!user) {
    throw new apiError(404, "Username does not exist");
  }

  return res.status(200).json(new apiResponse(200, user, "Username Found  Successfully"));
});

//we are maing follow and unfollow function in this function we will take id of current user and the user you want to follow and unfollow and modify both users id follow and unfollow
const followUnfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userToModify = await User.findById(id); //find the user you have stored in id variable
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

  //push add , pull remove
  if (isFollowing) {
    //unfollow the user
    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    //This is a Mongoose method that finds a document by its _id (here, the variable id) and updates it with the given update operation.
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

    return res.status(200).json(new apiResponse(200, "User Unfollowed Successfully"));
  } else {
    //follow the user
    await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

    // to send notification you have to make notification model
    //Saves the notification to the MongoDB database using Mongoose. --basically it will send notification to mongoose db atlas
    const newNotification = new Notification({
      type: "follow",
      from: req.user._id, //follower
      to: userToModify._id, //followed
    });
    await newNotification.save();

    return res.status(200).json(new apiResponse(200, "User Followed  Successfully"));
  }
});

const getSuggestedProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const usersFollowedByMe = await User.findById(userId).select("following");

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId },
      },
    },

    { $sample: { size: 10 } },
    { $project: { password: 0 } }, // Hides password directly in DB query
  ]);
  const filteredUser = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
  const suggestedUser = filteredUser.slice(0, 4);

  suggestedUser.forEach((user) => (user.password = null));

  return res.status(200).json(new apiResponse(200, suggestedUser));
});

const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id; //Your ID is automatically attached to req.user by the middleware after login. You do not need to send it manually in your update request.

  let user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "Username does not exist");
  }

  if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
    throw new apiError(404, "Please provide both current password and new password");
  }
  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password); // comparing current password from db password
    if (!isMatch) {
      throw new apiError(404, "Current password is incorrect");
    }
    //hashing your new password
    // use this as hashing by model in user schema
    user.password = newPassword;
  }
  //upload it on cloudinary
  if (profileImg) {
    if (user.profileImg) {
      // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
      await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
    }

    const uploadedResponse = await cloudinary.uploader.upload(profileImg);
    profileImg = uploadedResponse.secure_url;
  }

  if (coverImg) {
    if (user.coverImg) {
      await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
    }

    const uploadedResponse = await cloudinary.uploader.upload(coverImg);
    coverImg = uploadedResponse.secure_url;
  }


  // it will take old values if not updated
  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  user.username = username || user.username;
  user.bio = bio || user.bio;
  user.link = link || user.link;
  user.profileImg = profileImg || user.profileImg;
  user.coverImg = coverImg || user.coverImg;

  user = await user.save();

  // password should be null in response
  user.password = null;

  return res.status(200).json(new apiResponse(201, user, "User updated Successfully"));
});

export { getUserProfile, followUnfollowUser, getSuggestedProfile, updateUser };

// ❓ Why do we create notifications?
// Notifications are created to inform users about important actions or events that involve them. In your case, you're building a social feature (like on Instagram, Twitter, etc.), so notifications keep users engaged and aware of interactions.
