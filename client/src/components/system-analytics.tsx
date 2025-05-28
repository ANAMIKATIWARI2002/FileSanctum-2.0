import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function SystemAnalytics() {
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const storageChartRef = useRef<HTMLCanvasElement>(null);

  const { data: metrics = [] } = useQuery({
    queryKey: ["/api/metrics"],
    staleTime: 300000, // Consider data fresh for 5 minutes
    refetchInterval: 300000, // Refresh every 5 minutes instead of frequent updates
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/system/stats"],
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 60000, // Refresh every minute for stats
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  useEffect(() => {
    // Performance Chart
    if (performanceChartRef.current && (window as any).Chart) {
      const ctx = performanceChartRef.current.getContext('2d');
      if (ctx) {
        new (window as any).Chart(ctx, {
          type: 'line',
          data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
              label: 'Throughput (GB/s)',
              data: [1.2, 1.8, 2.1, 1.9, 2.3, 1.7],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              tension: 0.4,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                }
              },
              x: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                }
              }
            }
          }
        });
      }
    }

    // Storage Chart
    if (storageChartRef.current && (window as any).Chart) {
      const ctx = storageChartRef.current.getContext('2d');
      if (ctx) {
        new (window as any).Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Used', 'Available'],
            datasets: [{
              data: [65, 35],
              backgroundColor: ['#2563eb', '#e2e8f0'],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              }
            }
          }
        });
      }
    }

    // Load Chart.js if not already loaded
    if (!(window as any).Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        // Recreate charts after Chart.js loads
        window.location.reload();
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <canvas ref={performanceChartRef} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '250px' }}>
              <canvas ref={storageChartRef} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Read</span>
                <span className="text-sm font-medium">1.2 GB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Write</span>
                <span className="text-sm font-medium">0.8 GB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Network</span>
                <span className="text-sm font-medium">2.1 GB/s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reliability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Availability</span>
                <span className="text-sm font-medium text-green-600">99.95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Data Integrity</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Recovery Time</span>
                <span className="text-sm font-medium">&lt; 5 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Storage Efficiency</span>
                <span className="text-sm font-medium">66.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Compression</span>
                <span className="text-sm font-medium">2.3:1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Deduplication</span>
                <span className="text-sm font-medium">1.8:1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {(systemStats as any)?.activeNodes || 0}
              </div>
              <div className="text-sm text-slate-600">Active Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(systemStats as any)?.totalStorage || "0 GB"}
              </div>
              <div className="text-sm text-slate-600">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {(systemStats as any)?.totalFiles || 0}
              </div>
              <div className="text-sm text-slate-600">Files Stored</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {(systemStats as any)?.encryptionLevel || "AES-256"}
              </div>
              <div className="text-sm text-slate-600">Encryption</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
