import AWS from 'aws-sdk';
import config from "../configs/config.js";
import catcher from '../utils/catcher.js';

const StreamController = {
    stream: catcher(async(req, res) => {
        const { key } = req.params; // S3 object key should be passed as a route parameter

        if (!key) {
            return res.status(400).send('Missing "key" query parameter');
        }
        AWS.config.update({
            accessKeyId: config.s3AccessKey,
            secretAccessKey: config.s3SecretKey,
            region: config.s3Region // Example: 'us-east-1'
        });
        const s3 = new AWS.S3()

        const fileKey = key;

        const params = {
            Bucket: config.s3BucketName,
            Key: fileKey
          };

          const headData = await s3.headObject(params).promise();
          const { ContentLength, ContentType } = headData;
  
          res.set('Content-Type', ContentType);
  
          // Handle range requests for streaming
          const range = req.headers.range;
  
          if (range) {
              const start = Number(range.replace(/\D/g, ''));
              const end = ContentLength - 1;
  
              const rangeParams = {
                  ...params,
                  Range: `bytes=${start}-${end}`
              };
  
              const s3Data = await s3.getObject(rangeParams).promise();
              res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${ContentLength}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': s3Data.Body.length,
                  'Content-Type': ContentType,
              });
              res.end(s3Data.Body);
          } else {
              const s3Data = await s3.getObject(params).promise();
              res.set('Content-Length', ContentLength);
              res.end(s3Data.Body);
          }
    })
};

export default StreamController;