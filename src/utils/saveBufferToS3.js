import config from '../configs/config.js';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import logger from '../configs/loggers.js';




const s3Client = new S3Client({
    region: config.s3Region, // e.g., 'us-west-2'
    credentials: {
      accessKeyId: config.s3AccessKey,
      secretAccessKey: config.s3SecretKey
    }
  });


  export const uploadBufferToS3 = async (buffer, originalName) => {
    const microsecond = new Date().getTime();
    const randomChars = Math.random().toString(36).substring(2, 7);
    const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
    const truncatedName = originalName.substring(0, Math.min(15, originalName.length - (fileExtension.length + 1)));
    const Key = `${microsecond}${randomChars}${truncatedName}${fileExtension}`;
  
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: config.s3BucketName,
        Key,
        Body: buffer, // Directly using the buffer here
        ACL: 'public-read' // Make the file publicly accessible
      }
    });
  
    try {
      const result = await upload.done();
      logger.info('Upload successful:', result);
      return result; // Return the result of the upload
    } catch (err) {
      logger.error('Upload failed:', err);
      throw err; // Throw the error for proper error handling
    }
  };
  

export default uploadBufferToS3;
