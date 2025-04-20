import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"


//generating method for acces and refresh token
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Something went wrong while generating referesh and access token");
  }
};


const login =  asyncHandler( async (req,res)=> {
  return res
  .status(200)
  .json(new apiResponse(200, "OK", "you have hit the login point"))
})


//signup


const signup =  asyncHandler( async (req,res)=> {
  const { fullName, email, username, password } = req.body;
  // console.log("name: ", fullName);
  // console.log("email: ", email);
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All Field Are Required");
  }
  //check email structure 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

    const existedUser = await User.findOne({
      //taking username or password form users in schema
      $or: [{ username }, { email }],
    });
    if (existedUser) {
      throw new apiError(409, "User with username or email already exists");
    }
    //local storage - cloudinary work soon

    //entry in db by object
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });
  //finding user are created or not and removing password and refresh token
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new apiError(500, "something went wrong while registering the user ");
  }
  //  generate tokens here
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  //sending response to the user
  return res.status(201).json(new apiResponse(201, {user: createdUser,
    accessToken,
    refreshToken}, "User registered successfully "));
});


const logout =  asyncHandler( async (req,res)=> {
  return res
  .status(200)
  .json(new apiResponse(200, "OK", "you have hit the logout point"))
})

export { login, signup, logout};
