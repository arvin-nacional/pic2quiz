import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  const { images } = await req.json();
  // Upload additional images with base64 processing
  interface Image {
    src: string;
    alt: string;
  }

  interface ImageUploadResult {
    secure_url: string;
  }

  try {
    const uploadedImages: Image[] = await Promise.all(
      images.map(async (image: Image): Promise<Image> => {
        if (image.src.startsWith("data:image")) {
          // Extract mime type and base64 data
          const mime: string | undefined =
            image.src.match(/data:(.*?);base64,/)?.[1];
          const base64Data: string | undefined = image.src.split(",")[1];

          if (!mime || !base64Data) {
            throw new Error("Invalid image format");
          }

          const fileUri: string = `data:${mime};base64,${base64Data}`;

          // Upload to Cloudinary
          const imageUploadResult: ImageUploadResult =
            await cloudinary.uploader.upload(fileUri, {
              invalidate: true,
            });

          return { src: imageUploadResult.secure_url, alt: image.alt };
        }
        return image;
      })
    );
    return NextResponse.json(
      { success: true, data: uploadedImages },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
  }
}
