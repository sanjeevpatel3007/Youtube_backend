import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinay } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    //detais from frontend
    const { fullname, email, username, password } = req.body;
    // validation ,, input will not empty
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // check user are exist are not
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath= req.files.avatar[0]?.path
    const coverImageLocalPath= req.files.coverImage[0]?.path

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required")
  }

const avatar= await uploadOnCloudinay(avatarLocalPath)
const coverImage= await uploadOnCloudinay(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400, "Avatar is required")
}

 const user =await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})
const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user ....")
}

return res.status(201).json(
    new ApiResponse(200, createdUser,"User registered successfullty")
)


})







export { registerUser };