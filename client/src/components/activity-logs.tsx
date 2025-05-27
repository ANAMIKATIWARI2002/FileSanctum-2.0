import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Upload, 
  Download, 
  Trash2, 
  Server, 
  User, 
  UserPlus, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function ActivityLogs() {
  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "file_upload_started":
      case "file_upload_completed":
        return Upload;
      case "file_downloaded":
        return Download;
      case "file_deleted":
        return Trash2;
      case "node_added":
      case "node_recovery":
        return Server;
      case "user_login":
        return User;
      case "user_invited":
        return UserPlus;
      case "security_event":
        return Shield;
      default:
        return CheckCircle;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "file_upload_completed":
      case "node_added":
      case "user_login":
        return "text-green-600 bg-green-100";
      case "file_upload_started":
        return "text-blue-600 bg-blue-100";
      case "file_deleted":
      case "node_failure":
        return "text-red-600 bg-red-100";
      case "node_recovery":
      case "user_invited":
        return "text-yellow-600 bg-yellow-100";
      case "security_event":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      file_upload_started: "File Upload Started",
      file_upload_completed: "File Upload Completed",
      file_downloaded: "File Downloaded",
      file_deleted: "File Deleted",
      node_added: "Node Added",
      node_recovery: "Node Recovery",
      node_failure: "Node Failure",
      user_login: "User Login",
      user_invited: "User Invited",
      security_event: "Security Event",
    };
    return labels[action] || action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionDescription = (log: ActivityLog) => {
    const { action, details } = log;
    
    switch (action) {
      case "file_upload_started":
        return `Started uploading ${details?.fileName} (${details?.fileSize})`;
      case "file_upload_completed":
        return `Successfully uploaded ${details?.fileName}`;
      case "file_deleted":
        return `Deleted file ${details?.fileName}`;
      case "node_added":
        return `Added ${details?.nodeName} (${details?.ipAddress}) to cluster`;
      case "node_recovery":
        return `Recovered node ${details?.nodeName}`;
      case "user_login":
        return `User logged in successfully`;
      case "user_invited":
        return `Invited ${details?.email} as ${details?.role}`;
      default:
        return `Performed ${getActionLabel(action).toLowerCase()}`;
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
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No activity yet</h3>
            <p className="text-slate-600">
              Activity logs will appear here as you use the system
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {logs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              const actionColor = getActionColor(log.action);
              
              return (
                <div
                  key={log.id}
                  className="flex items-start space-x-4 pb-4 border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actionColor}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-slate-900">
                        {getActionLabel(log.action)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {log.resource}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {getActionDescription(log)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>{format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                      {log.ipAddress && <span>{log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
