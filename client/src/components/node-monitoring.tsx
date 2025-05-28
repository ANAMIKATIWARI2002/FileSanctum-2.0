import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Server, Cpu, HardDrive, Wifi, Clock, Trash2, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Node {
  id: number;
  name: string;
  ipAddress: string;
  status: string;
  storageCapacity: string;
  storageUsed: string;
  cpuUsage: string;
  memoryUsage: string;
  networkThroughput: string;
  uptime: string;
  lastHeartbeat: string;
}

export default function NodeMonitoring() {
  const { toast } = useToast();
  const { data: nodes = [], isLoading } = useQuery<Node[]>({
    queryKey: ["/api/nodes"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: number) => {
      const response = await apiRequest("DELETE", `/api/nodes/${nodeId}`);
      if (!response.ok) {
        throw new Error("Failed to delete node");
      }
      const result = await response.json();
      console.log("Delete response:", result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/nodes"] });
      queryClient.refetchQueries({ queryKey: ["/api/nodes"] });
      toast({
        title: "Success",
        description: data.message || "Node deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete node",
        variant: "destructive",
      });
    },
  });

  const recoverNodeMutation = useMutation({
    mutationFn: async (nodeId: number) => {
      const response = await fetch(`/api/nodes/${nodeId}/recover`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to recover node");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nodes"] });
      toast({
        title: "Success",
        description: "Node recovery initiated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to recover node",
        variant: "destructive",
      });
    },
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
    const variants: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
      healthy: "default",
      degraded: "outline", 
      failed: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "secondary"}>
        <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(status)}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStoragePercentage = (used: string, capacity: string) => {
    const usedNum = parseFloat(used);
    const capacityNum = parseFloat(capacity);
    return capacityNum > 0 ? (usedNum / capacityNum) * 100 : 0;
  };

  const healthyNodes = nodes.filter(node => node.status === "healthy").length;
  const degradedNodes = nodes.filter(node => node.status === "degraded").length;
  const failedNodes = nodes.filter(node => node.status === "failed").length;
  const totalNodes = nodes.length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cluster Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cluster Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Overall Health</span>
                <span className="text-sm font-medium text-green-600">
                  {totalNodes > 0 ? `${Math.round((healthyNodes / totalNodes) * 100)}%` : "0%"}
                </span>
              </div>
              <Progress 
                value={totalNodes > 0 ? (healthyNodes / totalNodes) * 100 : 0} 
                className="h-3"
              />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{healthyNodes}</p>
                  <p className="text-xs text-slate-600">Healthy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{degradedNodes}</p>
                  <p className="text-xs text-slate-600">Degraded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{failedNodes}</p>
                  <p className="text-xs text-slate-600">Failed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.slice(0, 5).map((node) => {
                const storagePercentage = getStoragePercentage(node.storageUsed, node.storageCapacity);
                return (
                  <div key={node.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{node.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            storagePercentage > 90 ? 'bg-red-500' : 
                            storagePercentage > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${storagePercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 w-8">
                        {Math.round(storagePercentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Node Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Node Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Node
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    CPU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Memory
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Storage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Network
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Uptime
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {nodes.map((node) => (
                  <tr key={node.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Server className="w-4 h-4 text-slate-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {node.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {node.ipAddress}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(node.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {parseFloat(node.cpuUsage).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {parseFloat(node.memoryUsage).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {Math.round(getStoragePercentage(node.storageUsed, node.storageCapacity))}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {parseFloat(node.networkThroughput).toFixed(1)} Gbps
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {parseFloat(node.uptime).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {(node.status === "degraded" || node.status === "failed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => recoverNodeMutation.mutate(node.id)}
                            disabled={recoverNodeMutation.isPending}
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            {recoverNodeMutation.isPending ? "Recovering..." : "Recover"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNodeMutation.mutate(node.id)}
                          disabled={deleteNodeMutation.isPending}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {deleteNodeMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
