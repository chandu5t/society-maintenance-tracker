import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadPhoto(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });

    const result = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "society-complaints",
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
            return;
          }

          resolve({
            secure_url: result.secure_url,
          });
        }
      );

      stream.end(buffer);
    });

    return result.secure_url;
  }

  // Local Development Storage
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads"
  );

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
      recursive: true,
    });
  }

  const safeName = `${Date.now()}-${file.name.replace(
    /[^a-zA-Z0-9.\-_]/g,
    ""
  )}`;

  fs.writeFileSync(
    path.join(uploadsDir, safeName),
    buffer
  );

  return `/uploads/${safeName}`;
}