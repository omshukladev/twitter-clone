import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"


//generating method for acces and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
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

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

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
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  //sending response to the user
  return res.status(201).json(new apiResponse(201, {user: createdUser,
    accessToken,
    refreshToken}, "User registered successfully "));
});

//logout

const logout = asyncHandler(async (req, res) => {
  try {
    // Check if the cookies exist
    const accessTokenCookie = req.cookies.accessToken;
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!accessTokenCookie || !refreshTokenCookie) {
      return res.status(400).json(new apiResponse(400, {}, "No active session to log out from"));
    }

    // Clear the cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json(new apiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


//this below is the alternative if above logout didint work use this one 


//  const logout =  asyncHandler( async (req,res)=> {

//   const options = {
//     httpOnly: true,
//     secure: true, // Make sure you set this correctly based on your environment (production or development)
//   };
// return res
// .status(200)
// .clearCookie("accessToken", options)
// .clearCookie("refreshToken", options)
// .json(new apiResponse(201, {}, "User logged Out"))
// }) 


// to check user is authinti cated or not

const  getMe =  asyncHandler( async (req,res)=> {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new apiError(404, "User not found getME");
  }

  return res.status(200).json(
    new apiResponse(200, user, "Getme called")
  );
});


export { login, signup, logout, getMe};
