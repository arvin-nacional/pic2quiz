"use client";

import React, { useTransition, useState, useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { createWorker } from "tesseract.js";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

// Define reviewer schema
const ReviewerSchema = z.object({
  images: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
  detailLevel: z.string().min(1),
  format: z.string().min(1),
  language: z.string().min(1),
  content: z.string(),
});

export default function ReviewerPage() {
  const [isPending, startTransition] = useTransition();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);

  const form = useForm<z.infer<typeof ReviewerSchema>>({
    resolver: zodResolver(ReviewerSchema),
    defaultValues: {
      images: [],
      detailLevel: "",
      format: "",
      language: "english",
      content: "",
    },
  });

  async function onSubmit(data: any) {
    startTransition(async () => {
      try {
        // Use Tesseract.js to extract text from images
        const worker = await createWorker(
          data.language === "filipino" ? "fil" : "eng"
        );
        const texts = await Promise.all(
          data.images.map(async (image: { url: string }) => {
            const { data } = await worker.recognize(image.url);
            return data.text;
          })
        );

        // Send the extracted text to the API to generate reviewer content
        const response = await fetch("/api/ai/imageToReviewer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: texts.join(" "),
            detailLevel: data.detailLevel,
            format: data.format,
            language: data.language,
          }),
        });

        const result = await response.json();
        
        // Sanitize the markdown content to remove problematic elements
        let formattedContent = result.data.replace(/<br>/g, " ");
        
        // Remove thematic breaks (horizontal rules like ---) which cause parsing errors
        formattedContent = formattedContent.replace(/^(---|___|\*\*\*)(\s*)$/gm, "");
        
        // Additional sanitization for other potentially problematic markdown
        formattedContent = formattedContent.trim();

        if (editorRef.current) {
          editorRef.current.setMarkdown(formattedContent);
          form.setValue("content", formattedContent);
          form.trigger("content");
        }

        toast("Successful Generation", {
          description: `Successfully generated reviewer content`,
        });
      } catch (error) {
        console.error(error);
        toast("Error", {
          description: "Failed to generate reviewer content. Please try again.",
        });
      }
    });
  }

  const handleImageChange = async (
    files: FileList,
    onChange: (value: any) => void
  ) => {
    const uploadedImages: { name: string; url: string }[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 100 * 1024 * 1024) {
        alert(`${file.name} exceeds the 100MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      const uploadPromise = new Promise<{ name: string; url: string }>(
        (resolve, reject) => {
          reader.onload = async () => {
            try {
              const response = await fetch("/api/cloudinary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  images: [{ src: reader.result, alt: file.name }],
                }),
              });

              const result = await response.json();
              if (result.success) {
                resolve({ name: file.name, url: result.data[0].src });
              } else {
                reject(new Error("Image upload failed"));
              }
            } catch (error) {
              reject(error);
            }
          };
        }
      );

      try {
        const uploadedImage = await uploadPromise;
        uploadedImages.push(uploadedImage);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    if (uploadedImages.length) {
      setPreviews((prev) => [...prev, ...uploadedImages]);
      onChange([...form.getValues("images"), ...uploadedImages]);
    }
  };

  const refreshPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.location.reload();
    form.reset({
      images: [],
      detailLevel: "",
      format: "",
      language: "english",
      content: "",
    });
    setPreviews([]);
  };

  return (
    <div className="container mx-auto p-12">
      <h1 className="text-2xl font-bold mb-6">Image to Reviewer</h1>
      <p className="text-gray-600 mb-6">
        Upload images to generate reviewer content with customizable options
      </p>

      <Form {...form}>
        <form className="flex gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5 rounded-xl px-5 w-[500px]">
            <FormField
              control={form.control}
              name="images"
              render={({ field: { onChange, value, ...rest } }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Images <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        {...rest}
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            handleImageChange(e.target.files, onChange);
                          }
                        }}
                        className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border align-baseline"
                      />
                    </FormControl>
                    <FormDescription className="body-regular mt-2.5 text-light-500">
                      Maximum size of 10mb.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                    {previews.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-scroll">
                        {previews.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={image.name}
                            className="h-20 w-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="detailLevel"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Detail Level <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select detail level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="very-detailed">
                            Very Detailed
                          </SelectItem>
                          <SelectItem value="thorough">Thorough</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="main-ideas">
                            Main Ideas Only
                          </SelectItem>
                          <SelectItem value="concise">Concise</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Format <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bullet-points">
                            Bullet Points
                          </SelectItem>
                          <SelectItem value="paragraphs">Paragraphs</SelectItem>
                          <SelectItem value="flashcards">Flashcards</SelectItem>
                          <SelectItem value="mind-map">
                            Mind Map Structure
                          </SelectItem>
                          <SelectItem value="summary">
                            Executive Summary
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Language <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="filipino">Filipino</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <Button
              type="submit"
              className="w-fit rounded-3xl px-10 bg-blue-950 !text-light-900 mt-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Generating" : "Generate Reviewer"}
            </Button>
            <Button
              className="w-fit rounded-3xl bg-blue-500 hover:bg-blue-600 px-10 !text-light-900 mt-2 cursor-pointer"
              onClick={refreshPage}
            >
              Start Over
            </Button>
          </div>

          <div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-3">
                  <FormControl className="mt-3.5 w-[500px] ">
                    <Editor
                      value={field.value}
                      editorRef={editorRef}
                      fieldChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
