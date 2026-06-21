"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
  /** When set, uploads replace existing images instead of appending. */
  maxImages?: number;
};

export function ImageUploader({ images, onChange, maxImages = 1 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSingleImage = maxImages === 1;
  const previewImage = images[0];

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Upload failed");
    }

    return data.url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const selected = isSingleImage ? [files[0]] : Array.from(files).slice(0, maxImages);
      const uploaded: string[] = [];

      for (const file of selected) {
        const url = await uploadFile(file);
        uploaded.push(url);
      }

      if (isSingleImage) {
        onChange(uploaded.slice(0, 1));
      } else {
        const combined = [...images, ...uploaded].slice(0, maxImages);
        onChange(combined);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Could not upload image.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="space-y-4">
      {isSingleImage ? (
        previewImage ? (
          <div className="relative aspect-square max-w-[220px] overflow-hidden rounded-lg border border-muted/20">
            <Image src={previewImage} alt="" fill sizes="220px" className="object-cover" />
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : null}
            {!uploading ? (
              <button
                type="button"
                onClick={() => removeImage(0)}
                className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1 text-white hover:bg-foreground"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : null
      ) : (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative h-24 w-24 overflow-hidden rounded-lg border border-muted/20"
            >
              <Image src={image} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded-full bg-foreground/80 p-1 text-white hover:bg-foreground"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={!isSingleImage}
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-4 w-4" />
              {isSingleImage && previewImage ? "Replace photo" : "Upload case photo"}
            </>
          )}
        </Button>
      </div>

      {error ? (
        <Text variant="small" as="p" className="text-danger">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
