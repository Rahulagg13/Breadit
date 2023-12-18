"use client";
import { FC } from "react";
import Lottie from "lottie-react";
import ErrorFile from "@/assets/Error.json";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotFoundProps {}

const NotFound: FC<NotFoundProps> = ({}) => {
  return (
    <div className="flex container max-w-7xl  justify-center   ">
      <Lottie animationData={ErrorFile} className="" />

      <div className=" container max-w-xl flex flex-col items-center mt-12  p-12 gap-10 font-playPen">
        <h1 className="text-5xl font-bold">404 Error</h1>
        <p className=" w-[400px] text-center text-xl ">
          The page you are looking for was moved, removed, renamed, or might
          never existed
        </p>

        <Link
          href="/"
          className={cn(buttonVariants(), "flex items-center gap-4")}
        >
          Go to Home
          <span>
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
