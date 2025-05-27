import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Server, Lock, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">FileSanctum</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Distributed File Storage System with advanced erasure coding, end-to-end encryption, and real-time monitoring
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Server className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Distributed Architecture</h3>
              <p className="text-slate-600">
                Fault-tolerant distributed storage with automatic node recovery and load balancing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-slate-600">
                AES-256 encryption with client-side key management for maximum security
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-slate-600">
                Live system analytics, node health monitoring, and performance metrics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Access FileSanctum</h2>
            <p className="text-slate-600 mb-6">
              Sign in to manage your distributed file storage system
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
              size="lg"
            >
              Sign In to Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Specifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">6+3</div>
              <div className="text-sm text-slate-600">Erasure Coding</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">AES-256</div>
              <div className="text-sm text-slate-600">Encryption</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-slate-600">Uptime</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">10GB</div>
              <div className="text-sm text-slate-600">Max File Size</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
