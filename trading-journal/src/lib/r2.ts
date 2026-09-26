import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const r2 = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Returns a presigned PUT URL valid for 5 minutes.
 * The browser uploads directly to R2 — never through the server.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2, command, { expiresIn: 300 });
}

/**
 * Returns the public URL for a stored object.
 * R2_PUBLIC_URL is either the r2.dev subdomain or a custom domain,
 * e.g. https://pub-xxxx.r2.dev or https://charts.yourdomain.com
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Generates a scoped key: charts/{userId}/{nanoid}.{ext}
 * Scoping by userId allows future bucket policies to enforce ownership.
 */
export function generateChartKey(userId: string, ext: string): string {
  return `charts/${userId}/${nanoid()}.${ext}`;
}
