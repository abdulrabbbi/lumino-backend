import { useEffect, useState } from "react"
import Logo from '../../public/images/logo.svg'
import { MdOutlineMail } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { BASE_URL } from "../utils/api.js";    

export default function SignUpPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [referralCode, setReferralCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showReferralSuccess, setShowReferralSuccess] = useState(false)

    useEffect(() => {
        const refCode = searchParams.get('ref')
        if (refCode) {
            setReferralCode(refCode)
            setShowReferralSuccess(true)
            toast.success(`Referral applied`)
            
            // Auto-hide the success message after 5 seconds
            const timer = setTimeout(() => {
                setShowReferralSuccess(false)
            }, 5000)
            
            return () => clearTimeout(timer)
        }
    }, [searchParams])

    const handleRegister = async () => {
        if (!email || !username || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

     
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      username,
      email,
      password,
      referralCode: referralCode || undefined
    });

    if (response.data.success === true) {
      if (response.data.referralApplied) {
        toast.success(`Registration successful! You and ${response.data.referrer} both received 1 month free!`);
      } else {
        toast.success("Registration successful! Redirecting to sign in...");
      }
      
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } else {
      toast.error("Registration failed, Try Again!");
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (axios.isAxiosError(error)) {
      // Handle specific referral errors
      if (error.response?.status === 400 && error.response?.data?.error?.includes("referral")) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.response?.data?.error || "An error occurred during registration");
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  } finally {
    setIsLoading(false);
  }
}

    return (
        <div className="min-h-screen flex relative">
            <div className="hidden lg:flex lg:w-[25%] bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center p-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-4">
                        <img src={Logo} alt="" />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end md:p-8 p-4 bg-white max-lg:relative">
                <div className="absolute lg:right-10 top-6 right-4 text-sm inter-tight-400 text-gray-600">
                    Already a Member?{" "}
                    <Link to="/signin" className="text-gray-900 font-medium hover:underline">
                        Sign in
                    </Link>
                </div>
                <div className="w-full max-w-md space-y-6 pt-16 lg:pt-0">
                    <div className="space-y-6">
                        <div className="text-left">
                            <h1 className="text-4xl poppins-700 text-[#000000] mb-2">Sign Up</h1>
                            <p className="text-[#000000] text-sm inter-tight-400">Sign up with Open account</p>
                        </div>

                        {/* Referral Success Banner */}
                        {showReferralSuccess && (
                            <div className="bg-green-100 border inter-tight-400 text-sm border-green-400 text-green-700 px-4 py-3 rounded-lg relative">
                                <span className="block sm:inline mr-2">🎉 Referral applied! You'll receive 1 month free after signing up.</span>
                            </div>
                        )}

                        <div className=" flex items-center gap-2">
                            <button className="w-full h-12 border border-[#D4D4D4] rounded-xl transition-all duration-500 ease-in-out hover:bg-gray-50 flex items-center justify-center space-x-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-[#000000] inter-tight-700 text-sm cursor-pointer">Google</span>
                            </button>

                            <button className="w-full h-12 border border-[#D4D4D4] rounded-xl transition-all duration-500 ease-in-out hover:bg-gray-50 flex items-center justify-center space-x-3">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span className="text-[#000000] inter-tight-700 text-sm cursor-pointer">Apple ID</span>
                            </button>
                        </div>

                        <div className="text-center h-[2px] bg-[#D4D4D4]"></div>

                        <div className="text-sm inter-tight-400 text-[#000000] cursor-pointer">
                            <span>Or continue with email address</span>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdDriveFileRenameOutline className="h-5 w-5 text-[#000000]" />
                                </div>
                                <input
                                    type="username"
                                    placeholder="Your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 h-12 border border-[#D4D4D4] text-sm outline-none rounded-xl text-[#000000] px-3"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdOutlineMail className="h-5 w-5 text-[#000000]" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 h-12 border border-[#D4D4D4] text-sm outline-none rounded-xl text-[#000000] px-3"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLockOutline className="h-5 w-5 text-[#000000]" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Your Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 h-12 border border-[#D4D4D4] text-sm outline-none rounded-xl text-[#000000] px-3"
                                />
                            </div>

                            <button
                                className={`w-full h-12 ${
                                    email && username && password
                                        ? "bg-black text-white cursor-pointer"
                                        : "bg-gray-300 text-white cursor-not-allowed"
                                } inter-tight-700 rounded-xl flex items-center justify-center`}
                                disabled={!email || !username || !password || isLoading}
                                onClick={handleRegister}
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {isLoading ? "Processing..." : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}