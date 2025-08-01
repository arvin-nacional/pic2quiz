"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ImageIcon,
  FileTextIcon,
  BookOpenIcon,
  PenToolIcon,
  HomeIcon,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: HomeIcon,
    description: "Main dashboard",
  },
  {
    href: "/upload",
    label: "Upload Images",
    icon: ImageIcon,
    description: "Upload and process images",
  },
  {
    href: "/imageToText",
    label: "Image to Text",
    icon: FileTextIcon,
    description: "Extract text from images",
  },
  {
    href: "/imageToQuiz",
    label: "Image to Quiz",
    icon: PenToolIcon,
    description: "Generate quiz from images",
  },
  {
    href: "/textToQuiz",
    label: "Text to Quiz",
    icon: PenToolIcon,
    description: "Generate quiz from text",
  },
  {
    href: "/reviewer",
    label: "Image to Reviewer",
    icon: BookOpenIcon,
    description: "Create study materials",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <Card className="w-full mb-6">
      <nav className="p-4 w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <PenToolIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Pic2Quiz
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`
                      flex items-center space-x-2 transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Current page description */}
        {navItems.map((item) => {
          if (pathname === item.href) {
            return (
              <div
                key={item.href}
                className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left"
              >
                {item.description}
              </div>
            );
          }
          return null;
        })}
      </nav>
    </Card>
  );
}
