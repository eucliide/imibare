"use server";

import { getCurrentUser } from "@/lib/auth";
import { generateChartKey, getPresignedUploadUrl, getPublicUrl } from "@/lib/r2";
import { redirect } from "next/navigation";
import { z } from "zod";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const EXT_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const uploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  fileType: z.enum(ALLOWED_TYPES),
});

type UploadUrlResult =
  | { uploadUrl: string; key: string; publicUrl: string; error?: never }
  | { error: string; uploadUrl?: never; key?: never; publicUrl?: never };

export async function getUploadUrl(
  fileName: string,
  fileType: string
): Promise<UploadUrlResult> {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = uploadSchema.safeParse({ fileName, fileType });
  if (!parsed.success) {
    return { error: "Invalid file type. Only PNG, JPG, and WebP are allowed." };
  }

  const ext = EXT_MAP[parsed.data.fileType];
  const key = generateChartKey(user.id, ext);

  try {
    const uploadUrl = await getPresignedUploadUrl(key, parsed.data.fileType);
    const publicUrl = getPublicUrl(key);
    return { uploadUrl, key, publicUrl };
  } catch (err) {
    console.error("R2 presign error:", err);
    return { error: "Could not generate upload URL. Try again." };
  }
}
