import { Shield, Upload, Folder, History, Server, BarChart3, UserPlus, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "file-upload", label: "File Upload", icon: Upload },
    { id: "uploaded-files", label: "Uploaded Files", icon: Folder },
    { id: "activity-logs", label: "Activity Logs", icon: History },
    { id: "node-monitoring", label: "Node Monitoring", icon: Server },
    { id: "system-analytics", label: "System Analytics", icon: BarChart3 },
    { id: "user-invite", label: "User Invite", icon: UserPlus },
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
    <div className="w-72 bg-card text-card-foreground flex flex-col border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FileSanctum</h1>
            <p className="text-gray-500 text-sm">DFSS Dashboard</p>
          </div>
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
                  className={`w-full justify-start space-x-3 h-12 ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email
              }
            </p>
            <p className="text-gray-500 text-sm">{user?.role || "User"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
