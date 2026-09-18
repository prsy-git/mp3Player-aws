import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';

const region = process.env.AWS_REGION || 'us-west-2';

const credentials = process.env.AWS_PROFILE
  ? fromIni({
      profile: process.env.AWS_PROFILE
    })
  : undefined;

const s3 = new S3Client({
  region,
  ...(credentials ? { credentials } : {})
});

export const S3_BUCKET_NAME = 'mp3-player-audio-2921041';

export default s3;