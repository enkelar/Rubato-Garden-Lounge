import crypto from 'crypto'; // for generatin random file names
import { PutObjectCommand } from '@aws-sdk/client-s3'; // AWS SDK command used to create an upload request to S3/R2 
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'; // helper - creates temporary signed upload URL
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL} from '../services/r2Client.js';

// allowed image types & extensions
const ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

// Generate a signed URL for uploading an image
export const getImageUploadUrl = async (req, res) => {
    try{
        // make sure R2 is configured on the server
        if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
            return res.status(500).json({ error: 'R2 is not configured on the server.' });
        }

        const { contentType } = req.body;
        const extension = ALLOWED_TYPES[contentType]; // convert content type to a file extension

        // reject unsupported image formats
        if(!extension){
            return res.status(400).json({
                message: 'Unsupported image type. Use JPEG, PNG, WEBP, or GIF'
            });
        }

        // create unique file key inside the products folder
        const key = `products/${crypto.randomUUID()}.${extension}`;

        // build the S3/R2 upload command
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        // create temporary signed URL valid for 5 minutes
        const uploadURL = await getSignedUrl(r2Client, command, {expiresIn: 300}); 

        res.status(200).json({
            uploadURL,
            publicUrl: `${R2_PUBLIC_URL}/${key}`,
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
    }
}