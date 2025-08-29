/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Badge from "./badge"

const BadgeModal = ({ isVisible, onClose, badges = [] }) => {

  // Handle both single badge (backward compatibility) and multiple badges
  let badgeList = []
  if (Array.isArray(badges)) {
    badgeList = badges.filter((badge) => badge && (badge._id || badge.id))
  } else if (badges && typeof badges === "object" && (badges._id || badges.id)) {
    badgeList = [badges]
  }

  const shouldShow = isVisible && badgeList.length > 0

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-3xl p-8 max-w-4xl w-full relative shadow-xl md:max-h-max max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="text-center mb-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl text-[#000000] inter-tight-700 mb-2"
              >
                🎉 Congratulations! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[#000000] inter-tight-400 mb-3 leading-relaxed"
              >
                You've Successfully Completed The Task And Earned{" "}
                {badgeList.length > 1 ? `${badgeList.length} New Badges` : "A New Badge"}!
              </motion.p>
            </div>

            {/* Badge Display */}
            <div className="mb-8">
              {badgeList.length === 1 ? (
                // Single Badge Layout
                <div className="flex flex-col gap-6 justify-center items-center mb-6">
                  <div className="flex-shrink-0">
                    <Badge badge={badgeList[0]} size="large" />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex-1 text-center"
                  >
                    {/* <h3 className="text-xl text-[#000000] inter-tight-700 mb-2">{badgeList[0].name}</h3>
                    <p className="text-[#666666] inter-tight-400 leading-relaxed">{badgeList[0].description}</p> */}
                  </motion.div>
                </div>
              ) : (
                // Multiple Badges Layout
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badgeList.map((badge, index) => (
                    <motion.div
                      key={badge._id || badge.id || index}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.2 + index * 0.1,
                        type: "spring",
                        duration: 0.6,
                      }}
                      className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="mb-3">
                        <Badge badge={badge} size="default" />
                      </div>
                      {/* <h4 className="text-sm font-semibold text-[#000000] mb-1">{badge.name}</h4>
                      <p className="text-xs text-[#666666] inter-tight-400">{badge.description}</p> */}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center text-center inter-tight-400"
            >
              <p className="text-sm text-[#000000] mb-6">
                Keep Up The Great Work And Continue Unlocking More Achievements.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-[#2B60EB] to-[#8F35EA] text-white text-sm rounded-xl hover:from-[#1e4fd6] hover:to-[#7c2dd4] transition-all duration-200 transform hover:scale-105"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BadgeModal
