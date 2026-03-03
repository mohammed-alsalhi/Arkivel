import { put, del } from "@vercel/blob";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// ---------------------------------------------------------------------------
// Storage provider interface
// ---------------------------------------------------------------------------

export interface StorageProvider {
  /** Upload a file buffer and return its public URL. */
  upload(
    file: Buffer,
    filename: string,
    contentType: string
  ): Promise<{ url: string }>;

  /** Delete a previously-uploaded file by its URL (or key). */
  delete(url: string): Promise<void>;

  /** Return a time-limited signed URL for private access. */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

// ---------------------------------------------------------------------------
// Vercel Blob implementation
// ---------------------------------------------------------------------------

class VercelBlobStorage implements StorageProvider {
  async upload(
    file: Buffer,
    filename: string,
    contentType: string
  ): Promise<{ url: string }> {
    const blob = await put(filename, file, {
      access: "public",
      contentType,
    });
    return { url: blob.url };
  }

  async delete(url: string): Promise<void> {
    await del(url);
  }

  async getSignedUrl(key: string): Promise<string> {
    // Vercel Blob URLs are already public; return the key as-is.
    return key;
  }
}

// ---------------------------------------------------------------------------
// S3-compatible implementation (AWS S3, Cloudflare R2, MinIO, etc.)
// ---------------------------------------------------------------------------

class S3Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const region = process.env.S3_REGION || "auto";
    const endpoint = process.env.S3_ENDPOINT || undefined;

    this.bucket = process.env.S3_BUCKET || "";
    if (!this.bucket) {
      throw new Error("S3_BUCKET environment variable is required for S3 storage provider");
    }

    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint } : {}),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async upload(
    file: Buffer,
    filename: string,
    contentType: string
  ): Promise<{ url: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: file,
        ContentType: contentType,
      })
    );

    // Build the public URL. If a custom endpoint is configured (e.g. R2
    // public bucket URL) use it; otherwise fall back to standard S3 URL.
    const endpoint = process.env.S3_ENDPOINT;
    const url = endpoint
      ? `${endpoint.replace(/\/$/, "")}/${this.bucket}/${filename}`
      : `https://${this.bucket}.s3.${process.env.S3_REGION || "us-east-1"}.amazonaws.com/${filename}`;

    return { url };
  }

  async delete(url: string): Promise<void> {
    // Extract the object key from the full URL.
    const key = this.extractKey(url);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return awsGetSignedUrl(this.client, command, { expiresIn });
  }

  /** Extract the S3 object key from a full URL or return as-is if already a key. */
  private extractKey(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove leading slash from pathname
      return parsed.pathname.replace(/^\//, "");
    } catch {
      // Not a valid URL — assume it's already a key
      return url;
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let cachedProvider: StorageProvider | null = null;

/**
 * Return the configured storage provider singleton.
 *
 * Set `STORAGE_PROVIDER=s3` to use S3-compatible storage.
 * Defaults to Vercel Blob.
 */
export function getStorage(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  const provider = process.env.STORAGE_PROVIDER || "vercel-blob";

  if (provider === "s3") {
    cachedProvider = new S3Storage();
  } else {
    cachedProvider = new VercelBlobStorage();
  }

  return cachedProvider;
}
