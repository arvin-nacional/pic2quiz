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
      images: [],
      numberOfQuestions: "",
      questionType: "",
      difficulty: "",
      question: "",
    },
  });

  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);

  async function onSubmit(data: any) {
    startTransition(async () => {
      try {
        console.log(data.images);
        const worker = await createWorker("eng");
        const texts = await Promise.all(
          data.images.map(async (image: { url: string }) => {
            const { data } = await worker.recognize(image.url);
            return data.text;
          })
        );

        const response = await fetch("/api/ai/imageToText", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: texts.join(" "), ...data }),
        });

        const rawQuestions = await response.json();
        const formattedAnswer = rawQuestions.data.replace(/<br>/g, " ").trim();

        if (editorRef.current) {
          editorRef.current.setMarkdown(formattedAnswer);
          form.setValue("question", formattedAnswer);
          form.trigger("question");
        }
        toast("Successful Generation", {
          description: `Successfully generated ${data.numberOfQuestions} questions`,
        });
      } catch (error) {
        console.error(error);
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
      numberOfQuestions: "",
      questionType: "",
      difficulty: "",
      question: "",
    });
    setPreviews([]);
  };
  return (
    <div>
      <Form {...form}>
        <form className="flex gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5  rounded-xl px-5 w-[500px]">
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
                          <SelectItem value="matching">Matching</SelectItem>
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
                            <SelectValue placeholder=" Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="filipino">Filipino</SelectItem>
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
              className="w-fit rounded-3xl px-10 bg-blue-950 !text-light-900 mt-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Generating" : "Generate AI Questions"}
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
              name="question"
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

            {/* {editorRef.current && (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(form.getValues("question"));

                  toast("Coppied to clipboard", {
                    description: "Question has been successfully copied",
                  });
                }}
                className="mt-3 px-4 py-2 text-primary-400  small-regular border border-primary-500 rounded-lg  text-white cursor-pointer"
              >
                <Copy /> Copy Questions
              </Button>
            )} */}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ImageToText;
