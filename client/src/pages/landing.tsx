import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Server, Lock, Zap, Mail, Phone, Sparkles } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/image_1748358794124.png";

export default function Landing() {
  const [countryCode, setCountryCode] = useState("+1");
  const [loginType, setLoginType] = useState("email");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-80 h-auto bg-gradient-to-br from-pink-300 to-pink-400 rounded-lg p-8 shadow-2xl">
              <div className="flex flex-col items-center">
                {/* Diamond Logo */}
                <div className="relative mb-6">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="transform rotate-45">
                    {/* Outer diamond */}
                    <rect x="20" y="20" width="80" height="80" fill="none" stroke="#5B21B6" strokeWidth="3" rx="2"/>
                    {/* Middle diamond */}
                    <rect x="30" y="30" width="60" height="60" fill="none" stroke="#5B21B6" strokeWidth="3" rx="2"/>
                    {/* Inner diamonds */}
                    <rect x="40" y="40" width="40" height="40" fill="#5B21B6" rx="2"/>
                    <rect x="52" y="52" width="16" height="16" fill="#F8BBD9" rx="1"/>
                  </svg>
                </div>
                
                {/* Text */}
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-purple-800 mb-2 tracking-wider">FILE SANCTUM</h1>
                  <p className="text-sm font-medium text-purple-700 tracking-widest">ACCESS EVERYWHERE. COMPROMISE NOWHERE</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Distributed File Storage System with advanced erasure coding, end-to-end encryption, and real-time monitoring
          </p>
        </div>

        {/* Authentication Section - Moved here */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-slate-800/90 border-2 border-slate-600 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-700 border-slate-600">
                  <TabsTrigger value="login" className="text-slate-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="text-slate-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">Sign In to FileSanctum</h3>
                      <p className="text-slate-300">Access your distributed file storage system</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-200">Login Method</Label>
                        <Tabs value={loginType} onValueChange={setLoginType}>
                          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                            <TabsTrigger value="email" className="flex items-center gap-2 text-slate-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                              <Mail className="w-4 h-4" />
                              Email
                            </TabsTrigger>
                            <TabsTrigger value="phone" className="flex items-center gap-2 text-slate-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                              <Phone className="w-4 h-4" />
                              Phone
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      {loginType === "email" ? (
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-slate-200">Email</Label>
                          <Input id="login-email" type="email" placeholder="Enter your email" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="login-phone" className="text-slate-200">Phone Number</Label>
                          <div className="flex gap-2">
                            <Select value={countryCode} onValueChange={setCountryCode}>
                              <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="+1">🇺🇸 United States (+1)</SelectItem>
                                <SelectItem value="+44">🇬🇧 United Kingdom (+44)</SelectItem>
                                <SelectItem value="+91">🇮🇳 India (+91)</SelectItem>
                                <SelectItem value="+86">🇨🇳 China (+86)</SelectItem>
                                <SelectItem value="+49">🇩🇪 Germany (+49)</SelectItem>
                                <SelectItem value="+33">🇫🇷 France (+33)</SelectItem>
                                <SelectItem value="+81">🇯🇵 Japan (+81)</SelectItem>
                                <SelectItem value="+82">🇰🇷 South Korea (+82)</SelectItem>
                                <SelectItem value="+61">🇦🇺 Australia (+61)</SelectItem>
                                <SelectItem value="+55">🇧🇷 Brazil (+55)</SelectItem>
                                <SelectItem value="+7">🇷🇺 Russia (+7)</SelectItem>
                                <SelectItem value="+39">🇮🇹 Italy (+39)</SelectItem>
                                <SelectItem value="+34">🇪🇸 Spain (+34)</SelectItem>
                                <SelectItem value="+31">🇳🇱 Netherlands (+31)</SelectItem>
                                <SelectItem value="+46">🇸🇪 Sweden (+46)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input id="login-phone" type="tel" placeholder="Enter phone number" className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-slate-200">Password</Label>
                        <Input id="login-password" type="password" placeholder="Enter your password" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                      </div>
                      
                      <Button 
                        onClick={() => window.location.href = '/api/login'}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        size="lg"
                      >
                        Sign In to Dashboard
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="mt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">Create Account</h3>
                      <p className="text-slate-300">Join FileSanctum distributed storage network</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-slate-200">First Name</Label>
                          <Input id="first-name" placeholder="John" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-slate-200">Last Name</Label>
                          <Input id="last-name" placeholder="Doe" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-slate-200">Email</Label>
                        <Input id="reg-email" type="email" placeholder="john@example.com" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone" className="text-slate-200">Phone Number</Label>
                        <div className="flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="+1">🇺🇸 United States (+1)</SelectItem>
                              <SelectItem value="+44">🇬🇧 United Kingdom (+44)</SelectItem>
                              <SelectItem value="+91">🇮🇳 India (+91)</SelectItem>
                              <SelectItem value="+86">🇨🇳 China (+86)</SelectItem>
                              <SelectItem value="+49">🇩🇪 Germany (+49)</SelectItem>
                              <SelectItem value="+33">🇫🇷 France (+33)</SelectItem>
                              <SelectItem value="+81">🇯🇵 Japan (+81)</SelectItem>
                              <SelectItem value="+82">🇰🇷 South Korea (+82)</SelectItem>
                              <SelectItem value="+61">🇦🇺 Australia (+61)</SelectItem>
                              <SelectItem value="+55">🇧🇷 Brazil (+55)</SelectItem>
                              <SelectItem value="+7">🇷🇺 Russia (+7)</SelectItem>
                              <SelectItem value="+39">🇮🇹 Italy (+39)</SelectItem>
                              <SelectItem value="+34">🇪🇸 Spain (+34)</SelectItem>
                              <SelectItem value="+31">🇳🇱 Netherlands (+31)</SelectItem>
                              <SelectItem value="+46">🇸🇪 Sweden (+46)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input id="reg-phone" type="tel" placeholder="1234567890" className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-slate-200">Password</Label>
                        <Input id="reg-password" type="password" placeholder="Create a strong password" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-slate-200">Confirm Password</Label>
                        <Input id="confirm-password" type="password" placeholder="Confirm your password" className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" />
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800" size="lg">
                        Create Account
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-slate-800/80 border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 hover:bg-gradient-to-br hover:from-blue-900/50 hover:to-blue-800/50 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Server className="w-12 h-12 text-blue-400 mx-auto mb-4 transition-all duration-300 hover:text-blue-300" />
              <h3 className="text-lg font-semibold mb-2 text-white">Distributed Architecture</h3>
              <p className="text-slate-300">
                Fault-tolerant distributed storage with automatic node recovery and load balancing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:bg-gradient-to-br hover:from-purple-900/50 hover:to-purple-800/50 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4 transition-all duration-300 hover:text-purple-300" />
              <h3 className="text-lg font-semibold mb-2 text-white">End-to-End Encryption</h3>
              <p className="text-slate-300">
                AES-256 encryption with client-side key management for maximum security
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25 hover:scale-105 hover:bg-gradient-to-br hover:from-green-900/50 hover:to-green-800/50 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-green-400 mx-auto mb-4 transition-all duration-300 hover:text-green-300" />
              <h3 className="text-lg font-semibold mb-2 text-white">Real-time Monitoring</h3>
              <p className="text-slate-300">
                Live system analytics, node health monitoring, and performance metrics
              </p>
            </CardContent>
          </Card>
        </div>



        {/* Technical Details */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-blue-400 mr-2" />
            <h3 className="text-2xl font-bold text-white">Technical Specifications</h3>
            <Sparkles className="w-6 h-6 text-purple-400 ml-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-blue-900/30 to-blue-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">6+3</div>
                <div className="text-sm font-medium text-slate-200">Erasure Coding</div>
                <div className="text-xs text-slate-400 mt-1">Reed-Solomon</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-purple-900/30 to-purple-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:text-purple-300 transition-colors">AES-256</div>
                <div className="text-sm font-medium text-slate-200">Encryption</div>
                <div className="text-xs text-slate-400 mt-1">Client-Side Keys</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-green-900/30 to-green-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors">99.9%</div>
                <div className="text-sm font-medium text-slate-200">Uptime</div>
                <div className="text-xs text-slate-400 mt-1">SLA Guaranteed</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-orange-900/30 to-orange-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-orange-400 mb-2 group-hover:text-orange-300 transition-colors">10GB</div>
                <div className="text-sm font-medium text-slate-200">Max File Size</div>
                <div className="text-xs text-slate-400 mt-1">Per Upload</div>
              </div>
            </div>
          </div>
          
          {/* Additional tech specs row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-indigo-900/30 to-indigo-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-indigo-400 mb-2 group-hover:text-indigo-300 transition-colors">WebSocket</div>
                <div className="text-sm font-medium text-slate-200">Real-time Updates</div>
                <div className="text-xs text-slate-400 mt-1">Live Monitoring</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-teal-900/30 to-teal-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-teal-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-teal-400 mb-2 group-hover:text-teal-300 transition-colors">Multi-Node</div>
                <div className="text-sm font-medium text-slate-200">Distribution</div>
                <div className="text-xs text-slate-400 mt-1">Fault Tolerant</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-rose-900/30 to-rose-800/30 border border-slate-600 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-rose-500/25 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-rose-400 mb-2 group-hover:text-rose-300 transition-colors">REST API</div>
                <div className="text-sm font-medium text-slate-200">Integration</div>
                <div className="text-xs text-slate-400 mt-1">Developer Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
