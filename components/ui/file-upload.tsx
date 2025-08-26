"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  type: "avatar" | "company_logo" | "agent_avatar"
  currentUrl?: string
  className?: string
}

export function FileUpload({ onUpload, accept = "image/*", type, currentUrl, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setPreview(data.url)
      onUpload(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setPreview(null)
    onUpload("")
  }

  return (
    <div className={className}>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="w-20 h-20 rounded-lg object-cover border" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={clearFile}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${type}`}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById(`file-upload-${type}`)?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "上传中..." : "选择文件"}
          </Button>
        </div>
      )}
    </div>
  )
}
