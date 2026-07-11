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

    // ===== DEBUG LOGS =====
    console.log("========== CLOUDINARY DEBUG ==========");
    console.log(
      "Cloud Name:",
      process.env.CLOUDINARY_CLOUD_NAME
    );
    console.log(
      "API Key:",
      process.env.CLOUDINARY_API_KEY
    );
    console.log(
      "API Secret length:",
      process.env.CLOUDINARY_API_SECRET?.length
    );
    console.log(
      "NODE_ENV:",
      process.env.NODE_ENV
    );
    console.log(
      "Cloudinary configured:",
      cloudinaryConfigured()
    );
    console.log("======================================");
    // ======================

    const result = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "society-complaints",
        },
        (error, result) => {
          if (error) {
            console.error(
              "Cloudinary Upload Error:",
              error
            );
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error("Cloudinary returned no result.")
            );
            return;
          }

          console.log(
            "Cloudinary Upload Success:",
            result.secure_url
          );

          resolve({
            secure_url: result.secure_url,
          });
        }
      );

      stream.end(buffer);
    });

    return result.secure_url;
  }

  console.warn(
    "Cloudinary credentials not found. Using local storage."
  );

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
    /[^a-zA-Z0-9._-]/g,
    ""
  )}`;

  fs.writeFileSync(
    path.join(uploadsDir, safeName),
    buffer
  );

  return `/uploads/${safeName}`;
}