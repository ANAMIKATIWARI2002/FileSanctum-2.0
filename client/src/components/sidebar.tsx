import { Shield, Upload, Folder, History, Server, BarChart3, UserPlus, Gauge, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "file-upload", label: "File Upload", icon: Upload },
    { id: "uploaded-files", label: "Uploaded Files", icon: Folder },
    { id: "node-monitoring", label: "Node Monitoring", icon: Server },
    { id: "system-analytics", label: "System Analytics", icon: BarChart3 },
    { id: "user-invite", label: "User Invite", icon: UserPlus },
    { id: "activity-logs", label: "Activity Logs", icon: History },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setLocation(section === "dashboard" ? "/" : `/dashboard/${section}`);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to landing page
    window.location.href = '/';
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-card text-card-foreground flex flex-col border-r border-border transition-all duration-300 relative`}>
      {/* Collapse/Expand Button - positioned in middle of right border */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 p-1 h-6 w-6 bg-card border border-border rounded-full hover:bg-secondary shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3 text-card-foreground" /> : <ChevronLeft className="h-3 w-3 text-card-foreground" />}
      </Button>

      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-card-foreground">FileSanctum</h1>
              <p className="text-muted-foreground text-sm">DFSS Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full h-12 ${isCollapsed ? 'justify-center px-0' : 'justify-start space-x-3'} ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-card-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 mb-4">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {user?.firstName?.[0] || user?.email?.[0] || "D"}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-card-foreground">
                Demo User
              </p>
              <p className="text-muted-foreground text-sm">User</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-secondary-foreground">D</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
