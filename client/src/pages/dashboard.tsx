import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import Sidebar from "@/components/sidebar";
import FileUpload from "@/components/file-upload";
import UploadedFiles from "@/components/uploaded-files";
import ActivityLogs from "@/components/activity-logs";
import NodeMonitoring from "@/components/node-monitoring";
import SystemAnalytics from "@/components/system-analytics";
import UserInvite from "@/components/user-invite";
import NodeViewer from "@/components/node-viewer";
import NodeManagement from "@/components/node-management";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardSection = 
  | "dashboard" 
  | "file-upload" 
  | "uploaded-files" 
  | "activity-logs" 
  | "node-monitoring" 
  | "system-analytics" 
  | "user-invite";

export default function Dashboard() {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAuth();

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // System stats
  const { data: systemStats } = useQuery({
    queryKey: ["/api/system/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (section && ["dashboard", "file-upload", "uploaded-files", "activity-logs", "node-monitoring", "system-analytics", "user-invite"].includes(section)) {
      setActiveSection(section as DashboardSection);
    }
  }, [section]);

  const getSectionTitle = (section: DashboardSection) => {
    const titles = {
      dashboard: "Dashboard",
      "file-upload": "File Upload",
      "uploaded-files": "Uploaded Files",
      "activity-logs": "Activity Logs",
      "node-monitoring": "Node Monitoring",
      "system-analytics": "System Analytics",
      "user-invite": "User Invite",
    };
    return titles[section];
  };

  const getSectionSubtitle = (section: DashboardSection) => {
    const subtitles = {
      dashboard: "Real-time system overview and monitoring",
      "file-upload": "Upload and manage your files securely",
      "uploaded-files": "View and manage uploaded files",
      "activity-logs": "Monitor system and user activities",
      "node-monitoring": "Real-time node health and performance",
      "system-analytics": "Performance metrics and analytics",
      "user-invite": "Invite users to collaborate",
    };
    return subtitles[section];
  };

  const renderContent = () => {
    switch (activeSection) {
      case "file-upload":
        return <FileUpload />;
      case "uploaded-files":
        return <UploadedFiles />;
      case "activity-logs":
        return <ActivityLogs />;
      case "node-monitoring":
        return <NodeMonitoring />;
      case "system-analytics":
        return <SystemAnalytics />;
      case "user-invite":
        return <UserInvite />;
      default:
        return (
          <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-600 font-medium">Active Nodes</p>
                    <p className="text-2xl font-bold text-blue-900">6</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-orange-300 rounded"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-600 font-medium">Storage Used</p>
                    <p className="text-2xl font-bold text-orange-900">56.0 GB</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-4 bg-purple-300 rounded-sm"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-purple-600 font-medium">Total Files</p>
                    <p className="text-2xl font-bold text-purple-900">2,568</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-300 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-600 font-medium">Encryption</p>
                    <p className="text-lg font-bold text-green-900">AES-256</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Four Main Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Quick File Operations */}
              <QuickFileOperations />

              {/* Section 2: System Analytics */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Storage Usage</span>
                      <span className="text-sm font-semibold text-gray-900">46.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46.7%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Network I/O</span>
                      <span className="text-sm font-semibold text-gray-900">32.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '32.1%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="text-sm font-semibold text-gray-900">28.4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '28.4%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Node Visualization */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Visualization</h3>
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${i < 4 ? 'bg-green-500' : i === 4 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium text-gray-900">Node{i + 1}</span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {i < 4 ? 'Healthy' : i === 4 ? 'Warning' : 'Failed'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{Math.round(Math.random() * 40 + 20)}% Used</div>
                        <div className="text-xs text-gray-500">{(Math.random() * 50 + 10).toFixed(1)} GB</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Node Health & Management */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Health & Management</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">4</div>
                      <div className="text-sm text-gray-600">Healthy</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">1</div>
                      <div className="text-sm text-gray-600">Warning</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">1</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <AddNodeButton />
                    <button 
                      onClick={() => setActiveSection("node-monitoring")}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      🔧 Node Recovery
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">System Status</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={(section: string) => setActiveSection(section as DashboardSection)} />
      
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getSectionTitle(activeSection)}
              </h2>
              <p className="text-gray-600">
                {getSectionSubtitle(activeSection)}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">System Online</span>
              </div>
              <div className="text-sm text-gray-600">
                Last login: {new Date().toLocaleString()}
              </div>
              
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <button 
                onClick={() => {
                  // Clear local storage
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  
                  // Redirect to landing page
                  window.location.href = '/';
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg border-2 border-red-600 hover:border-red-700"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto pb-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Add Node Button Component
function AddNodeButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addNodeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Node${Date.now()}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
          status: 'healthy',
          storageCapacity: `${Math.floor(Math.random() * 500) + 100}`,
          storageUsed: `0`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add node');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/nodes"] });
      toast({
        title: "Node added successfully",
        description: `${data.name} has been added to the cluster`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to add node",
        description: "Could not add the new node to the cluster",
        variant: "destructive",
      });
    },
  });

  return (
    <button 
      onClick={() => addNodeMutation.mutate()}
      disabled={addNodeMutation.isPending}
      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {addNodeMutation.isPending ? "Adding..." : "➕ Add New Node"}
    </button>
  );
}

// Quick File Operations Component
function QuickFileOperations() {
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('redundancyLevel', 'standard');
      formData.append('encryption', 'aes256');
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
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
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been stored securely`,
      });
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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const uploadingFile = {
        file,
        progress: 0,
        status: "uploading" as const,
      };
      setUploadingFiles(prev => [...prev, uploadingFile]);
      uploadMutation.mutate(file);
    });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => {
      const uploadingFile = {
        file,
        progress: 0,
        status: "uploading" as const,
      };
      setUploadingFiles(prev => [...prev, uploadingFile]);
      uploadMutation.mutate(file);
    });
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick File Operations</h3>
      <div className="space-y-4">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleFileSelect}
        >
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Drag & drop files or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">Support for any file type up to 10GB per file</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Choose Files
          </button>
        </div>
        
        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            {uploadingFiles.map((uploadingFile, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{uploadingFile.file.name}</span>
                  <span className="text-sm text-gray-500">
                    {uploadingFile.status === "completed" ? "✅ Completed" : 
                     uploadingFile.status === "error" ? "❌ Failed" : "⏳ Uploading..."}
                  </span>
                </div>
                {uploadingFile.status === "uploading" && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadingFile.progress}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.href = '#uploaded-files'}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            📁 View Files
          </button>
          <button 
            onClick={() => window.location.href = '#uploaded-files'}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            ⬇️ Download
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
