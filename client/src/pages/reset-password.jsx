import { useState } from "react"
import { MdLockOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Logo from '../../public/images/logo.svg'
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from "../utils/api";

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: location.state?.email || "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const { email, password, confirmPassword } = formData;

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "password") {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 2) return "Weak";
        if (passwordStrength <= 3) return "Medium";
        if (passwordStrength <= 4) return "Strong";
        return "Very Strong";
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return "bg-red-500";
        if (passwordStrength <= 3) return "bg-yellow-500";
        if (passwordStrength <= 4) return "bg-green-500";
        return "bg-green-600";
    };

    const handleResetPassword = async () => {
        if (!email || !password || !confirmPassword) {
            toast.error("Please fill all required fields");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (passwordStrength < 3) {
            toast.error("Password is too weak");
            return;
        }

        setIsLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const body = JSON.stringify({ email, newPassword: password });

            const response =  await axios.post(`${BASE_URL}/reset-password`, body, config);

            if(response.data.success === true) {
            toast.success('Password reset successfully! Redirecting to sign in...');
             setTimeout(() => {
                navigate("/signin");
             }, 2000);
            }
            else
            {
                toast.error(response.data.message);
                return;
            }
          
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to reset password";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = password && confirmPassword && 
                       password === confirmPassword && passwordStrength >= 3;

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
                    <Link to={"/signin"} className="text-gray-900 font-medium hover:underline">
                        <button className="text-gray-900 font-medium hover:underline">
                            Sign in
                        </button>
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-6">
                        <div className="text-left">
                            <h1 className="text-4xl poppins-700 text-[#000000] mb-2">Create New Password</h1>
                            <p className="text-[#000000] text-sm inter-tight-400">
                                Your new password must be different from previous used passwords
                            </p>
                        </div>

                        <div className="text-center h-[2px] bg-[#D4D4D4]"></div>

                        <div className="space-y-4">
                            {/* New Password Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLockOutline className="h-5 w-5 text-[#000000]" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="New password"
                                    value={password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 h-12 border border-[#D4D4D4] text-sm outline-none rounded-xl text-[#000000] px-3"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <MdVisibilityOff className="h-5 w-5 text-[#000000]" />
                                    ) : (
                                        <MdVisibility className="h-5 w-5 text-[#000000]" />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[#8A8A8A]">Password strength</span>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength <= 2 ? "text-red-500" :
                                            passwordStrength <= 3 ? "text-yellow-500" :
                                            passwordStrength <= 4 ? "text-green-500" : "text-green-600"
                                        }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-2 flex-1 rounded-full ${
                                                    level <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLockOutline className="h-5 w-5 text-[#000000]" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 h-12 border border-[#D4D4D4] text-sm outline-none rounded-xl text-[#000000] px-3"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <MdVisibilityOff className="h-5 w-5 text-[#000000]" />
                                    ) : (
                                        <MdVisibility className="h-5 w-5 text-[#000000]" />
                                    )}
                                </button>
                            </div>

                            {confirmPassword && (
                                <div className="text-xs">
                                    {password === confirmPassword ? (
                                        <span className="text-green-500">✓ Passwords match</span>
                                    ) : (
                                        <span className="text-red-500">✗ Passwords don't match</span>
                                    )}
                                </div>
                            )}

                            {/* Password Requirements */}
                            <div className="space-y-2">
                                <p className="text-xs text-[#8A8A8A]">Password must contain:</p>
                                <ul className="text-xs text-[#8A8A8A] space-y-1">
                                    <li className={`flex items-center space-x-2 ${password.length >= 8 ? "text-green-500" : ""}`}>
                                        <span>{password.length >= 8 ? "✓" : "•"}</span>
                                        <span>At least 8 characters</span>
                                    </li>
                                    <li className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? "text-green-500" : ""}`}>
                                        <span>{/[a-z]/.test(password) ? "✓" : "•"}</span>
                                        <span>One lowercase letter</span>
                                    </li>
                                    <li className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? "text-green-500" : ""}`}>
                                        <span>{/[A-Z]/.test(password) ? "✓" : "•"}</span>
                                        <span>One uppercase letter</span>
                                    </li>
                                    <li className={`flex items-center space-x-2 ${/[0-9]/.test(password) ? "text-green-500" : ""}`}>
                                        <span>{/[0-9]/.test(password) ? "✓" : "•"}</span>
                                        <span>One number</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                className={`w-full h-12 ${
                                    isFormValid
                                        ? "bg-black text-white cursor-pointer"
                                        : "bg-gray-300 text-white cursor-not-allowed"
                                } inter-tight-700 rounded-xl transition-colors flex items-center justify-center`}
                                disabled={!isFormValid || isLoading}
                                onClick={handleResetPassword}
                            >
                                {isLoading ? (
                                    <span className="loader">Resetting...</span>
                                ) : (
                                    "Reset Password"
                                )}
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
    )
}