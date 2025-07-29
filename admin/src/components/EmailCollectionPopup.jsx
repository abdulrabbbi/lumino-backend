/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { toast } from "react-toastify"

const EmailCollectionPopup = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // State to control animation

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 10)
    return () => clearTimeout(timer)
  }, [])

  // Handler for animated closing
  const handleClose = () => {
    setIsOpen(false) // Trigger exit animation
    // Wait for the animation to complete before unmounting the component
    setTimeout(() => {
      onClose() // Call the parent's onClose prop
    }, 300) // This duration should match the CSS transition duration
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit(email)
      toast.success("Thank you for subscribing!")
      handleClose() // Use the animated close handler
    } catch (error) {
      toast.error("Error submitting email. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`
        fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
        transition-opacity duration-300 ease-out
        ${isOpen ? "opacity-100" : "opacity-0"}
      `}
    >
      <div
        className={`
          bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl relative overflow-hidden
          transform transition-all duration-300 ease-out
          ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
        `}
      >
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] bg-cover bg-center opacity-5 pointer-events-none"></div>

        <div className="relative z-10">
          {" "}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl poppins-700 text-gray-900">Stay Updated!</h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200 p-2 rounded-md bg-gray-50"
              aria-label="Close popup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700 mb-6 inter-tight-400 leading-relaxed">
            Get access to exclusive activities and educational resources by subscribing to our newsletter. Don't miss
            out on valuable insights!
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-5 py-3 border border-gray-300 inter-tight-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800 text-base"
                required
                aria-label="Email address"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose} // Use animated close handler
                className="px-6 py-2 text-gray-600 inter-tight-400 text-sm cursor-pointer hover:text-gray-900 font-medium rounded-lg transition-colors duration-200"
              >
                Maybe Later
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r inter-tight-400 text-sm cursor-pointer from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? "Submitting..." : "Subscribe Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EmailCollectionPopup
