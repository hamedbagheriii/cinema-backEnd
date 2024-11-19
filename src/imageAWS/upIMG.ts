import {  PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3Client';

export class imgAWC {
  async uploadImage(file: any, Bucket: string) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'هیچ فایلی ارسال نشده است .',
        };
      }

      // convert file to buffer =>
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // upload settings for s3 =>
      const fileName = `${Date.now()}-${file.name}`;
      const uploadParams: any = {
        Bucket,
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: file.type,
      };

      // upload file to s3 =>
      await s3Client.send(new PutObjectCommand(uploadParams));

      // create url for file =>
      const fileUrl = `https://cinemaproject.s3.ir-thr-at1.arvanstorage.ir/${Bucket}/${uploadParams.Key}`;

      return {
        success: true,
        message: 'آپلود عکس موفقیت‌ آمیز بود .',
        fileUrl,
      };
    } 
    catch (error) {
      return {
        success: false,
        message: 'خطا در آپلود فایل .',
        error,
      };
    }
  }
}

export const imgAwcClass = new imgAWC();
