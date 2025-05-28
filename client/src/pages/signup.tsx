import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Check, ChevronDown, Search } from "lucide-react";
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

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countryCodes = [
    { code: "+93", country: "AF", flag: "🇦🇫", name: "Afghanistan" },
    { code: "+358", country: "AX", flag: "🇦🇽", name: "Åland Islands" },
    { code: "+355", country: "AL", flag: "🇦🇱", name: "Albania" },
    { code: "+213", country: "DZ", flag: "🇩🇿", name: "Algeria" },
    { code: "+1", country: "AS", flag: "🇦🇸", name: "American Samoa" },
    { code: "+376", country: "AD", flag: "🇦🇩", name: "Andorra" },
    { code: "+244", country: "AO", flag: "🇦🇴", name: "Angola" },
    { code: "+1", country: "AI", flag: "🇦🇮", name: "Anguilla" },
    { code: "+672", country: "AQ", flag: "🇦🇶", name: "Antarctica" },
    { code: "+1", country: "AG", flag: "🇦🇬", name: "Antigua and Barbuda" },
    { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
    { code: "+374", country: "AM", flag: "🇦🇲", name: "Armenia" },
    { code: "+297", country: "AW", flag: "🇦🇼", name: "Aruba" },
    { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
    { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
    { code: "+994", country: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
    { code: "+1", country: "BS", flag: "🇧🇸", name: "Bahamas" },
    { code: "+973", country: "BH", flag: "🇧🇭", name: "Bahrain" },
    { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
    { code: "+1", country: "BB", flag: "🇧🇧", name: "Barbados" },
    { code: "+375", country: "BY", flag: "🇧🇾", name: "Belarus" },
    { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
    { code: "+501", country: "BZ", flag: "🇧🇿", name: "Belize" },
    { code: "+229", country: "BJ", flag: "🇧🇯", name: "Benin" },
    { code: "+1", country: "BM", flag: "🇧🇲", name: "Bermuda" },
    { code: "+975", country: "BT", flag: "🇧🇹", name: "Bhutan" },
    { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
    { code: "+387", country: "BA", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
    { code: "+267", country: "BW", flag: "🇧🇼", name: "Botswana" },
    { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
    { code: "+673", country: "BN", flag: "🇧🇳", name: "Brunei" },
    { code: "+359", country: "BG", flag: "🇧🇬", name: "Bulgaria" },
    { code: "+226", country: "BF", flag: "🇧🇫", name: "Burkina Faso" },
    { code: "+257", country: "BI", flag: "🇧🇮", name: "Burundi" },
    { code: "+855", country: "KH", flag: "🇰🇭", name: "Cambodia" },
    { code: "+237", country: "CM", flag: "🇨🇲", name: "Cameroon" },
    { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
    { code: "+238", country: "CV", flag: "🇨🇻", name: "Cape Verde" },
    { code: "+1", country: "KY", flag: "🇰🇾", name: "Cayman Islands" },
    { code: "+236", country: "CF", flag: "🇨🇫", name: "Central African Republic" },
    { code: "+235", country: "TD", flag: "🇹🇩", name: "Chad" },
    { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
    { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
    { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
    { code: "+269", country: "KM", flag: "🇰🇲", name: "Comoros" },
    { code: "+242", country: "CG", flag: "🇨🇬", name: "Congo" },
    { code: "+243", country: "CD", flag: "🇨🇩", name: "Congo (DRC)" },
    { code: "+682", country: "CK", flag: "🇨🇰", name: "Cook Islands" },
    { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
    { code: "+225", country: "CI", flag: "🇨🇮", name: "Côte d'Ivoire" },
    { code: "+385", country: "HR", flag: "🇭🇷", name: "Croatia" },
    { code: "+53", country: "CU", flag: "🇨🇺", name: "Cuba" },
    { code: "+357", country: "CY", flag: "🇨🇾", name: "Cyprus" },
    { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
    { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
    { code: "+253", country: "DJ", flag: "🇩🇯", name: "Djibouti" },
    { code: "+1", country: "DM", flag: "🇩🇲", name: "Dominica" },
    { code: "+1", country: "DO", flag: "🇩🇴", name: "Dominican Republic" },
    { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
    { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
    { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
    { code: "+240", country: "GQ", flag: "🇬🇶", name: "Equatorial Guinea" },
    { code: "+291", country: "ER", flag: "🇪🇷", name: "Eritrea" },
    { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
    { code: "+251", country: "ET", flag: "🇪🇹", name: "Ethiopia" },
    { code: "+500", country: "FK", flag: "🇫🇰", name: "Falkland Islands" },
    { code: "+298", country: "FO", flag: "🇫🇴", name: "Faroe Islands" },
    { code: "+679", country: "FJ", flag: "🇫🇯", name: "Fiji" },
    { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
    { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
    { code: "+594", country: "GF", flag: "🇬🇫", name: "French Guiana" },
    { code: "+689", country: "PF", flag: "🇵🇫", name: "French Polynesia" },
    { code: "+241", country: "GA", flag: "🇬🇦", name: "Gabon" },
    { code: "+220", country: "GM", flag: "🇬🇲", name: "Gambia" },
    { code: "+995", country: "GE", flag: "🇬🇪", name: "Georgia" },
    { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
    { code: "+233", country: "GH", flag: "🇬🇭", name: "Ghana" },
    { code: "+350", country: "GI", flag: "🇬🇮", name: "Gibraltar" },
    { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
    { code: "+299", country: "GL", flag: "🇬🇱", name: "Greenland" },
    { code: "+1", country: "GD", flag: "🇬🇩", name: "Grenada" },
    { code: "+590", country: "GP", flag: "🇬🇵", name: "Guadeloupe" },
    { code: "+1", country: "GU", flag: "🇬🇺", name: "Guam" },
    { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
    { code: "+44", country: "GG", flag: "🇬🇬", name: "Guernsey" },
    { code: "+224", country: "GN", flag: "🇬🇳", name: "Guinea" },
    { code: "+245", country: "GW", flag: "🇬🇼", name: "Guinea-Bissau" },
    { code: "+592", country: "GY", flag: "🇬🇾", name: "Guyana" },
    { code: "+509", country: "HT", flag: "🇭🇹", name: "Haiti" },
    { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
    { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
    { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
    { code: "+354", country: "IS", flag: "🇮🇸", name: "Iceland" },
    { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
    { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
    { code: "+98", country: "IR", flag: "🇮🇷", name: "Iran" },
    { code: "+964", country: "IQ", flag: "🇮🇶", name: "Iraq" },
    { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
    { code: "+44", country: "IM", flag: "🇮🇲", name: "Isle of Man" },
    { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
    { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
    { code: "+1", country: "JM", flag: "🇯🇲", name: "Jamaica" },
    { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
    { code: "+44", country: "JE", flag: "🇯🇪", name: "Jersey" },
    { code: "+962", country: "JO", flag: "🇯🇴", name: "Jordan" },
    { code: "+7", country: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
    { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
    { code: "+686", country: "KI", flag: "🇰🇮", name: "Kiribati" },
    { code: "+850", country: "KP", flag: "🇰🇵", name: "North Korea" },
    { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
    { code: "+965", country: "KW", flag: "🇰🇼", name: "Kuwait" },
    { code: "+996", country: "KG", flag: "🇰🇬", name: "Kyrgyzstan" },
    { code: "+856", country: "LA", flag: "🇱🇦", name: "Laos" },
    { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
    { code: "+961", country: "LB", flag: "🇱🇧", name: "Lebanon" },
    { code: "+266", country: "LS", flag: "🇱🇸", name: "Lesotho" },
    { code: "+231", country: "LR", flag: "🇱🇷", name: "Liberia" },
    { code: "+218", country: "LY", flag: "🇱🇾", name: "Libya" },
    { code: "+423", country: "LI", flag: "🇱🇮", name: "Liechtenstein" },
    { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
    { code: "+352", country: "LU", flag: "🇱🇺", name: "Luxembourg" },
    { code: "+853", country: "MO", flag: "🇲🇴", name: "Macao" },
    { code: "+389", country: "MK", flag: "🇲🇰", name: "Macedonia" },
    { code: "+261", country: "MG", flag: "🇲🇬", name: "Madagascar" },
    { code: "+265", country: "MW", flag: "🇲🇼", name: "Malawi" },
    { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
    { code: "+960", country: "MV", flag: "🇲🇻", name: "Maldives" },
    { code: "+223", country: "ML", flag: "🇲🇱", name: "Mali" },
    { code: "+356", country: "MT", flag: "🇲🇹", name: "Malta" },
    { code: "+692", country: "MH", flag: "🇲🇭", name: "Marshall Islands" },
    { code: "+596", country: "MQ", flag: "🇲🇶", name: "Martinique" },
    { code: "+222", country: "MR", flag: "🇲🇷", name: "Mauritania" },
    { code: "+230", country: "MU", flag: "🇲🇺", name: "Mauritius" },
    { code: "+262", country: "YT", flag: "🇾🇹", name: "Mayotte" },
    { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
    { code: "+691", country: "FM", flag: "🇫🇲", name: "Micronesia" },
    { code: "+373", country: "MD", flag: "🇲🇩", name: "Moldova" },
    { code: "+377", country: "MC", flag: "🇲🇨", name: "Monaco" },
    { code: "+976", country: "MN", flag: "🇲🇳", name: "Mongolia" },
    { code: "+382", country: "ME", flag: "🇲🇪", name: "Montenegro" },
    { code: "+1", country: "MS", flag: "🇲🇸", name: "Montserrat" },
    { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
    { code: "+258", country: "MZ", flag: "🇲🇿", name: "Mozambique" },
    { code: "+95", country: "MM", flag: "🇲🇲", name: "Myanmar" },
    { code: "+264", country: "NA", flag: "🇳🇦", name: "Namibia" },
    { code: "+674", country: "NR", flag: "🇳🇷", name: "Nauru" },
    { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
    { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
    { code: "+687", country: "NC", flag: "🇳🇨", name: "New Caledonia" },
    { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
    { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
    { code: "+227", country: "NE", flag: "🇳🇪", name: "Niger" },
    { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
    { code: "+683", country: "NU", flag: "🇳🇺", name: "Niue" },
    { code: "+672", country: "NF", flag: "🇳🇫", name: "Norfolk Island" },
    { code: "+1", country: "MP", flag: "🇲🇵", name: "Northern Mariana Islands" },
    { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
    { code: "+968", country: "OM", flag: "🇴🇲", name: "Oman" },
    { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
    { code: "+680", country: "PW", flag: "🇵🇼", name: "Palau" },
    { code: "+970", country: "PS", flag: "🇵🇸", name: "Palestine" },
    { code: "+507", country: "PA", flag: "🇵🇦", name: "Panama" },
    { code: "+675", country: "PG", flag: "🇵🇬", name: "Papua New Guinea" },
    { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
    { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
    { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
    { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
    { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
    { code: "+1", country: "PR", flag: "🇵🇷", name: "Puerto Rico" },
    { code: "+974", country: "QA", flag: "🇶🇦", name: "Qatar" },
    { code: "+262", country: "RE", flag: "🇷🇪", name: "Réunion" },
    { code: "+40", country: "RO", flag: "🇷🇴", name: "Romania" },
    { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
    { code: "+250", country: "RW", flag: "🇷🇼", name: "Rwanda" },
    { code: "+290", country: "SH", flag: "🇸🇭", name: "Saint Helena" },
    { code: "+1", country: "KN", flag: "🇰🇳", name: "Saint Kitts and Nevis" },
    { code: "+1", country: "LC", flag: "🇱🇨", name: "Saint Lucia" },
    { code: "+508", country: "PM", flag: "🇵🇲", name: "Saint Pierre and Miquelon" },
    { code: "+1", country: "VC", flag: "🇻🇨", name: "Saint Vincent and the Grenadines" },
    { code: "+685", country: "WS", flag: "🇼🇸", name: "Samoa" },
    { code: "+378", country: "SM", flag: "🇸🇲", name: "San Marino" },
    { code: "+239", country: "ST", flag: "🇸🇹", name: "São Tomé and Príncipe" },
    { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+221", country: "SN", flag: "🇸🇳", name: "Senegal" },
    { code: "+381", country: "RS", flag: "🇷🇸", name: "Serbia" },
    { code: "+248", country: "SC", flag: "🇸🇨", name: "Seychelles" },
    { code: "+232", country: "SL", flag: "🇸🇱", name: "Sierra Leone" },
    { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
    { code: "+421", country: "SK", flag: "🇸🇰", name: "Slovakia" },
    { code: "+386", country: "SI", flag: "🇸🇮", name: "Slovenia" },
    { code: "+677", country: "SB", flag: "🇸🇧", name: "Solomon Islands" },
    { code: "+252", country: "SO", flag: "🇸🇴", name: "Somalia" },
    { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
    { code: "+500", country: "GS", flag: "🇬🇸", name: "South Georgia" },
    { code: "+211", country: "SS", flag: "🇸🇸", name: "South Sudan" },
    { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
    { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
    { code: "+249", country: "SD", flag: "🇸🇩", name: "Sudan" },
    { code: "+597", country: "SR", flag: "🇸🇷", name: "Suriname" },
    { code: "+47", country: "SJ", flag: "🇸🇯", name: "Svalbard and Jan Mayen" },
    { code: "+268", country: "SZ", flag: "🇸🇿", name: "Swaziland" },
    { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
    { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
    { code: "+963", country: "SY", flag: "🇸🇾", name: "Syria" },
    { code: "+886", country: "TW", flag: "🇹🇼", name: "Taiwan" },
    { code: "+992", country: "TJ", flag: "🇹🇯", name: "Tajikistan" },
    { code: "+255", country: "TZ", flag: "🇹🇿", name: "Tanzania" },
    { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
    { code: "+670", country: "TL", flag: "🇹🇱", name: "Timor-Leste" },
    { code: "+228", country: "TG", flag: "🇹🇬", name: "Togo" },
    { code: "+690", country: "TK", flag: "🇹🇰", name: "Tokelau" },
    { code: "+676", country: "TO", flag: "🇹🇴", name: "Tonga" },
    { code: "+1", country: "TT", flag: "🇹🇹", name: "Trinidad and Tobago" },
    { code: "+216", country: "TN", flag: "🇹🇳", name: "Tunisia" },
    { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
    { code: "+993", country: "TM", flag: "🇹🇲", name: "Turkmenistan" },
    { code: "+1", country: "TC", flag: "🇹🇨", name: "Turks and Caicos Islands" },
    { code: "+688", country: "TV", flag: "🇹🇻", name: "Tuvalu" },
    { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda" },
    { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
    { code: "+971", country: "AE", flag: "🇦🇪", name: "United Arab Emirates" },
    { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
    { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
    { code: "+998", country: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
    { code: "+678", country: "VU", flag: "🇻🇺", name: "Vanuatu" },
    { code: "+379", country: "VA", flag: "🇻🇦", name: "Vatican City" },
    { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
    { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
    { code: "+1", country: "VG", flag: "🇻🇬", name: "British Virgin Islands" },
    { code: "+1", country: "VI", flag: "🇻🇮", name: "U.S. Virgin Islands" },
    { code: "+681", country: "WF", flag: "🇼🇫", name: "Wallis and Futuna" },
    { code: "+212", country: "EH", flag: "🇪🇭", name: "Western Sahara" },
    { code: "+967", country: "YE", flag: "🇾🇪", name: "Yemen" },
    { code: "+260", country: "ZM", flag: "🇿🇲", name: "Zambia" },
    { code: "+263", country: "ZW", flag: "🇿🇼", name: "Zimbabwe" }
  ];

  // Filter countries based on search term
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm) ||
    country.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected country info
  const selectedCountry = countryCodes.find(c => c.code === signupForm.countryCode) || countryCodes[0];

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  {/* Custom Country Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none min-w-[100px] text-sm flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-xs text-slate-300">{selectedCountry.code}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                    
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 w-80 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50 mt-1" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
                        {/* Search Input */}
                        <div className="p-3 border-b border-slate-600">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-slate-600 border border-slate-500 text-white rounded-md pl-10 pr-3 py-2 text-sm focus:border-blue-400 focus:outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                        
                        {/* Country List */}
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setSignupForm({ ...signupForm, countryCode: country.code });
                                  setIsCountryDropdownOpen(false);
                                  setSearchTerm("");
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-600 flex items-center space-x-3 text-sm text-white"
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="flex-1">{country.name} ({country.country})</span>
                                <span className="text-slate-400">{country.code}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-slate-400 text-sm">No countries found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
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