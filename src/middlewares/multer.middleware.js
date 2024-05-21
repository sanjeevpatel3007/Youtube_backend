
import multer from "multer"

const storage =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'\public')
    },

    filename: function(req,file,cd){
        cd(null, file.originalname)
    }
}) 

export const upload =multer({
    storage
})