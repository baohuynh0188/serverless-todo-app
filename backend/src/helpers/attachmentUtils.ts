import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

const s3Client = new XAWS.S3({ signatureVersion: 'v4' });
const attachmentS3Bucket = process.env.ATTACHMENT_S3_BUCKET;
const signedUrlExpiration: number = +process.env.SIGNED_URL_EXPIRATION;

export const getSignedUrl = (todoId: string): string => {
    const params = {
        Bucket: attachmentS3Bucket,
        Key: todoId,
        Expires: signedUrlExpiration,
    };

    return s3Client.getSignedUrl('putObject', params);
};
