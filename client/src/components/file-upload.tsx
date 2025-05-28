import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  id?: number;
}

export default function FileUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [redundancyLevel, setRedundancyLevel] = useState("standard");
  const [encryption, setEncryption] = useState("aes256");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('redundancyLevel', redundancyLevel);
      formData.append('encryption', encryption);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data, file) => {
      setUploadingFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: "completed", progress: 100, id: data.id }
            : uf
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      // Success message will be shown in the upload box itself
    },
    onError: (error, file) => {
      setUploadingFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: "error", progress: 0 }
            : uf
        )
      );
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Start upload for each file
    Array.from(files).forEach(file => {
      // Simulate upload progress
      const fileInState = newFiles.find(f => f.file === file);
      if (fileInState) {
        const interval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(uf => 
              uf.file === file && uf.status === "uploading"
                ? { ...uf, progress: Math.min(uf.progress + 10, 90) }
                : uf
            )
          );
        }, 200);

        setTimeout(() => {
          clearInterval(interval);
          setUploadingFiles(prev => 
            prev.map(uf => 
              uf.file === file && uf.status === "uploading"
                ? { ...uf, status: "processing", progress: 95 }
                : uf
            )
          );
          uploadMutation.mutate(file);
        }, 2000);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-900">Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-slate-600 mb-4">
              Support for any file type up to 10GB per file
            </p>
            <Button>Choose Files</Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              {uploadingFiles.map((uploadingFile, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all duration-500 ${
                    uploadingFile.status === "completed" 
                      ? "bg-green-50 border-green-200" 
                      : uploadingFile.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {uploadingFile.file.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">
                        {formatFileSize(uploadingFile.file.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {uploadingFile.status === "completed" ? (
                    <div className="flex items-center justify-center py-2 bg-green-100 rounded border border-green-200">
                      <div className="flex items-center space-x-2 text-green-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Upload complete - File stored securely!</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Progress value={uploadingFile.progress} className="mb-2" />
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>
                          {uploadingFile.status === "uploading" && "Uploading..."}
                          {uploadingFile.status === "processing" && "Applying erasure coding..."}
                          {uploadingFile.status === "error" && "Upload failed"}
                        </span>
                        <span>{uploadingFile.progress}%</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Settings */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-900">Upload Settings</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Redundancy Level
              </label>
              <Select value={redundancyLevel} onValueChange={setRedundancyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (6+3)</SelectItem>
                  <SelectItem value="high">High (4+2)</SelectItem>
                  <SelectItem value="maximum">Maximum (3+3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Encryption
              </label>
              <Select value={encryption} onValueChange={setEncryption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aes256">AES-256-GCM</SelectItem>
                  <SelectItem value="aes128">AES-128-GCM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
