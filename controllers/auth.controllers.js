import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const login =  asyncHandler( async (req,res)=> {
  return res
  .status(200)
  .json(new apiResponse(200, "OK", "you have hit the login point"))
})

const signup =  asyncHandler( async (req,res)=> {
  return res
  .status(200)
  .json(new apiResponse(200, "OK", "you have hit the signup point"))
})

const logout =  asyncHandler( async (req,res)=> {
  return res
  .status(200)
  .json(new apiResponse(200, "OK", "you have hit the logout point"))
})

export { login, signup, logout};
