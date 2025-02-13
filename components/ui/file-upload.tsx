import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0]; // Only take the first file
      setFile(selectedFile);
      onChange && onChange([selectedFile]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    setFile(null);
    onChange && onChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false, // Only allow single file
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-4 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden border border-dashed border-gray-300 dark:border-gray-600"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        
        {file ? (
          <div className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded-md">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">
              {file.name}
            </p>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
              title="Remove file"
            >
              <IconX size={16} className="text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <IconUpload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Upload file
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Click to upload or drag and drop
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
