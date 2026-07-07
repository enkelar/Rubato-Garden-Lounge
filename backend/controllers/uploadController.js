import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL} from '../services/r2Client.js';

const ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

export const getImageUploadUrl = async (req, res) => {
    try{
        if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
            return res.status(500).json({ error: 'R2 is not configured on the server.' });
        }

        const { contentType } = req.body;
        const extension = ALLOWED_TYPES[contentType];

        if(!extension){
            return res.status(400).json({
                message: 'Unsupported image type. Use JPEG, PNG, WEBP, or GIF'
            });
        }

        const key = `products/${crypto.randomUUID()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const uploadURL = await getSignedUrl(r2Client, command, {expiresIn: 300}); 

        res.status(200).json({
            uploadURL,
            publicUrl: `${R2_PUBLIC_URL}/${key}`,
        });
    } catch (error){
        res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
    }
}