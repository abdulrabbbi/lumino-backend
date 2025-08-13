import { useState, useRef, useEffect } from "react";
import Logo from '../../public/images/logo.svg';
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../utils/api";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const verifyOtp = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/verify-otp`, {
                email: email,
                otp: otpCode
            });

            if(response.data.success === true){
                toast.success("OTP verified successfully!");
                setTimeout(() => {
                    navigate("/reset-password", { state: { email } });
                }, 2000);
            }
            else
            {
                toast.error("OTP verification failed. Please try again.");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
            const errorMessage = error.response?.data?.message || "OTP verification failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            const response = await axios.post(`${BASE_URL}/send-otp`, {
                email: email
            });

            if(response.data.success === true){
                toast.success("New OTP sent successfully!");
                setTimer(30);
                setCanResend(false);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }else
            {
                toast.error("Failed to resend OTP. Please try again.");
            }


        } catch (error) {
            console.error("Resend OTP error:", error);
            const errorMessage = error.response?.data?.message || "Failed to resend OTP. Please try again.";
            toast.error(errorMessage);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== "");

    return (
        <div className="min-h-screen flex relative">
            {/* <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            /> */}
           
            <div className="hidden lg:flex lg:w-[25%] bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center p-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-4">
                        <img src={Logo} alt="" />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end md:p-8 p-4 bg-white max-lg:relative">
                <div className="absolute lg:right-10 top-6 text-sm inter-tight-400 text-gray-600">
                    Back to Signin?{" "}
                    <Link to="/signin" className="text-gray-900 font-medium hover:underline">
                        Sign in
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-6">
                        <div className="text-left">
                            <h1 className="text-4xl poppins-700 text-[#000000] mb-2">Enter OTP</h1>
                            <p className="text-[#000000] text-sm inter-tight-400">
                                We've sent a 6-digit code to{" "}
                                <span className="font-medium">{email}</span>
                            </p>
                        </div>

                        <div className="text-center h-[2px] bg-[#D4D4D4]"></div>

                        <div className="space-y-6">
                            {/* OTP Input Fields */}
                            <div className="flex justify-center space-x-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-12 border border-[#D4D4D4] text-center text-lg font-medium outline-none rounded-xl text-[#000000] focus:border-black transition-colors"
                                        maxLength="1"
                                    />
                                ))}
                            </div>

                            {/* Timer and Resend */}
                            <div className="text-center">
                                {!canResend ? (
                                    <p className="text-[#8A8A8A] text-sm">
                                        Resend code in{" "}
                                        <span className="font-medium text-black">
                                            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        className="text-black font-medium text-sm hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>

                            {/* Continue Button */}
                            <button
                                className={`w-full h-12 ${
                                    isOtpComplete && !loading
                                        ? "bg-black text-white cursor-pointer"
                                        : "bg-gray-300 text-white cursor-not-allowed"
                                } inter-tight-700 rounded-xl transition-colors flex items-center justify-center`}
                                disabled={!isOtpComplete || loading}
                                onClick={verifyOtp}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </>
                                ) : "Continue"}
                            </button>

                            <div>
                                <span className="text-[#8A8A8A] text-sm">
                                    This site is protected by reCAPTCHA and the Google Privacy Policy.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}