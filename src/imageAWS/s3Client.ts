import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: 'default',
  endpoint: 'https://cinemaproject.s3.ir-thr-at1.arvanstorage.ir', 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
