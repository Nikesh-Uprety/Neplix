import { describe, expect, it } from "vitest";
import {
  buildTigrisPublicUrl,
  resolveMediaProvider,
  uploadMediaAssetWithEnv,
} from "./media-upload.js";

describe("resolveMediaProvider", () => {
  it("respects explicit MEDIA_UPLOAD_PROVIDER", () => {
    expect(resolveMediaProvider({ MEDIA_UPLOAD_PROVIDER: "cloudinary" } as NodeJS.ProcessEnv)).toBe(
      "cloudinary",
    );
    expect(resolveMediaProvider({ MEDIA_UPLOAD_PROVIDER: "tigris" } as NodeJS.ProcessEnv)).toBe(
      "tigris",
    );
    expect(resolveMediaProvider({ MEDIA_UPLOAD_PROVIDER: "local" } as NodeJS.ProcessEnv)).toBe(
      "local",
    );
  });

  it("prefers cloudinary when CLOUDINARY_URL is present", () => {
    expect(
      resolveMediaProvider({
        CLOUDINARY_URL: "cloudinary://k:s@c",
      } as NodeJS.ProcessEnv),
    ).toBe("cloudinary");
  });

  it("uses tigris when credentials exist and cloudinary is absent", () => {
    expect(
      resolveMediaProvider({
        TIGRIS_STORAGE_BUCKET: "rare",
        TIGRIS_STORAGE_ACCESS_KEY_ID: "key",
        TIGRIS_STORAGE_SECRET_ACCESS_KEY: "secret",
      } as NodeJS.ProcessEnv),
    ).toBe("tigris");
  });

  it("falls back to local when no provider credentials exist", () => {
    expect(resolveMediaProvider({} as NodeJS.ProcessEnv)).toBe("local");
  });
});

describe("buildTigrisPublicUrl", () => {
  it("builds URL from explicit public base", () => {
    const env = {
      TIGRIS_STORAGE_PUBLIC_URL: "https://rare.t3.tigrisfiles.io",
    } as NodeJS.ProcessEnv;
    expect(buildTigrisPublicUrl(env, "stores/a/file.png")).toBe(
      "https://rare.t3.tigrisfiles.io/stores/a/file.png",
    );
  });

  it("falls back to bucket host URL", () => {
    const env = {
      TIGRIS_STORAGE_BUCKET: "rare",
    } as NodeJS.ProcessEnv;
    expect(buildTigrisPublicUrl(env, "/stores/a//file.png")).toBe(
      "https://rare.t3.tigrisfiles.io/stores/a/file.png",
    );
  });
});

describe("uploadMediaAssetWithEnv", () => {
  const input = {
    storeId: "store-1",
    fileName: "hero.png",
    contentType: "image/png",
    dataBase64: Buffer.from("hello").toString("base64"),
  };

  it("routes to cloudinary branch", async () => {
    const called = { cloudinary: 0, tigris: 0, local: 0 };
    const result = await uploadMediaAssetWithEnv(
      input,
      { MEDIA_UPLOAD_PROVIDER: "cloudinary" } as NodeJS.ProcessEnv,
      {
        cloudinaryUpload: async () => {
          called.cloudinary += 1;
          return { provider: "cloudinary", url: "https://cloudinary.test/img.webp" };
        },
        tigrisUpload: async () => {
          called.tigris += 1;
          return { provider: "tigris", url: "https://tigris.test/img.webp" };
        },
        localUpload: async () => {
          called.local += 1;
          return { provider: "local", url: "/api/admin/media/files/s/x.png" };
        },
      },
    );
    expect(result.provider).toBe("cloudinary");
    expect(called).toEqual({ cloudinary: 1, tigris: 0, local: 0 });
  });

  it("routes to tigris branch", async () => {
    const called = { cloudinary: 0, tigris: 0, local: 0 };
    const result = await uploadMediaAssetWithEnv(
      input,
      {
        TIGRIS_STORAGE_BUCKET: "bucket",
        TIGRIS_STORAGE_ACCESS_KEY_ID: "key",
        TIGRIS_STORAGE_SECRET_ACCESS_KEY: "secret",
      } as NodeJS.ProcessEnv,
      {
        cloudinaryUpload: async () => {
          called.cloudinary += 1;
          return { provider: "cloudinary", url: "https://cloudinary.test/img.webp" };
        },
        tigrisUpload: async () => {
          called.tigris += 1;
          return { provider: "tigris", url: "https://tigris.test/img.webp" };
        },
        localUpload: async () => {
          called.local += 1;
          return { provider: "local", url: "/api/admin/media/files/s/x.png" };
        },
      },
    );
    expect(result.provider).toBe("tigris");
    expect(called).toEqual({ cloudinary: 0, tigris: 1, local: 0 });
  });

  it("routes to local branch as fallback", async () => {
    const called = { cloudinary: 0, tigris: 0, local: 0 };
    const result = await uploadMediaAssetWithEnv(input, {} as NodeJS.ProcessEnv, {
      cloudinaryUpload: async () => {
        called.cloudinary += 1;
        return { provider: "cloudinary", url: "https://cloudinary.test/img.webp" };
      },
      tigrisUpload: async () => {
        called.tigris += 1;
        return { provider: "tigris", url: "https://tigris.test/img.webp" };
      },
      localUpload: async () => {
        called.local += 1;
        return { provider: "local", url: "/api/admin/media/files/store-1/file.png" };
      },
    });
    expect(result.provider).toBe("local");
    expect(result.url).toContain("/api/admin/media/files/store-1/");
    expect(called).toEqual({ cloudinary: 0, tigris: 0, local: 1 });
  });
});
