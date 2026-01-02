"use client";

import { Button } from "@/components/ui/button";
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import {
  CircleUserRoundIcon,
  ImageIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB - matches server validation
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/webp";

type ImageDropzoneVariant = "avatar" | "square";

type ImageDropzoneProps = {
  value?: string | null;
  onChange: (file: File) => void;
  onRemove?: () => void;
  variant?: ImageDropzoneVariant;
  className?: string;
  disabled?: boolean;
  isUploading?: boolean;
};

export function ImageDropzone({
  value,
  onChange,
  onRemove,
  variant = "square",
  className,
  disabled = false,
  isUploading = false,
}: ImageDropzoneProps) {
  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
    onFilesAdded(addedFiles: FileWithPreview[]) {
      const firstFile = addedFiles[0];
      if (firstFile.file instanceof File) {
        onChange(firstFile.file);
      }
    },
  });

  const previewUrl = files[0]?.preview ?? value ?? null;
  const isDisabled = disabled || isUploading;

  const handleRemove = () => {
    if (files[0]?.id) {
      removeFile(files[0].id);
    }
    onRemove?.();
  };

  if (variant === "avatar") {
    return (
      <AvatarDropzone
        previewUrl={previewUrl}
        isDragging={isDragging}
        isUploading={isUploading}
        isDisabled={isDisabled}
        fileName={files[0]?.file?.name}
        onRemove={handleRemove}
        openFileDialog={openFileDialog}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        getInputProps={getInputProps}
        className={className}
      />
    );
  }

  return (
    <SquareDropzone
      previewUrl={previewUrl}
      isDragging={isDragging}
      isUploading={isUploading}
      isDisabled={isDisabled}
      fileName={files[0]?.file?.name}
      onRemove={handleRemove}
      openFileDialog={openFileDialog}
      handleDragEnter={handleDragEnter}
      handleDragLeave={handleDragLeave}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      getInputProps={getInputProps}
      className={className}
    />
  );
}

type DropzoneInternalProps = {
  previewUrl: string | null;
  isDragging: boolean;
  isUploading: boolean;
  isDisabled: boolean;
  fileName?: string;
  onRemove: () => void;
  openFileDialog: () => void;
  handleDragEnter: React.DragEventHandler<HTMLElement>;
  handleDragLeave: React.DragEventHandler<HTMLElement>;
  handleDragOver: React.DragEventHandler<HTMLElement>;
  handleDrop: React.DragEventHandler<HTMLElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>;
  };
  className?: string;
};

function AvatarDropzone({
  previewUrl,
  isDragging,
  isUploading,
  isDisabled,
  fileName,
  onRemove,
  openFileDialog,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  getInputProps,
  className,
}: DropzoneInternalProps) {
  return (
    <div className={cn("flex w-fit flex-col items-center gap-2", className)}>
      <div className="relative inline-flex">
        <DropzoneButton
          className="size-16 rounded-full"
          previewUrl={previewUrl}
          isDragging={isDragging}
          isDisabled={isDisabled}
          fileName={fileName}
          openFileDialog={openFileDialog}
          handleDragEnter={handleDragEnter}
          handleDragLeave={handleDragLeave}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          placeholder={<CircleUserRoundIcon className="size-4 opacity-60" />}
        >
          {isUploading && <LoadingOverlay />}
        </DropzoneButton>
        {previewUrl && !isUploading && (
          <RemoveButton
            onClick={onRemove}
            className="absolute -top-1 -right-1"
          />
        )}
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

function SquareDropzone({
  previewUrl,
  isDragging,
  isUploading,
  isDisabled,
  fileName,
  onRemove,
  openFileDialog,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  getInputProps,
  className,
}: DropzoneInternalProps) {
  return (
    <div className={cn("relative size-32", className)}>
      <DropzoneButton
        className="size-full rounded-md"
        previewUrl={previewUrl}
        isDragging={isDragging}
        isDisabled={isDisabled}
        fileName={fileName}
        openFileDialog={openFileDialog}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        placeholder={<ImageIcon className="size-6 opacity-60" />}
      >
        {isUploading && <LoadingOverlay />}
        {!isUploading && !previewUrl && <UploadHint />}
      </DropzoneButton>
      {previewUrl && !isUploading && (
        <RemoveButton onClick={onRemove} className="absolute -top-2 -right-2" />
      )}
      <input
        {...getInputProps()}
        className="sr-only"
        aria-label="Upload image file"
        tabIndex={-1}
      />
    </div>
  );
}

type DropzoneButtonProps = {
  className?: string;
  previewUrl: string | null;
  isDragging: boolean;
  isDisabled: boolean;
  fileName?: string;
  placeholder: ReactNode;
  children?: ReactNode;
  openFileDialog: () => void;
  handleDragEnter: React.DragEventHandler<HTMLElement>;
  handleDragLeave: React.DragEventHandler<HTMLElement>;
  handleDragOver: React.DragEventHandler<HTMLElement>;
  handleDrop: React.DragEventHandler<HTMLElement>;
};

function DropzoneButton({
  className,
  previewUrl,
  isDragging,
  isDisabled,
  fileName,
  placeholder,
  children,
  openFileDialog,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
}: DropzoneButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "border-input bg-muted relative flex items-center justify-center overflow-hidden border border-dashed transition-colors outline-none",
        "hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "data-[dragging=true]:bg-accent/50 data-[dragging=true]:border-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        "has-[img]:border-none",
        className,
      )}
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-dragging={isDragging || undefined}
      disabled={isDisabled}
      aria-label={previewUrl ? "Change image" : "Upload image"}
    >
      {previewUrl ? (
        <img
          className="size-full object-cover"
          src={previewUrl}
          alt={fileName ?? "Uploaded image"}
        />
      ) : (
        <div aria-hidden="true">{placeholder}</div>
      )}
      {children}
    </button>
  );
}

function RemoveButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      size="icon"
      className={cn(
        "border-background focus-visible:border-background size-6 rounded-full border-2 shadow-none",
        className,
      )}
      aria-label="Remove image"
    >
      <XIcon className="size-3.5" />
    </Button>
  );
}

function LoadingOverlay() {
  return (
    <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
      <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
    </div>
  );
}

function UploadHint() {
  return (
    <div className="text-muted-foreground absolute inset-x-0 bottom-2 text-center text-xs">
      Drop or click
    </div>
  );
}
