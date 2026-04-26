import { v2 as cloudinary } from "cloudinary";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

export type MediaUploadProvider = "cloudinary" | "tigris" | "local";

type UploadInput = {
  storeId: string;
  fileName: string;
  contentType: string;
  dataBase64: string;
};

type UploadResult = {
  url: string;
  provider: MediaUploadProvider;
};
type UploadDeps = {
  cloudinaryUpload: (input: UploadInput, env: NodeJS.ProcessEnv) => Promise<UploadResult>;
  tigrisUpload: (input: UploadInput, env: NodeJS.ProcessEnv) => Promise<UploadResult>;
  localUpload: (input: UploadInput) => Promise<UploadResult>;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsRoot = resolve(__dirname, "../../uploads");

function readFirst(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export function resolveMediaProvider(env: NodeJS.ProcessEnv): MediaUploadProvider {
  const explicit = env.MEDIA_UPLOAD_PROVIDER?.trim().toLowerCase();
  if (explicit === "cloudinary" || explicit === "tigris" || explicit === "local") {
    return explicit;
  }
  if (readFirst(env.CLOUDINARY_URL, env.CLOUDINARY_CLOUD_NAME)) return "cloudinary";
  if (
    readFirst(env.TIGRIS_STORAGE_BUCKET, env.TIGRIS_BUCKET) &&
    readFirst(env.TIGRIS_STORAGE_ACCESS_KEY_ID, env.TIGRIS_ACCESS_KEY_ID) &&
    readFirst(env.TIGRIS_STORAGE_SECRET_ACCESS_KEY, env.TIGRIS_SECRET_ACCESS_KEY)
  ) {
    return "tigris";
  }
  return "local";
}

function normalizeObjectKey(fileName: string): string {
  return fileName.replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function resolveTigrisPublicBaseUrl(env: NodeJS.ProcessEnv): string {
  const publicUrl = readFirst(env.TIGRIS_STORAGE_PUBLIC_URL, env.TIGRIS_PUBLIC_BASE_URL);
  if (publicUrl) return publicUrl.replace(/\/+$/, "");
  const bucket = readFirst(env.TIGRIS_STORAGE_BUCKET, env.TIGRIS_BUCKET);
  if (bucket) return `https://${bucket}.t3.tigrisfiles.io`;
  throw new Error("Missing TIGRIS public URL and bucket");
}

export function buildTigrisPublicUrl(env: NodeJS.ProcessEnv, key: string): string {
  const base = resolveTigrisPublicBaseUrl(env);
  return `${base}/${normalizeObjectKey(key)}`;
}

async function uploadToCloudinary(
  input: UploadInput,
  env: NodeJS.ProcessEnv,
): Promise<UploadResult> {
  const cloudinaryUrl = env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    cloudinary.config(cloudinaryUrl);
  } else {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }
  const dataUri = `data:${input.contentType};base64,${input.dataBase64}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: `nepalix/${input.storeId}`,
    public_id: `${Date.now()}-${crypto.randomUUID()}`,
    resource_type: "image",
    overwrite: false,
  });
  if (!uploaded.secure_url) {
    throw new Error("Cloudinary upload failed");
  }
  return { url: uploaded.secure_url, provider: "cloudinary" };
}

async function uploadToTigris(input: UploadInput, env: NodeJS.ProcessEnv): Promise<UploadResult> {
  const endpoint =
    readFirst(env.TIGRIS_STORAGE_ENDPOINT, env.TIGRIS_ENDPOINT) ??
    "https://t3.storageapi.dev";
  const region = readFirst(env.TIGRIS_STORAGE_REGION, env.TIGRIS_REGION) ?? "auto";
  const bucket = readFirst(env.TIGRIS_STORAGE_BUCKET, env.TIGRIS_BUCKET);
  const accessKeyId = readFirst(
    env.TIGRIS_STORAGE_ACCESS_KEY_ID,
    env.TIGRIS_ACCESS_KEY_ID,
  );
  const secretAccessKey = readFirst(
    env.TIGRIS_STORAGE_SECRET_ACCESS_KEY,
    env.TIGRIS_SECRET_ACCESS_KEY,
  );
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Tigris credentials");
  }
  const safeExt = extname(input.fileName).replace(/[^a-zA-Z0-9.]/g, "") || ".bin";
  const key = `stores/${input.storeId}/${Date.now()}-${crypto.randomUUID()}${safeExt}`;

  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(input.dataBase64, "base64"),
      ContentType: input.contentType || "application/octet-stream",
    }),
  );
  return { url: buildTigrisPublicUrl(env, key), provider: "tigris" };
}

async function uploadToLocal(input: UploadInput): Promise<UploadResult> {
  const safeExt = extname(input.fileName).replace(/[^a-zA-Z0-9.]/g, "") || ".bin";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${safeExt}`;
  const storeDir = join(uploadsRoot, input.storeId);
  await mkdir(storeDir, { recursive: true });
  const filePath = join(storeDir, safeName);
  await writeFile(filePath, Buffer.from(input.dataBase64, "base64"));
  return {
    url: `/api/admin/media/files/${input.storeId}/${safeName}`,
    provider: "local",
  };
}

const defaultUploadDeps: UploadDeps = {
  cloudinaryUpload: uploadToCloudinary,
  tigrisUpload: uploadToTigris,
  localUpload: uploadToLocal,
};

export async function uploadMediaAssetWithEnv(
  input: UploadInput,
  env: NodeJS.ProcessEnv,
  deps: UploadDeps = defaultUploadDeps,
): Promise<UploadResult> {
  const provider = resolveMediaProvider(env);
  if (provider === "cloudinary") return deps.cloudinaryUpload(input, env);
  if (provider === "tigris") return deps.tigrisUpload(input, env);
  return deps.localUpload(input);
}

export async function uploadMediaAsset(input: UploadInput): Promise<UploadResult> {
  return uploadMediaAssetWithEnv(input, process.env);
}
