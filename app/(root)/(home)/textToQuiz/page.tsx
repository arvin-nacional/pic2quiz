"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TextToQuizPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [language, setLanguage] = useState("English");

  const generateQuiz = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to generate quiz questions");
      return;
    }

    setIsProcessing(true);
    setGeneratedQuiz("");

    try {
      const response = await fetch("/api/ai/imageToText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputText,
          difficulty,
          questionType,
          numberOfQuestions,
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
    setInputText("");
    setGeneratedQuiz("");
    setDifficulty("medium");
    setQuestionType("multiple-choice");
    setNumberOfQuestions("5");
    setLanguage("English");
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Text to Quiz Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter the text content you want to generate quiz questions from..."
                className="min-h-[200px] resize-none"
              />
              <p className="text-sm text-gray-500">
                Enter any educational content, notes, or study material
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium">Question Type</label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Questions</label>
                  <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions}>
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
              disabled={isProcessing || !inputText.trim()}
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
                  className="min-h-[400px] resize-none bg-gray-50 dark:bg-gray-800"
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
