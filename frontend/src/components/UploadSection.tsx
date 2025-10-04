// frontend/src/components/UploadSection.tsx (with debugging logs)
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert } from "./ui/alert";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadSectionProps {
  onUploadSuccess: (filename: string) => void;
  isCompact?: boolean;
}

export function UploadSection({ onUploadSuccess, isCompact = false }: UploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("1. File input changed."); // DEBUG LOG 1
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        console.log("2. PDF file selected:", file.name); // DEBUG LOG 2
        setSelectedFile(file);
        setAlert(null);
      } else {
        setAlert({
          type: "error",
          message: "Please select a valid PDF file",
        });
        setSelectedFile(null);
      }
    }
  };

  // Removed Test Connection button and handler for a cleaner UI

  const handleUpload = async () => {
    console.log("3. Upload button clicked."); // DEBUG LOG 3
    if (!selectedFile) {
      console.log("4. No file selected, stopping upload."); // DEBUG LOG 4
      setAlert({
        type: "error",
        message: "Please select a PDF file first",
      });
      return;
    }

    setIsUploading(true);
    setAlert(null);

    try {
      console.log("5. Starting file upload API call..."); // DEBUG LOG 5
      console.log("5a. Selected file details:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified
      });
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      console.log("5b. FormData created, entries:", Array.from(formData.entries()));

      const response = await fetch("https://infogenie-himm.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      console.log("5c. Fetch completed, response status:", response.status);
      console.log("5d. Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log("5e. Response data:", data);
        setUploadedFile(selectedFile.name);
        setAlert({
          type: "success",
          message: data.message || "PDF uploaded successfully!",
        });
        onUploadSuccess(selectedFile.name);
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        console.log("5f. Error response:", errorData);
        throw new Error(errorData.detail || "Upload failed");
      }
    } catch (error) {
      console.error("5g. Upload error:", error);
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload PDF. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={`bg-card border-border shadow-sm transition-all duration-300 ${isCompact ? 'p-3' : 'p-6'}`}>
      <div className={`space-y-4 ${isCompact ? 'space-y-2' : 'space-y-4'}`}>
        <div className={`flex items-center gap-2 ${isCompact ? 'mb-2' : 'mb-4'}`}>
          <FileText className={`text-primary ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <h2 className={`${isCompact ? 'text-sm font-medium' : 'text-base font-semibold'}`}>
            {isCompact ? 'PDF Upload' : 'Upload PDF Document'}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-colors"
              disabled={isUploading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="sm:w-auto w-full"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
        {selectedFile && !uploadedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Selected: {selectedFile.name}</span>
          </div>
        )}
        {uploadedFile && (
          <Badge variant="secondary" className="w-fit">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Current: {uploadedFile}
          </Badge>
        )}
        {alert && (
          <Alert
            className={
              alert.type === "success"
                ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-950/20 dark:text-green-400"
                : "border-destructive bg-destructive/10 text-destructive"
            }
          >
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="ml-2">{alert.message}</p>
          </Alert>
        )}
      </div>
    </Card>
  );
}