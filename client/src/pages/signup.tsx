import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Check } from "lucide-react";
import { Link } from "wouter";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+1",
    phoneNumber: "",
    agreeTerms: false
  });

  const countryCodes = [
    { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
    { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
    { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
    { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
    { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
    { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
    { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
    { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
    { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
    { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
    { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
    { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
    { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
    { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
    { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" }
  ];

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Replit authentication for registration
    window.location.href = '/api/login';
  };

  const passwordRequirements = [
    { met: signupForm.password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(signupForm.password), text: "One uppercase letter" },
    { met: /[a-z]/.test(signupForm.password), text: "One lowercase letter" },
    { met: /\d/.test(signupForm.password), text: "One number" },
    { met: /[!@#$%^&*]/.test(signupForm.password), text: "One special character" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 mb-4 cursor-pointer">
              <Shield className="h-10 w-10 text-blue-400" />
              <span className="text-3xl font-bold text-white">FileSanctum</span>
            </div>
          </Link>
          <p className="text-slate-300">Join users worldwide in secure file storage</p>
        </div>

        {/* Signup Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Create Account</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Start your secure file storage journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-300">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={signupForm.firstName}
                    onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-300">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-300">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <select 
                    value={signupForm.countryCode}
                    onChange={(e) => setSignupForm({ ...signupForm, countryCode: e.target.value })}
                    className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none w-24"
                  >
                    {countryCodes.map((country, index) => (
                      <option key={index} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="1234567890"
                    value={signupForm.phoneNumber}
                    onChange={(e) => setSignupForm({ ...signupForm, phoneNumber: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 flex-1"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupForm.password && (
                  <div className="space-y-1 text-xs">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className={`flex items-center gap-2 ${req.met ? 'text-green-400' : 'text-slate-400'}`}>
                        <Check className={`h-3 w-3 ${req.met ? 'text-green-400' : 'text-slate-600'}`} />
                        {req.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword && (
                  <p className="text-red-400 text-xs">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input 
                  type="checkbox" 
                  id="agreeTerms"
                  checked={signupForm.agreeTerms}
                  onChange={(e) => setSignupForm({ ...signupForm, agreeTerms: e.target.checked })}
                  className="mt-1 rounded border-slate-600" 
                  required
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-300">
                  I agree to the{" "}
                  <Link href="/terms">
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms of Service</span>
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy">
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={
                  !signupForm.agreeTerms || 
                  signupForm.password !== signupForm.confirmPassword ||
                  !passwordRequirements.every(req => req.met)
                }
              >
                Create My Account
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-slate-600 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => window.location.href = '/api/login'}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center">
              <span className="text-slate-400">Already have an account? </span>
              <Link href="/login">
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                  Sign in here
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/">
            <span className="text-slate-400 hover:text-white cursor-pointer">
              ← Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}