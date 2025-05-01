import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
    }
});

export const uploadToS3 = async (file) => {
    try {
        // Validate credentials
        if (!import.meta.env.VITE_AWS_ACCESS_KEY_ID || !import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
            console.error('AWS Credentials Check:', {
                accessKeyExists: Boolean(import.meta.env.VITE_AWS_ACCESS_KEY_ID),
                secretKeyExists: Boolean(import.meta.env.VITE_AWS_SECRET_ACCESS_KEY)
            });
            throw new Error('AWS credentials are missing');
        }

        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;

        const params = {
            Bucket: 'hubridgeimages',
            Key: fileName,
            Body: file,
            ContentType: file.type || 'application/octet-stream'
        };

        console.log('Uploading with params:', {
            Bucket: params.Bucket,
            Key: params.Key,
            ContentType: params.ContentType
        });

        const result = await s3Client.send(new PutObjectCommand(params));
        
        console.log('Upload successful:', result);
        
        return {
            success: true,
            url: `${import.meta.env.VITE_AWS_ACCESS_LINK}${fileName}`
        };
    } catch (error) {
        console.error('Upload error details:', {
            message: error.message,
            stack: error.stack,
            credentials: {
                accessKeyExists: Boolean(import.meta.env.VITE_AWS_ACCESS_KEY_ID),
                secretKeyExists: Boolean(import.meta.env.VITE_AWS_SECRET_ACCESS_KEY)
            }
        });
        return {
            success: false,
            error: error.message
        };
    }
};