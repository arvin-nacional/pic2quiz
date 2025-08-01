import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ImageIcon,
  FileTextIcon,
  BookOpenIcon,
  PenToolIcon,
} from "lucide-react";

const page = () => {
  const features = [
    {
      href: "/imageToQuiz",
      title: "Image to Quiz",
      description:
        "Upload images and generate quiz questions from their content",
      icon: PenToolIcon,
      color: "bg-blue-500",
    },
    {
      href: "/textToQuiz",
      title: "Text to Quiz",
      description: "Input text directly and create customized quiz questions",
      icon: PenToolIcon,
      color: "bg-green-500",
    },
    {
      href: "/imageToText",
      title: "Image to Text",
      description: "Extract text content from images using OCR technology",
      icon: FileTextIcon,
      color: "bg-purple-500",
    },
    {
      href: "/reviewer",
      title: "Image to Reviewer",
      description: "Create comprehensive study materials from images",
      icon: BookOpenIcon,
      color: "bg-orange-500",
    },
    {
      href: "/upload",
      title: "Upload Images",
      description: "Upload and process multiple images for various tasks",
      icon: ImageIcon,
      color: "bg-indigo-500",
    },
  ];

  return (
    <section className="flex items-center justify-center px-16 max-md:px-5 max-sm:pt-5 max-sm:pb-0 sm:px-14 min-h-screen">
      <div className="flex flex-col w-[1200px] max-w-full px-2 pb-6 align-top max-md:mt-10 max-sm:grid-cols-1 items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pic2Quiz AI Platform</h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform images and text into interactive educational content with
            AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Choose a tool above to get started with AI-powered educational
            content creation
          </p>
        </div>
      </div>
    </section>
  );
};

export default page;
