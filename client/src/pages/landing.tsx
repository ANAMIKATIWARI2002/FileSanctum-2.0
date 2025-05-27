import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Server, Lock, Zap, Mail, Phone, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [countryCode, setCountryCode] = useState("+1");
  const [loginType, setLoginType] = useState("email");

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
          <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Server className="w-12 h-12 text-primary mx-auto mb-4 transition-all duration-300 hover:text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Distributed Architecture</h3>
              <p className="text-slate-600">
                Fault-tolerant distributed storage with automatic node recovery and load balancing
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-4 transition-all duration-300 hover:text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-slate-600">
                AES-256 encryption with client-side key management for maximum security
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4 transition-all duration-300 hover:text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-slate-600">
                Live system analytics, node health monitoring, and performance metrics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Authentication Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TabsContent value="login" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Sign In to FileSanctum</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Login Method</Label>
                      <Tabs value={loginType} onValueChange={setLoginType}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="email" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </TabsTrigger>
                          <TabsTrigger value="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    {loginType === "email" ? (
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" placeholder="Enter your email" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="login-phone">Phone Number</Label>
                        <div className="flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                              <SelectItem value="+91">🇮🇳 +91</SelectItem>
                              <SelectItem value="+86">🇨🇳 +86</SelectItem>
                              <SelectItem value="+49">🇩🇪 +49</SelectItem>
                              <SelectItem value="+33">🇫🇷 +33</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input id="login-phone" type="tel" placeholder="Enter phone number" className="flex-1" />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="Enter your password" />
                    </div>
                    
                    <Button 
                      onClick={() => window.location.href = '/api/login'}
                      className="w-full"
                      size="lg"
                    >
                      Sign In to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Create Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" placeholder="john@example.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">🇺🇸 +1</SelectItem>
                            <SelectItem value="+44">🇬🇧 +44</SelectItem>
                            <SelectItem value="+91">🇮🇳 +91</SelectItem>
                            <SelectItem value="+86">🇨🇳 +86</SelectItem>
                            <SelectItem value="+49">🇩🇪 +49</SelectItem>
                            <SelectItem value="+33">🇫🇷 +33</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input id="reg-phone" type="tel" placeholder="1234567890" className="flex-1" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" type="password" placeholder="Create a strong password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" placeholder="Confirm your password" />
                    </div>
                    
                    <Button className="w-full" size="lg">
                      Create Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Technical Details */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-primary mr-2" />
            <h3 className="text-2xl font-bold text-slate-900">Technical Specifications</h3>
            <Sparkles className="w-6 h-6 text-primary ml-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">6+3</div>
                <div className="text-sm font-medium text-slate-700">Erasure Coding</div>
                <div className="text-xs text-slate-500 mt-1">Reed-Solomon</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:text-purple-700 transition-colors">AES-256</div>
                <div className="text-sm font-medium text-slate-700">Encryption</div>
                <div className="text-xs text-slate-500 mt-1">Client-Side Keys</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-green-50 to-green-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-green-600 mb-2 group-hover:text-green-700 transition-colors">99.9%</div>
                <div className="text-sm font-medium text-slate-700">Uptime</div>
                <div className="text-xs text-slate-500 mt-1">SLA Guaranteed</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-orange-50 to-orange-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-orange-600 mb-2 group-hover:text-orange-700 transition-colors">10GB</div>
                <div className="text-sm font-medium text-slate-700">Max File Size</div>
                <div className="text-xs text-slate-500 mt-1">Per Upload</div>
              </div>
            </div>
          </div>
          
          {/* Additional tech specs row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-indigo-50 to-indigo-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">WebSocket</div>
                <div className="text-sm font-medium text-slate-700">Real-time Updates</div>
                <div className="text-xs text-slate-500 mt-1">Live Monitoring</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-teal-50 to-teal-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-teal-600 mb-2 group-hover:text-teal-700 transition-colors">Multi-Node</div>
                <div className="text-sm font-medium text-slate-700">Distribution</div>
                <div className="text-xs text-slate-500 mt-1">Fault Tolerant</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-white via-rose-50 to-rose-100 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-rose-600 mb-2 group-hover:text-rose-700 transition-colors">REST API</div>
                <div className="text-sm font-medium text-slate-700">Integration</div>
                <div className="text-xs text-slate-500 mt-1">Developer Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
