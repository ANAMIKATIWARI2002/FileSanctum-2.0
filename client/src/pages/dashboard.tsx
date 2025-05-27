import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";

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
  const { user } = useAuth();

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
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                    <i className="fas fa-server text-primary text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Active Nodes</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {systemStats?.activeNodes || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="fas fa-hdd text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Storage Used</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {systemStats?.totalStorage || "0 GB"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="fas fa-file text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Files</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {systemStats?.totalFiles || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="fas fa-shield-alt text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Encryption</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {systemStats?.encryptionLevel || "AES-256"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Node Management and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NodeManagement />
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Node Status Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Healthy Nodes</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemStats?.nodeStatus?.healthy || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Degraded Nodes</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {systemStats?.nodeStatus?.degraded || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Failed Nodes</span>
                    <span className="text-sm font-medium text-red-600">
                      {systemStats?.nodeStatus?.failed || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: systemStats?.nodeStatus 
                          ? `${(systemStats.nodeStatus.healthy / (systemStats.nodeStatus.healthy + systemStats.nodeStatus.degraded + systemStats.nodeStatus.failed)) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Node Viewer */}
            <NodeViewer />

            {/* Erasure Coding Info */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Erasure Coding & Encryption Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Erasure Coding</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Data Chunks (k)</span>
                      <span className="text-sm font-medium">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Parity Chunks (m)</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Fault Tolerance</span>
                      <span className="text-sm font-medium text-green-600">3 node failures</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Storage Efficiency</span>
                      <span className="text-sm font-medium">66.7%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">End-to-End Encryption</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Algorithm</span>
                      <span className="text-sm font-medium">AES-256-GCM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Key Management</span>
                      <span className="text-sm font-medium">Client-side</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Encrypted Files</span>
                      <span className="text-sm font-medium text-green-600">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="text-sm font-medium text-green-600">Active</span>
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {getSectionTitle(activeSection)}
              </h2>
              <p className="text-slate-600">
                {getSectionSubtitle(activeSection)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-600">System Online</span>
              </div>
              <div className="text-sm text-slate-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 overflow-y-auto h-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
