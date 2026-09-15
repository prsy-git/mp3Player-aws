import 'dotenv/config';
import {
    DeleteObjectCommand,
    HeadObjectCommand,
    PutObjectCommand
} from '@aws-sdk/client-s3';
import s3, { S3_BUCKET_NAME } from '../storage/s3.js';

const testKey = 'songs/sdk-test.txt';

async function testS3() {
    try {
        console.log('Uploading test object...');

        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: testKey,
                Body: 'MP3 Player SDK test',
                ContentType: 'text/plain'
            })
        );

        console.log('Upload succeeded.');

        console.log('Checking test object...');

        await s3.send(
            new HeadObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: testKey
            })
        );

        console.log('Object exists in S3.');

        console.log('Deleting test object...');

        await s3.send(
            new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: testKey
            })
        );

        console.log('Delete succeeded.');
        console.log('S3 SDK test completed successfully.');
    } catch (error) {
        console.error('S3 SDK test failed:', error);
        process.exitCode = 1;
    }
}

testS3();