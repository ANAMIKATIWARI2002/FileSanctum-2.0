import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, Trash2, FileText, Image, Video, Music, File as FileIcon, Server, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

interface File {
  id: number;
  name: string;
  originalName: string;
  size: string;
  mimeType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function UploadedFiles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isNodeSelectionMode, setIsNodeSelectionMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });

  // Fetch available nodes for selection
  const { data: nodes = [] } = useQuery({
    queryKey: ["/api/nodes"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "File deleted",
        description: "File has been permanently deleted",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  // Move files to selected node mutation
  const moveFilesToNodeMutation = useMutation({
    mutationFn: async ({ fileIds, nodeId }: { fileIds: number[], nodeId: number }) => {
      const response = await apiRequest("PUT", "/api/files/move-to-node", {
        fileIds,
        nodeId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setSelectedFiles([]);
      setIsNodeSelectionMode(false);
      setSelectedNodeId("");
      toast({
        title: "Files moved successfully",
        description: "Selected files have been moved to the chosen node",
      });
    },
    onError: () => {
      toast({
        title: "Move failed",
        description: "Failed to move files to the selected node",
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleSelectFile = (fileId: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(filteredFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleMoveFiles = () => {
    if (selectedFiles.length > 0 && selectedNodeId) {
      moveFilesToNodeMutation.mutate({
        fileIds: selectedFiles,
        nodeId: parseInt(selectedNodeId),
      });
    }
  };

  const handleCancelNodeSelection = () => {
    setIsNodeSelectionMode(false);
    setSelectedFiles([]);
    setSelectedNodeId("");
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.startsWith("video/")) return Video;
    if (mimeType.startsWith("audio/")) return Music;
    if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
    return FileIcon;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "text-blue-600";
    if (mimeType.startsWith("video/")) return "text-purple-600";
    if (mimeType.startsWith("audio/")) return "text-green-600";
    if (mimeType.includes("pdf")) return "text-red-600";
    return "text-slate-600";
  };

  const formatFileSize = (bytes: string) => {
    const size = parseFloat(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      stored: "default" as const,
      uploading: "secondary" as const,
      replicating: "outline" as const,
      failed: "destructive" as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || 
      (filterType === "documents" && (file.mimeType.includes("pdf") || file.mimeType.includes("document"))) ||
      (filterType === "images" && file.mimeType.startsWith("image/")) ||
      (filterType === "videos" && file.mimeType.startsWith("video/")) ||
      (filterType === "audio" && file.mimeType.startsWith("audio/"));
    
    return matchesSearch && matchesType;
  });

  const handleDownload = async (file: File) => {
    try {
      const response = await fetch(`/api/files/${file.id}/download`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${file.originalName}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: `Failed to download ${file.originalName}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (fileId: number) => {
    if (confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      deleteMutation.mutate(fileId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900">Uploaded Files</CardTitle>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="videos">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsNodeSelectionMode(!isNodeSelectionMode)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Server className="w-4 h-4" />
              <span>Move to Node</span>
            </Button>
          </div>
        </div>

        {/* Node Selection Mode Interface */}
        {isNodeSelectionMode && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                <CheckSquare className="w-4 h-4 mr-2" />
                Select Files to Move
              </h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Select All ({selectedFiles.length} of {filteredFiles.length} selected)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose target node..." />
                </SelectTrigger>
                <SelectContent>
                  {(nodes as any[]).map((node: any) => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      {node.name} ({node.ipAddress}) {node.isDefault && "⭐"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleMoveFiles}
                disabled={selectedFiles.length === 0 || !selectedNodeId || moveFilesToNodeMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {moveFilesToNodeMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Moving...
                  </>
                ) : (
                  <>Move Files</>
                )}
              </Button>
              
              <Button
                onClick={handleCancelNodeSelection}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredFiles.length === 0 ? (
          <div className="text-center py-8">
            <FileIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No files found</h3>
            <p className="text-slate-600">
              {searchQuery || filterType !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Upload your first file to get started"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {isNodeSelectionMode && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">
                      Select
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-20">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredFiles.map((file) => {
                  const FileIconComponent = getFileIcon(file.mimeType);
                  return (
                    <tr key={file.id} className={selectedFiles.includes(file.id) ? 'bg-blue-50' : ''}>
                      {isNodeSelectionMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileIconComponent 
                            className={`w-5 h-5 mr-3 ${getFileTypeColor(file.mimeType)}`}
                          />
                          <span className="text-sm font-medium text-slate-900 truncate max-w-48" title={file.originalName}>
                            {file.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="truncate max-w-16" title={file.mimeType}>
                          {file.mimeType.includes('pdf') ? 'PDF' : 
                           file.mimeType.includes('document') ? 'DOC' :
                           file.mimeType.includes('image') ? 'IMG' :
                           file.mimeType.includes('video') ? 'VID' :
                           file.mimeType.includes('audio') ? 'AUD' :
                           file.mimeType.split('/')[1]?.toUpperCase().substring(0, 4) || 'FILE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {format(new Date(file.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(file.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            disabled={file.status !== "stored"}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
