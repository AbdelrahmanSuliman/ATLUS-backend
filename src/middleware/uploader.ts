import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3 } from './s3'; 

const bucketName = process.env.AWS_BUCKETNAME!;

export const upload = multer({
    storage: multerS3({
        s3,
        bucket: bucketName,
        acl: 'public-read',
        metadata: function(req, file, cb){
            cb(null, { fieldName: file.fieldname})
        },
        key: function(req, file, cb){
           cb(null, `uploads/${Date.now().toString()}_${file.originalname}`);
        }
    })
})
