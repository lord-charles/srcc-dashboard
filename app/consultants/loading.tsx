import { Spinner } from "@/components/ui/spinner";
import React from "react";

export default function loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-green-500/[0.05] blur-3xl">
      <div className="w-[100px] h-[100px]">
        <Spinner variant="default" size="" />
      </div>
    </div>
  );
}
