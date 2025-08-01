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

export default function ImageToQuizPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [generatedQuiz, setGeneratedQuiz] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("English");

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

  const generateQuiz = async () => {
    if (previews.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsProcessing(true);
    setGeneratedQuiz("");

    try {
      // Extract text from images using Tesseract.js
      const worker = await createWorker("eng");
      const texts = await Promise.all(
        previews.map(async (image) => {
          const { data } = await worker.recognize(image.url);
          return data.text;
        })
      );

      const combinedText = texts.join("\n\n");
      await worker.terminate();

      // Generate quiz questions using the API
      const response = await fetch("/api/ai/imageToText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: combinedText,
          numberOfQuestions,
          questionType,
          difficulty,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedQuiz(data.data);
        toast.success("Quiz generated successfully!");
      } else {
        throw new Error("Failed to generate quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedQuiz) {
      toast.error("No quiz to copy");
      return;
    }

    navigator.clipboard.writeText(generatedQuiz);
    toast.success("Quiz copied to clipboard");
  };

  const resetForm = () => {
    setPreviews([]);
    setGeneratedQuiz("");
    setNumberOfQuestions("5");
    setQuestionType("multiple-choice");
    setDifficulty("medium");
    setLanguage("English");
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Image to Quiz Generator</h1>

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
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Questions
                  </label>
                  <Select
                    value={numberOfQuestions}
                    onValueChange={setNumberOfQuestions}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Type</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="identification">
                        Identification
                      </SelectItem>
                      <SelectItem value="true-or-false">
                        True or False
                      </SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
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
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Filipino">Filipino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateQuiz}
              disabled={isProcessing || previews.length === 0}
              className="bg-blue-950 hover:bg-blue-900"
            >
              {isProcessing ? "Generating Quiz..." : "Generate Quiz"}
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
              <CardTitle>Generated Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={generatedQuiz}
                  onChange={(e) => setGeneratedQuiz(e.target.value)}
                  className="min-h-[500px] resize-none bg-gray-50 dark:bg-gray-800"
                  placeholder="Generated quiz questions will appear here..."
                  readOnly={isProcessing}
                />
                {generatedQuiz && (
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
