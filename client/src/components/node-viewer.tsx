import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Server, HardDrive, Activity, Wifi } from "lucide-react";

interface Node {
  id: number;
  name: string;
  ipAddress: string;
  status: string;
  storageCapacity: string;
  storageUsed: string;
  uptime: string;
}

export default function NodeViewer() {
  const { data: nodes = [], isLoading } = useQuery<Node[]>({
    queryKey: ["/api/nodes"],
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: "default",
      degraded: "outline",
      failed: "destructive",
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(status)}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStoragePercentage = (used: string, capacity: string) => {
    const usedNum = parseFloat(used);
    const capacityNum = parseFloat(capacity);
    return capacityNum > 0 ? Math.round((usedNum / capacityNum) * 100) : 0;
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
        <CardTitle>Node Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const storagePercentage = getStoragePercentage(node.storageUsed, node.storageCapacity);
            
            return (
              <div
                key={node.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-slate-600" />
                    <h4 className="font-medium text-slate-900">{node.name}</h4>
                  </div>
                  {getStatusBadge(node.status)}
                </div>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-slate-400" />
                    <span>IP: {node.ipAddress}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-slate-400" />
                      <span>Storage: {storagePercentage}% used</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        storagePercentage > 90 ? 'bg-red-500' : 
                        storagePercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${storagePercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span>Uptime: {parseFloat(node.uptime).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {nodes.length === 0 && (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No nodes found</h3>
            <p className="text-slate-600">
              Add nodes to your cluster to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
