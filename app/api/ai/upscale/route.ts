import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const scale = (formData.get("scale") as string) || "2x";
    const style = (formData.get("style") as string) || "enhanced";

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to buffer for OpenAI
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to File object for OpenAI API
    const imageFile = new File([buffer], image.name || "image.png", {
      type: image.type || "image/png",
    });

    // Use DALL-E for image variation/enhancement (closest to upscaling available)
    // Note: createVariation doesn't use prompts, it creates variations of the input image
    const response = await openai.images.createVariation({
      image: imageFile,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    const upscaledImageUrl = response.data?.[0]?.url;

    if (!upscaledImageUrl) {
      return NextResponse.json(
        { error: "Failed to upscale image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      upscaledImageUrl,
      originalSize: image.size,
      scale: scale,
      style: style,
    });
  } catch (error) {
    console.error("Error upscaling image:", error);
    return NextResponse.json(
      { error: "Failed to upscale image. Please try again." },
      { status: 500 }
    );
  }
}
