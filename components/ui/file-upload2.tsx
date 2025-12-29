"use client"

import type React from "react"
import { useState, useRef } from "react"
import { FileIcon, FileTextIcon, ImageIcon, FileSpreadsheetIcon, Paperclip, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number
  value: File[]
  onChange: (files: File[]) => void
  acceptedTypes?: string[]
  disabled?: boolean
}

export function FileUpload({
  maxFiles = 15,
  maxSize = 5 * 1024 * 1024, // 5MB
  value = [],
  onChange,
  acceptedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ],
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileTextIcon className="h-4 w-4" />
    if (fileType.includes("image")) return <ImageIcon className="h-4 w-4" />
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheetIcon className="h-4 w-4" />
    if (fileType.includes("word")) return <FileIcon className="h-4 w-4" />
    return <Paperclip className="h-4 w-4" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Handle file validation and addition
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (exceeds ${formatFileSize(maxSize)})`)
        return
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (unsupported file type)`)
        return
      }

      validFiles.push(file)
    })

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid files",
        description: `The following files couldn't be added: ${invalidFiles.join(", ")}`,
      })
    }

    // Update selected files (limit to maxFiles)
    if (value.length + validFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can upload a maximum of ${maxFiles} files.`,
      })

      // Only add files up to the limit
      const remainingSlots = maxFiles - value.length
      onChange([...value, ...validFiles.slice(0, remainingSlots)])
    } else {
      onChange([...value, ...validFiles])
    }
  }

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset the input
    e.target.value = ""
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Remove a file
  const removeFile = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  // Clear all files
  const clearFiles = () => {
    onChange([])
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-150",
          isDragging
            ? "border-primary bg-primary/5 shadow-sm"
            : value.length > 0
              ? "border-border bg-muted/20"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
          disabled && "opacity-60 cursor-not-allowed border-muted bg-muted/10",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg flex items-center justify-center z-10">
            <div className="bg-background border shadow-sm rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Drop files to upload</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-3 text-center p-8">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-medium">
              {value.length > 0
                ? `${value.length} file${value.length !== 1 ? "s" : ""} selected`
                : "Drag & drop files or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, Excel, Word, and image files up to {formatFileSize(maxSize)} each
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Browse Files
            </Button>

            {value.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={disabled}
                onClick={clearFiles}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedTypes.join(",")}
            disabled={disabled}
          />
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-background group hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 bg-primary/10 rounded text-primary">{getFileIcon(file.type)}</div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

