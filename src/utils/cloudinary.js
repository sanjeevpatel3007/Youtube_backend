
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
   

try {
    if(!localFilePath) return null
    //upload file on cloudinay
    const response =await cloudinary.uploader.upload
       (localFilePath,{
        resource_type:"auto"
       })
    //    console.log("file is uploaded on cloudinary",response.url );
    fs.unlinkSync(localFilePath)
       return response;

} 
catch (error) {
    fs.unlinkSync(localFilePath)   //  remove locally file tempary upload
           console.error("Error uploading file to ....Cloudinary:", error);

     return null;
}

}

export {uploadOnCloudinary}
