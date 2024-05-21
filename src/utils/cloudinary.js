
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from 'dotenv';

dotenv.config();  

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET,

})

const uploadOnCloudinary = async (localFilePath)=>{
    // console.log("avtar are comes from controllers",localFilePath)
      // Replace backslashes with forward slashes in file path
    const cloudinaryFilePath = localFilePath.replace(/\\/g, '/');
   

try {
    if(!cloudinaryFilePath) return null
    //upload file on cloudinay
    const response =await cloudinary.uploader.upload
       (cloudinaryFilePath,{
        resource_type:"auto"
       })
       console.log("file is uploaded on cloudinary",response.url );
       return response;
} 
catch (error) {
    // fs.unlink(cloudinaryFilePath)  
    //  remove locally file tempary upload
           console.error("Error uploading file to ....Cloudinary:", error);

     return null;
}

}

export {uploadOnCloudinary}
