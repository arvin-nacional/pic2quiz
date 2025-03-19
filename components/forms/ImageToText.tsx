"use client";
import React, { useTransition, useState, useRef } from "react";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "../ui/form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageSchema } from "@/lib/validations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});
const ImageToText = () => {
  const [isPending, startTransition] = useTransition();

  const editorRef = useRef<MDXEditorMethods>(null);
  const form = useForm<z.infer<typeof ImageSchema>>({
    resolver: zodResolver(ImageSchema),
    defaultValues: {
      image: {
        name: "default",
        url: "",
      },
      numberOfQuestions: "",
      questionType: "",
      difficulty: "",
      question: "",
    },
  });

  const [preview, setPreview] = useState({
    name: "default",
    url: "",
  });

  // Update your onSubmit function
  async function onSubmit(data: z.infer<typeof ImageSchema>) {
    startTransition(async () => {
      try {
        // convert image to text
        const worker = await createWorker("eng");
        const {
          data: { text },
        } = await worker.recognize(data.image.url);

        // Call the API to generate text
        const response = await fetch("/api/ai/imageToText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text, ...data }),
        });

        const rawQuestions = await response.json();
        console.log(rawQuestions);
        const formattedAnswer = rawQuestions.data
          .replace(/<br>/g, " ")
          .toString()
          .trim();
        if (editorRef.current) {
          editorRef.current.setMarkdown(formattedAnswer);

          form.setValue("question", formattedAnswer);
          form.trigger("question");
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  // Update handleImageChange to check file size
  const handleImageChange = (file: File, onChange: (value: any) => void) => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const imageObj = { name: file.name, url: base64String };
      setPreview(imageObj);
      onChange(imageObj);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <Form {...form}>
        <form className="flex gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5 py-12 rounded-xl px-5 w-[500px]">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Image <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        {...rest}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]; // Get the first file
                          if (file) {
                            handleImageChange(file, onChange);
                          }
                        }}
                        className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border align-baseline"
                      />
                    </FormControl>
                    <FormDescription className="body-regular mt-2.5 text-light-500">
                      Maximum size of 10mb.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Number of Questions{" "}
                      <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of questions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* <FormDescription className="body-regular mt-2.5 text-light-500">
                    Select Number of Questions
                  </FormDescription> */}
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Difficulty <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=" Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* <FormDescription className="body-regular mt-2.5 text-light-500">
                    Select difficulty level
                  </FormDescription> */}
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <>
                  <FormItem>
                    <FormLabel className="paragraph-semibold">
                      Type of Questions{" "}
                      <span className="text-primary-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=" Select qustion type" />
                          </SelectTrigger>
                        </FormControl>
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
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* <FormDescription className="body-regular mt-2.5 text-light-500">
                    Select qustion type
                  </FormDescription> */}
                    <FormMessage className="text-red-500" />
                  </FormItem>
                </>
              )}
            />
            <Button
              type="submit"
              className="w-fit rounded-3xl px-10 !text-light-900 mt-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Generating" : "Generate AI Questions"}
            </Button>
          </div>
          {form.watch("question") && (
            <div>
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3">
                    <FormControl className="mt-3.5">
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
          )}
        </form>
      </Form>
    </div>
  );
};

export default ImageToText;
