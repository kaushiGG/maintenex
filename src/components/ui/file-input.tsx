import * as React from "react";
import { cn } from "@/lib/utils";

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="file"
        className={cn(
          "w-full file:border-0 file:bg-gray-100 file:hover:bg-gray-200 file:mr-4 " +
          "file:py-2 file:px-4 file:rounded-md " +
          "border rounded-md px-3 py-2 " +
          "text-sm ring-offset-background file:transition-colors " +
          "file:font-medium focus-visible:outline-none " +
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FileInput.displayName = "FileInput";

export { FileInput }; 
 