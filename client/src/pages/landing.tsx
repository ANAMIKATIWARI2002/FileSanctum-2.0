import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Server, Lock, Zap, Mail, Phone, Sparkles, Menu, X, Users, HelpCircle, MessageCircle, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });
      
      if (response.ok) {
        alert('Message sent successfully!');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Navigation Bar */}
      <nav className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-slate-600 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-black dark:text-white">FileSanctum</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#help" className="text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Help
              </a>
              <a href="#about" className="text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" />
                About Us
              </a>
              <a href="#contact" className="text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Us
              </a>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Log In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Sign Up
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-600">
              <div className="flex flex-col space-y-4">
                <a href="#help" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help
                </a>
                <a href="#about" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  About Us
                </a>
                <a href="#contact" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contact Us
                </a>
                <div className="flex flex-col space-y-2 pt-2">
                  <Button 
                    variant="ghost" 
                    className="text-slate-300 hover:text-white hover:bg-slate-700 justify-start"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Log In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 justify-start"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-black dark:text-white">FileSanctum</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-black dark:text-white mb-6">
            Secure Distributed File Storage
          </h2>
          <p className="text-xl text-gray-700 dark:text-slate-300 max-w-3xl mx-auto mb-10">
            Enterprise-grade distributed file storage system with advanced erasure coding, end-to-end encryption, and real-time monitoring. Store your files with confidence across our global network.
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Free
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-blue-100/50 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Server className="w-12 h-12 text-blue-400 mx-auto mb-4 transition-all duration-300 hover:text-blue-300" />
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Distributed Architecture</h3>
              <p className="text-gray-700 dark:text-slate-300">
                Fault-tolerant distributed storage with automatic node recovery and load balancing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-purple-100/50 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4 transition-all duration-300 hover:text-purple-300" />
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">End-to-End Encryption</h3>
              <p className="text-gray-700 dark:text-slate-300">
                AES-256 encryption with client-side key management for maximum security
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25 hover:scale-105 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-green-100/50 dark:hover:from-green-900/50 dark:hover:to-green-800/50 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-green-400 mx-auto mb-4 transition-all duration-300 hover:text-green-300" />
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Real-time Monitoring</h3>
              <p className="text-gray-700 dark:text-slate-300">
                Live system analytics, node health monitoring, and performance metrics
              </p>
            </CardContent>
          </Card>
        </div>



        {/* Technical Details */}
        <div className="mt-20 text-center" id="help">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-blue-400 mr-2" />
            <h3 className="text-2xl font-bold text-black dark:text-white">Technical Specifications</h3>
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

        {/* About Us Section */}
        <div className="mt-32" id="about">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-6">About FileSanctum</h3>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto">
              FileSanctum revolutionizes data storage with cutting-edge distributed file system technology. 
              Our platform ensures your files are secure, accessible, and protected across a global network 
              of nodes, providing enterprise-grade reliability for businesses and individuals alike.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/80 border-slate-600 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h4 className="text-xl font-semibold text-white mb-4">Enterprise Security</h4>
                <p className="text-slate-300">
                  Military-grade encryption and zero-knowledge architecture ensure your data remains private and secure.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/80 border-slate-600 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Server className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h4 className="text-xl font-semibold text-white mb-4">Global Distribution</h4>
                <p className="text-slate-300">
                  Files are distributed across multiple geographic locations for maximum redundancy and performance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/80 border-slate-600 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Zap className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h4 className="text-xl font-semibold text-white mb-4">Real-time Monitoring</h4>
                <p className="text-slate-300">
                  Live monitoring and analytics provide insights into system performance and file access patterns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-32 mb-16" id="contact">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-black dark:text-white mb-6">Get in Touch</h3>
            <p className="text-xl text-gray-700 dark:text-slate-300 max-w-2xl mx-auto">
              Have questions about FileSanctum? We're here to help you secure your data and optimize your storage strategy.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/80 border-slate-600 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-2xl font-semibold text-white mb-6">Contact Information</h4>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Mail className="w-6 h-6 text-blue-400" />
                        <div>
                          <p className="text-slate-300 font-medium">Support & Inquiries</p>
                          <a 
                            href="mailto:ankitsinghrawat001@gmail.com" 
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            ankitsinghrawat001@gmail.com
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <MessageCircle className="w-6 h-6 text-purple-400" />
                        <div>
                          <p className="text-slate-300 font-medium">Live Support</p>
                          <p className="text-slate-400">Available 24/7 for enterprise customers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <HelpCircle className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-slate-300 font-medium">Documentation</p>
                          <p className="text-slate-400">Comprehensive guides and API documentation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-semibold text-white mb-6">Quick Contact</h4>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                      />
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                      />
                      <textarea 
                        placeholder="Your Message" 
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                      ></textarea>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Send Message
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-600 pt-12 pb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-400 rounded-lg p-1 shadow-lg mr-3">
                <svg width="100%" height="100%" viewBox="0 0 32 32" className="transform rotate-45">
                  <rect x="6" y="6" width="20" height="20" fill="none" stroke="#5B21B6" strokeWidth="1.5" rx="1"/>
                  <rect x="9" y="9" width="14" height="14" fill="none" stroke="#5B21B6" strokeWidth="1.5" rx="1"/>
                  <rect x="12" y="12" width="8" height="8" fill="#5B21B6" rx="1"/>
                  <rect x="14" y="14" width="4" height="4" fill="#F8BBD9" rx="0.5"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">FileSanctum</span>
            </div>
            <p className="text-slate-400 mb-4">
              Access Everywhere. Compromise Nowhere.
            </p>
            <p className="text-slate-500 text-sm">
              © 2024 FileSanctum. All rights reserved. | Distributed File Storage Technology
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
