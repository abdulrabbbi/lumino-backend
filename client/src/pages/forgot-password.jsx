/* eslint-disable no-unused-vars */
import { useState } from "react";
import Logo from '../../public/images/logo.svg';
import { MdOutlineMail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../utils/api"; // Adjust the import path as necessary

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/send-otp`, {
                email: email
            });

            if(response.data.success === true){
                toast.success("OTP sent successfully! Check your email");
                setTimeout(() => {
                    navigate("/verify-otp", { state: { email } });
                }, 2000);
            }
            else
            {
                toast.error("Failed to send OTP. Please try again.");
            }
        
        } catch (error) {
            console.error("OTP sending error:", error);
            const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                            <h1 className="text-4xl poppins-700 text-[#000000] mb-2">Forgot Password</h1>
                            <p className="text-[#000000] text-sm inter-tight-400">Enter your email address</p>
                        </div>

                        <div className="text-center h-[2px] bg-[#D4D4D4]"></div>

                        <div className="space-y-4">
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
                            <button
                                className={`w-full h-12 ${
                                    email
                                        ? "bg-black text-white cursor-pointer"
                                        : "bg-gray-300 text-white cursor-not-allowed"
                                } inter-tight-700 rounded-xl flex items-center justify-center`}
                                disabled={!email || loading}
                                onClick={handleSendOtp}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : "Continue"}
                            </button>
                            
                            <div>
                                <span className="text-[#8A8A8A] text-sm">This site is protected by reCAPTCHA and the Google Privacy Policy.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}