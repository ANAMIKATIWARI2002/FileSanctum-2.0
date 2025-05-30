import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  XCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const deleteLogsMutation = useMutation({
    mutationFn: async (logIds: number[]) => {
      const response = await apiRequest("DELETE", "/api/activity-logs/bulk", {
        logIds
      });
      if (!response.ok) {
        throw new Error('Failed to delete logs');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
      queryClient.refetchQueries({ queryKey: ["/api/activity-logs"] });
      setSelectedLogs([]);
      setIsDeleteMode(false);
      toast({
        title: "Activity logs deleted",
        description: "Selected activity logs have been removed successfully",
      });
    },
    onError: (error) => {
      console.error("Delete logs error:", error);
      toast({
        title: "Failed to delete logs",
        description: "Could not delete the selected activity logs",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(logs.map((log: ActivityLog) => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (logId: number, checked: boolean) => {
    if (checked) {
      setSelectedLogs(prev => [...prev, logId]);
    } else {
      setSelectedLogs(prev => prev.filter(id => id !== logId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLogs.length > 0) {
      deleteLogsMutation.mutate(selectedLogs);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteMode(false);
    setSelectedLogs([]);
  };

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
        <div className="flex items-center justify-between">
          <CardTitle>Activity Logs</CardTitle>
          <div className="flex items-center space-x-2">
            {isDeleteMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDelete}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedLogs.length === 0 || deleteLogsMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected ({selectedLogs.length})
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteMode(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Activity
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isDeleteMode && logs.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedLogs.length === logs.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Select All Activities
                </span>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-300">
                {selectedLogs.length} of {logs.length} selected
              </span>
            </div>
          </div>
        )}
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
                  className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-yellow-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors border border-yellow-200 dark:border-gray-600"
                >
                  {isDeleteMode && (
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox
                        checked={selectedLogs.includes(log.id)}
                        onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
                      />
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actionColor}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getActionLabel(log.action)}
                      </p>
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                        {log.resource}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {getActionDescription(log)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
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
