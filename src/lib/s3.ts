import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  key: string,
  body: Buffer | string,
  contentType: string,
): Promise<string> {
  const Bucket = process.env.AWS_S3_BUCKET!;

  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
