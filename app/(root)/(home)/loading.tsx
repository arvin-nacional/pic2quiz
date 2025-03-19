import ImageToText from "@/components/forms/ImageToText";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
  return (
    <section className="flex items-center justify-center  px-16  max-md:px-5 max-sm:pt-5 max-sm:pb-0 sm:px-14 h-screen">
      <div className="flex w-[1200px] max-w-full px-2 pb-6 align-top max-md:mt-10 max-sm:grid-cols-1 h-full items-center justify-center ">
        <Skeleton className="w-[500px] h-[600px]" />
      </div>
    </section>
  );
};

export default loading;
