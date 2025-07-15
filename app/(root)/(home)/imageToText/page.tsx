"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImageToTextPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);

  const handleImageChange = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const uploadedImages: { name: string; url: string }[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 10MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        try {
          // For local preview, we can just use the data URL
          uploadedImages.push({ name: file.name, url: reader.result as string });
          setPreviews([...previews, ...uploadedImages]);
        } catch (error) {
          console.error("Error loading image:", error);
          toast.error("Failed to load image");
        }
      };
    }
  };

  const extractTextFromImages = async () => {
    if (previews.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsProcessing(true);
    setExtractedText("");

    try {
      const worker = await createWorker("eng");
      const texts = await Promise.all(
        previews.map(async (image) => {
          const { data } = await worker.recognize(image.url);
          return data.text;
        })
      );

      const combinedText = texts.join("\n\n");
      setExtractedText(combinedText);
      toast.success("Text extraction complete");
      await worker.terminate();
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Failed to extract text from images");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) {
      toast.error("No text to copy");
      return;
    }

    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard");
  };

  const resetForm = () => {
    setPreviews([]);
    setExtractedText("");
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Image to Text Converter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-medium">Upload Images</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleImageChange(e.target.files);
                }
              }}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
          </div>

          {previews.length > 0 && (
            <div>
              <p className="font-medium mb-2">Image Previews:</p>
              <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px]">
                {previews.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.name}
                    className="h-24 w-full object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={extractTextFromImages}
              disabled={isProcessing || previews.length === 0}
              className="bg-blue-950 hover:bg-blue-900"
            >
              {isProcessing ? "Processing..." : "Extract Text"}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-blue-500 text-blue-500"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-lg font-medium">Extracted Text</label>
            <div className="relative">
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-[300px] p-3 border rounded resize-none bg-gray-50 dark:bg-gray-800"
                placeholder="Extracted text will appear here..."
                readOnly={isProcessing}
              />
              {extractedText && (
                <Button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 p-2 h-8"
                  size="sm"
                >
                  Copy
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
