"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReviewerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [generatedReviewer, setGeneratedReviewer] = useState("");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [format, setFormat] = useState("bullet-points");
  const [language, setLanguage] = useState("english");

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
          uploadedImages.push({
            name: file.name,
            url: reader.result as string,
          });
          setPreviews([...previews, ...uploadedImages]);
        } catch (error) {
          console.error("Error loading image:", error);
          toast.error("Failed to load image");
        }
      };
    }
  };

  const generateReviewer = async () => {
    if (previews.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsProcessing(true);
    setGeneratedReviewer("");

    try {
      // Extract text from images using Tesseract.js
      const worker = await createWorker(
        language === "filipino" ? "fil" : "eng"
      );
      const texts = await Promise.all(
        previews.map(async (image) => {
          const { data } = await worker.recognize(image.url);
          return data.text;
        })
      );

      const combinedText = texts.join("\n\n");
      await worker.terminate();

      // Generate reviewer content using the API
      const response = await fetch("/api/ai/imageToReviewer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: combinedText,
          detailLevel,
          format,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reviewer content");
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedReviewer(data.data);
        toast.success("Reviewer content generated successfully!");
      } else {
        throw new Error("Failed to generate reviewer content");
      }
    } catch (error) {
      console.error("Error generating reviewer:", error);
      toast.error("Failed to generate reviewer content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedReviewer) {
      toast.error("No reviewer content to copy");
      return;
    }

    navigator.clipboard.writeText(generatedReviewer);
    toast.success("Reviewer content copied to clipboard");
  };

  const resetForm = () => {
    setPreviews([]);
    setGeneratedReviewer("");
    setDetailLevel("medium");
    setFormat("bullet-points");
    setLanguage("english");
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Image to Reviewer Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <p className="text-sm text-gray-500">
                Maximum file size: 10MB per image
              </p>

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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviewer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Detail Level</label>
                  <Select value={detailLevel} onValueChange={setDetailLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-detailed">
                        Very Detailed
                      </SelectItem>
                      <SelectItem value="thorough">Thorough</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="main-ideas">Main Ideas</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullet-points">
                        Bullet Points
                      </SelectItem>
                      <SelectItem value="paragraphs">Paragraphs</SelectItem>
                      <SelectItem value="flashcards">Flashcards</SelectItem>
                      <SelectItem value="mind-map">Mind Map</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="terms-table">Terms Table</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="filipino">Filipino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateReviewer}
              disabled={isProcessing || previews.length === 0}
              className="bg-blue-950 hover:bg-blue-900"
            >
              {isProcessing ? "Generating Reviewer..." : "Generate Reviewer"}
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

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reviewer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={generatedReviewer}
                  onChange={(e) => setGeneratedReviewer(e.target.value)}
                  className="min-h-[500px] resize-none bg-gray-50 dark:bg-gray-800"
                  placeholder="Generated reviewer content will appear here..."
                  readOnly={isProcessing}
                />
                {generatedReviewer && (
                  <Button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 p-2 h-8"
                    size="sm"
                  >
                    Copy
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
