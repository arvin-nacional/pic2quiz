import ImageToText from "@/components/forms/ImageToText";
import React from "react";

const page = () => {
  return (
    <section className="flex items-center justify-center  px-16  max-md:px-5 max-sm:pt-5 max-sm:pb-0 sm:px-14 h-screen">
      <div className="flex flex-col w-[1200px] max-w-full px-2 pb-6 align-top max-md:mt-10 max-sm:grid-cols-1 h-full items-center justify-center ">
        <h1 className="text-4xl font-bold mb-12 ">
          Image to Quiz AI Generator
        </h1>
        <ImageToText />
      </div>
    </section>
  );
};

export default page;
