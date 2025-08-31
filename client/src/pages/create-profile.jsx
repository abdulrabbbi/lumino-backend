/* eslint-disable no-unused-vars */
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../public/images/logo.svg'
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

export default function CreateProfile() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isTestFamily, setIsTestFamily] = useState(false)
    const [showPopup, setShowPopup] = useState(false)

    const navigate = useNavigate()

    const handleContinue = () => {
        navigate('/user-profile/profile')
    }

    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (token) {
            try {
                const decoded = jwtDecode(token)
                setIsLoggedIn(true)
                setIsTestFamily(decoded?.isTestFamily === true)
            } catch (error) {
                console.error("Failed to decode token", error)
                setIsLoggedIn(false)
                setIsTestFamily(false)
            }
        } else {
            setIsLoggedIn(false)
            setIsTestFamily(false)
        }

        // Show popup after 1.5 seconds
        const timer = setTimeout(() => {
            setShowPopup(true)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen flex relative">
            {/* Left side */}
            <div className="hidden lg:flex lg:w-[25%] bg-gradient-to-br from-purple-100 to-purple-200 items-center justify-center p-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-4">
                        <img src={Logo} alt="" />
                    </div>
                </div>
            </div>

            {/* Right side */}
            <div className="w-full lg:w-[55%] flex items-center justify-center lg:justify-end md:p-8 p-4 bg-white max-lg:relative">
                <div className="absolute lg:right-10 top-6 text-sm inter-tight-400 text-gray-600">
                    Already a Member?{" "}
                    <Link to="/signup" className="text-gray-900 font-medium hover:underline">
                        Sign up
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-6">
                        <div className="text-left">
                            <h1 className="text-4xl poppins-700 text-[#000000] mb-2">Profiel aanmaken</h1>
                        </div>
                        <div>
                            <span className='text-sm text-[#8A8A8A] inter-tight-400'>
                                Bijna klaar! Laten we je avontuurlijke buddyprofiel afronden!
                            </span>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleContinue}
                                className="w-full h-12 bg-[#000000] inter-tight-700 text-white rounded-xl cursor-pointer"
                            >
                                profiel aanmaken
                            </button>
                        </div>

                        {!isTestFamily && (
                            <Link to={"/test-register"}>
                                <div className='flex justify-center items-center'>
                                    <span className='text-[#8A8A8A] text-sm cursor-pointer underline'>
                                        Abonnees Testers Familie
                                    </span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Animated Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <h2 className="text-xl font-semibold poppins-700 mb-3">Herinnering</h2>
                            <p className="text-gray-600 inter-tight-400 mb-6">
                                Om je profiel compleet te maken, zorg ervoor dat je je <strong>Leeftijdsgroep</strong> toevoegt.
                            </p>
                            <div className="flex mt-6 justify-center gap-4">
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="px-6 py-2 bg-gray-300 inter-tight-400 text-sm cursor-pointer rounded-lg hover:bg-gray-400 transition"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={handleContinue}
                                    className="px-4 py-2 bg-black inter-tight-400 text-sm cursor-pointer text-white rounded-lg hover:bg-gray-800 transition"
                                >
                                    Nu bijwerken
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
