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

//login
const login =  asyncHandler( async (req,res)=> {
  const { username, password } = req.body;
  

  if (!username) {
    throw new apiError(400, "username required");
  }
  const user = await User.findOne({ username });
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true, //frontend cant interfear now 
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        201,
        {
          //we are sending the respon if the user want to save it in local storage --this all is data in apiresponse
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
})


//signup
const signup =  asyncHandler( async (req,res)=> {
  const { fullName, email, username, password } = req.body;
  
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

//logout
const logout =  asyncHandler( async (req,res)=> {
  return res
  .status(200)
  .json(new apiResponse(200, "OK", "you have hit the logout point"))
})

export { login, signup, logout};
