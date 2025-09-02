"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  ImageIcon,
  Loader2,
  Download,
  Zap,
  Sparkles,
} from "lucide-react";

interface UpscaleResult {
  upscaledImageUrl: string;
  originalSize: number;
  scale: string;
  style: string;
}

export function ImageUpscaler() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [upscaling, setUpscaling] = useState(false);
  const [upscaleResult, setUpscaleResult] = useState<UpscaleResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState("2x");
  const [style, setStyle] = useState("enhanced");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setError(null);
    setImageFile(file);
    setUpscaleResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    if (!imageFile) return;

    try {
      setUpscaling(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("scale", scale);
      formData.append("style", style);

      const response = await fetch("/api/ai/upscale", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upscale image");
      }

      setUpscaleResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upscale image. Please try again."
      );
      console.error(err);
    } finally {
      setUpscaling(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setUpscaleResult(null);
    setError(null);
  };

  const handleDownload = async () => {
    if (!upscaleResult?.upscaledImageUrl) return;

    try {
      const response = await fetch(upscaleResult.upscaledImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upscaled-image-${scale}-${style}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download image");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              Upload Image
            </h2>
          </div>

          {!image ? (
            <div className="border-dashed border-2 border-slate-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-slate-100 p-4 rounded-full">
                  <ImageIcon className="h-8 w-8 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-900">
                    Upload an image to upscale
                  </h3>
                  <p className="text-sm text-slate-500">
                    JPG, PNG or GIF, up to 10MB
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={image}
                  alt="Original image"
                  className="w-full h-auto rounded-lg object-cover max-h-[300px]"
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

              {/* Upscale Settings */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Scale Factor
                  </label>
                  <Select value={scale} onValueChange={setScale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2x">2x (Double Size)</SelectItem>
                      <SelectItem value="4x">4x (Quadruple Size)</SelectItem>
                      <SelectItem value="8x">8x (Eight Times)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Enhancement Style
                  </label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enhanced">Enhanced Quality</SelectItem>
                      <SelectItem value="realistic">Photorealistic</SelectItem>
                      <SelectItem value="artistic">
                        Artistic Enhancement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleUpscale}
                  className="w-full"
                  disabled={upscaling}
                >
                  {upscaling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upscaling Image...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Upscale Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              Upscaled Result
            </h2>
          </div>

          {!upscaleResult && !upscaling ? (
            <div className="border-2 border-slate-200 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-slate-100 p-4 rounded-full">
                  <Sparkles className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-600">No result yet</h3>
                  <p className="text-sm text-slate-500">
                    Upload an image and click "Upscale Image" to see the
                    enhanced result
                  </p>
                </div>
              </div>
            </div>
          ) : upscaling ? (
            <div className="border-2 border-slate-200 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-800">Processing...</h3>
                  <p className="text-sm text-slate-500">
                    AI is enhancing your image. This may take a few moments.
                  </p>
                </div>
              </div>
            </div>
          ) : upscaleResult ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={upscaleResult.upscaledImageUrl}
                  alt="Upscaled image"
                  className="w-full h-auto rounded-lg object-cover max-h-[300px]"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  Enhancement Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>Scale: {upscaleResult.scale}</div>
                  <div>Style: {upscaleResult.style}</div>
                  <div>
                    Original: {Math.round(upscaleResult.originalSize / 1024)}KB
                  </div>
                  <div>Enhanced: High Resolution</div>
                </div>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Enhanced Image
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
