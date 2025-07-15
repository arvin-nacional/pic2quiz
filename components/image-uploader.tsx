"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import { QuizGenerator } from "./quiz-generator";
import { uploadImage, generateQuiz } from "@/lib/actions";

export function ImageUploader() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(imageFile);
      setUploadedImageUrl(imageUrl);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setUploadedImageUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!image ? (
        <Card className="border-dashed border-2 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-slate-100 p-4 rounded-full">
              <ImageIcon className="h-8 w-8 text-slate-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Upload an image</h3>
              <p className="text-sm text-slate-500">
                JPG, PNG or GIF, up to 5MB
              </p>
            </div>
            <label className="cursor-pointer">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <img
              src={image || "/placeholder.svg"}
              alt="Uploaded image"
              className="w-full h-auto rounded-lg object-cover max-h-[400px]"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white"
              onClick={handleReset}
            >
              Change Image
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {!uploadedImageUrl && !uploading && (
            <Button onClick={handleUpload} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Generate Quiz from this Image
            </Button>
          )}

          {uploading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          )}

          {uploadedImageUrl && <QuizGenerator imageUrl={uploadedImageUrl} />}
        </div>
      )}
    </div>
  );
}
