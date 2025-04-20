import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true, 
			lowercase: true,
			index: true
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		profileImg: {
			type: String,
			default: "",
		},
		coverImg: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},

		link: {
			type: String,
			default: "",
		},
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
		refreshToken: {
			type: String,
			default: "",
		},		
	},
	{ timestamps: true }
);


//bycrpyt 

//just save hone se phale use hota hai ye pre hook
// save ,validate , remove ,updateOne, deleteOne , init

userSchema.pre("save", async function (next) {

	//jab mai passowrd update karu tab hi chale ye code 
	//basically agar modified nahi hua toh niklo yaha se otherwise run karo code 
	if(!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 10)
	//it takes password hash it 10 times 
	next()
})
// custom methods password comprare kar ke true ya false bhej dega
userSchema.methods.isPasswordCorrect = async function(password){
	return await bcrypt.compare(password, this.password)
	//password - client ka hai this.password - ye increpyt wala do db ke pass hai
}

//jsonwebtoken 
//jwt hamara ek brear token hai it is a type of key  
userSchema.methods.generateAccessToken = function(){
	return jwt.sign(
			{
					_id: this._id, //this._id is from mongo db 
					email: this.email,
					username: this.username,
					fullName: this.fullName
			},
			process.env.ACCESS_TOKEN_SECRET,
			{
					expiresIn: process.env.ACCESS_TOKEN_EXPIRY
			}
	)
}
userSchema.methods.generateRefreshToken = function(){
	return jwt.sign(
			{
					_id: this._id,
					
			},
			process.env.REFRESH_TOKEN_SECRET,
			{
					expiresIn: process.env.REFRESH_TOKEN_EXPIRY
			}
	)
}
export const User = mongoose.model("User", userSchema);
