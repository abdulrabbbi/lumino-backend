import mongoose from "mongoose"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import path from "path"
import Badge from "./src/Models/Badge.js" // Make sure this path is correct for your project

// 🔧 Cloudinary Config
cloudinary.config({
  cloud_name: "dswrj90zp", // <-- replace this
  api_key: "617781714337174", // <-- replace this
  api_secret: "gIvgzn5pB5FE2cn7Q7MHeYn5m10", // <-- replace this
})

// 📂 Absolute Path
const __dirname = path.resolve()
const badges = [
  // Core Progression
  {
    name: "First Step",
    description: "Voltooid je eerste activiteit samen met je kind.",
    icon: "/profile-images/Frame.svg",
    category: "Core Progression",
  },
  {
    name: "5-In-A Row",
    description: "Voltooi samen met je kind alle 5 activiteiten in een week.",
    icon: "/profile-images/Frame-1.svg",
    category: "Core Progression",
  },
  {
    name: "Consistency Champ",
    description: "4+ weken aaneengesloten activiteiten voltooid met je kind.",
    icon: "/profile-images/Frame-3.svg",
    category: "Core Progression",
  },
  {
    name: "Bounce Back",
    description: "3 of meer veerkracht-activiteiten voltooid samen.",
    icon: "/profile-images/Frame (6).svg",
    category: "Core Progression",
  },
  {
    name: "Gratitude Giver",
    description: "3 of meer dankbaarheidsactiviteiten samen voltooid.",
    icon: "/profile-images/Frame (7).svg",
    category: "Core Progression",
  },
  {
    name: "Focus Finisher",
    description: "3 of meer focus-activiteiten samen voltooid.",
    icon: "/profile-images/Frame (8).svg",
    category: "Core Milestone",
  },

  // Learning Area
  {
    name: "Feelings Finder",
    description: "3 of meer emotionele gezondheid-activiteiten voltooid met je kind.",
    icon: "/profile-images/Frame (6)-new.svg",
    category: "Learning Area Badge",
  },
  {
    name: "Gratitude Giver (Area)",
    description: "3 of meer dankbaarheidsactiviteiten voltooid met je kind.",
    icon: "/profile-images/Frame (7)-new.svg",
    category: "Learning Area Badge",
  },
  {
    name: "Self Care Star",
    description: "3 of meer zelfzorgactiviteiten voltooid met je kind.",
    icon: "/profile-images/Frame (8)-new.svg",
    category: "Learning Area Badge",
  },
  {
    name: "Money Minded",
    description: "3 of meer financiële activiteiten voltooid met je kind.",
    icon: "/profile-images/Frame (9).svg",
    category: "Learning Area Badge",
  },
  {
    name: "Mini Maker",
    description: "3 of meer ondernemerschapsactiviteiten voltooid met je kind.",
    icon: "/profile-images/Frame (10).svg",
    category: "Learning Area Badge",
  },
  {
    name: "Creative Thinker",
    description: "3 of meer creatieve activiteiten voltooid met je kind om verbeeldingskracht te stimuleren.",
    icon: "/profile-images/Frame (11).svg",
    category: "Learning Area Badge",
  },

  // Bonus
  {
    name: "Idea Contributor",
    description: "Samen met je kind een activiteitidee ingestuurd.",
    icon: "/profile-images/Frame (6)-new-1.svg",
    category: "Bonus Badge",
  },
  {
    name: "Early Adopter",
    description: "Je bent een van de eerste 1000 gebruikers samen met je kind.",
    icon: "/profile-images/Frame (7)-new-1.svg",
    category: "Bonus Badge",
  },
  {
    name: "Mobile Explorer",
    description: "3 of meer zelfzorgactiviteiten voltooid via mobiel.",
    icon: "/profile-images/Frame (8)-new-1.svg",
    category: "Bonus Badge",
  },
  {
    name: "Social Shoutout",
    description: "Inhoud gedeeld op sociale media met je kind.",
    icon: "/profile-images/Frame (9)-new-1.svg",
    category: "Bonus Badge",
  },
  {
    name: "Surprise Streak",
    description: "Willekeurige badge voor leuke betrokkenheid met je kind.",
    icon: "/profile-images/Frame (10)-new-1.svg",
    category: "Bonus Badge",
  },

  // High Achiever
  {
    name: "Master Parent",
    description: "Een ouder die alles heeft voltooid - en meer.",
    icon: "/profile-images/Frame (11)-new-2.svg",
    category: "High Achiever Badge",
  },
  {
    name: "Champion",
    description: "Activiteiten elke week voltooid voor 12 opeenvolgende weken.",
    icon: "/profile-images/Frame (12).svg",
    category: "High Achiever Badge",
  },
  {
    name: "Categories Master",
    description: "Alle activiteiten in een leergebied voltooid samen.",
    icon: "/profile-images/Frame (13).svg",
    category: "High Achiever Badge",
  },
  {
    name: "Surprise Player",
    description: "3 of meer verborgen badges ontgrendeld met je kind.",
    icon: "/profile-images/Frame (14).svg",
    category: "High Achiever Badge",
  },
  {
    name: "Streak Builder",
    description: "3 weken achter elkaar activiteiten voltooid met je kind.",
    icon: "/profile-images/Frame (16).svg",
    category: "High Achiever Badge",
  },
]

// 📤 Upload Image to Cloudinary
const uploadImage = async (localPath) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "badge-icons",
    })
    return result.secure_url
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err)
    return null
  }
}

// 🚀 Main Seeding Function
const seedBadges = async () => {
  try {
    await mongoose.connect(
     "mongodb+srv://liveDB:1Stoner1@cluster0.6li9xu4.mongodb.net/lummilo?retryWrites=true&w=majority&appName=Cluster0"
    )
    
    console.log("✅ MongoDB connected")

    // Clear existing badges to prevent duplicates on re-seeding
    await Badge.deleteMany({})
    console.log("🗑️ Existing badges cleared.")

    const updatedBadges = []
    for (const badge of badges) {
      const localPath = path.join(__dirname, "../client/public", badge.icon) // Adjust path if 'client' is not in root
      if (!fs.existsSync(localPath)) {
        console.warn(`⚠️ Image not found: ${localPath}. Skipping badge: ${badge.name}`)
        continue
      }
      const uploadedUrl = await uploadImage(localPath)
      if (uploadedUrl) {
        updatedBadges.push({ ...badge, icon: uploadedUrl })
        console.log(`✅ Uploaded and prepared: ${badge.name}`)
      }
    }

    if (updatedBadges.length > 0) {
      await Badge.insertMany(updatedBadges)
      console.log("🎉 All badges seeded successfully to DB with Cloudinary URLs.")
    } else {
      console.log("ℹ️ No badges were uploaded/seeded.")
    }

    await mongoose.disconnect()
    console.log("🔌 MongoDB disconnected.")
  } catch (err) {
    console.error("❌ Error seeding badges:", err)
  }
}

seedBadges()
