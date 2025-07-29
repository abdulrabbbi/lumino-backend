/* eslint-disable no-unused-vars */
import { motion } from "framer-motion"

const Badge = ({ badge, size = "default" }) => {
  if (!badge) return null

  const sizeClasses = {
    small: {
      container: "w-16 h-16",
      inner: "w-14 h-14",
      icon: "w-6 h-6",
      title: "text-sm",
      description: "text-xs",
    },
    default: {
      container: "w-24 h-24",
      inner: "w-20 h-20",
      icon: "w-10 h-10",
      title: "text-lg",
      description: "text-sm",
    },
    large: {
      container: "w-32 h-32",
      inner: "w-28 h-28",
      icon: "w-14 h-14",
      title: "text-xl",
      description: "text-base",
    },
  }

  const classes = sizeClasses[size]

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
      className="flex-1 flex justify-center sm:justify-end"
    >
      <div className="rounded-2xl border border-[#D9D9D9] p-3 h-60 shadow-xl w-full">
        <div className="flex justify-center mb-3">
          <div className={`${classes.container} rounded-2xl flex items-center justify-center`}>
            <div className={`${classes.inner} rounded-xl shadow-2xl bg-[#FFF6F7] flex items-center justify-center`}>
              <img src={badge.icon || "/placeholder.svg"} alt={badge.name} className={classes.icon} />
            </div>
          </div>
        </div>
        <h3 className={`${classes.title} font-bold text-black text-center inter-tight-400`}>{badge.name}</h3>
        <p className={`mt-1 ${classes.description} text-[#828282] inter-tight-400 text-center`}>{badge.description}</p>
      </div>
    </motion.div>
  )
}

export default Badge
