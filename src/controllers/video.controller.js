import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.find({}).populate("owner")
    .sort({[sortBy]: "asc"})
    .skip((page - 1) * limit)
    .limit(limit)
    .exec()

   return res
   .status(200)
   .json(new ApiResponse(videos, "Videos fetched successfully"))
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video


    if (!title || !description ) {
        throw new ApiError(400, "Please provide title and description");
    }

    const videoFile = req.files.videoFile ? req.files.videoFile[0].path : null;
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0].path : null;

    if (!videoFile || !thumbnailFile) {
        throw new ApiError(400, "Video file or thumbnail is missing");
    }

    // Upload video file to Cloudinary
    const videoUploadResult = await uploadOnCloudinary(videoFile);
    if (!videoUploadResult) {
        throw new ApiError(500, "Error uploading video file to Cloudinary");
    }
 // Get video duration from Cloudinary response
 const { duration } = videoUploadResult;


    // Upload thumbnail to Cloudinary
    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailFile);
    if (!thumbnailUploadResult) {
        throw new ApiError(500, "Error uploading thumbnail to Cloudinary");
    }

    // Create a new video document
    const video = await Video.create({
        videofile: videoUploadResult.secure_url,
        thumbnail: thumbnailUploadResult.secure_url,
        title,
        description,
        duration,
        owner: req.user._id // Assuming req.user contains the authenticated user
    });

    return res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate the videoId
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    try {
        // Find the video by ID
        const video = await Video.findById(videoId).populate('owner', 'fullname username avatar');

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Return the video
        return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "An error occurred while fetching the video");
    }


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    try {
        // Find the video by ID
        const video = await Video.findById(videoId).populate('owner', 'fullname username avatar');

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        video.title = title || video.title;
        video.description = description || video.description;


 // Check if a new thumbnail file is uploaded
 if (req.files && req.files.thumbnail) {
    const thumbnailLocalPath = req.files.thumbnail[0].path;
    const uploadResult = await uploadOnCloudinary(thumbnailLocalPath);
    
    if (uploadResult && uploadResult.url) {
        video.thumbnail = uploadResult.url;
    } else {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }
}
        const updatedVideo = await video.save();

        return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
   
    }
    catch(error){
        throw new ApiError(500, "An error occurred while fetching the video for update..");
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

        // Delete the video file and thumbnail from Cloudinary
        try {
            // Find the video by ID
            const video = await Video.findById(videoId).populate('owner', 'fullname username avatar');
    
            // Check if the video exists
            if (!video) {
                throw new ApiError(404, "Video not found");
            }
    
            // Log details of the video to be deleted
            console.log(`Deleting video with ID: ${videoId}, Title: ${video.title}`);
    
            // Delete the video file and thumbnail from Cloudinary
            try {
                if (video.videofile) {
                    console.log(`Deleting video file from Cloudinary: ${video.videofile}`);
                    await cloudinary.uploader.destroy(video.videofile, { resource_type: "video" });
                }
                if (video.thumbnail) {
                    console.log(`Deleting thumbnail from Cloudinary: ${video.thumbnail}`);
                    await cloudinary.uploader.destroy(video.thumbnail);
                }
            } catch (cloudinaryError) {
                console.error("Error deleting files from Cloudinary:", cloudinaryError);
                throw new ApiError(500, "An error occurred while deleting files from Cloudinary");
            }
    
            // Delete the video document from MongoDB
            await Video.findByIdAndDelete(videoId);
            console.log(`Video with ID: ${videoId} deleted from MongoDB`);
    
            return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
        } catch (error) {
            console.error("Error deleting the video:", error);
            throw new ApiError(500, "An error occurred while deleting the video");
        }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}