
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
 // Log cookies and headers for debugging
//  console.log("Cookies:", req.cookies);
//  console.log("Headers:", req.headers);

        //  const token = req.cookies?.accessToken || req.headers
        //      ("Authorization")?.replace("Bearer", "");

        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "").trim();


        console.log(token, " >>>token gives data")
        if (!token) {
            throw new ApiError(401, "Unauthorizes request...!")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
            .select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, " Invalid Access Token")
        }

        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid acess Token")
    }
})