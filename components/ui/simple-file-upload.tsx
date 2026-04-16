"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";

interface SimpleFileUploadProps {
  onChange: (files: File[]) => void;
  variant?: "outline" | "ghost" | "default";
  label?: string;
  icon?: React.ReactNode;
  accept?: string;
  multiple?: boolean;
}

export const SimpleFileUpload: React.FC<SimpleFileUploadProps> = ({
  onChange,
  variant = "ghost",
  label,
  icon = <Upload className="h-3.5 w-3.5" />,
  accept,
  multiple = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onChange(files);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      <Button
        type="button"
        variant={variant}
        size={label ? "sm" : "icon"}
        className={label ? "h-7 gap-1.5 px-2" : "h-7 w-7"}
        onClick={handleClick}
      >
        {icon}
        {label && <span className="text-[10px] font-medium">{label}</span>}
      </Button>
    </div>
  );
};
