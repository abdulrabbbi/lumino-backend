import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import User from "./src/Models/User.js";
import Activity from "./src/Models/Activity.js";

dotenv.config();

const runSeeder = async () => {
    try {
      console.log("Connecting to MongoDB...");
      await mongoose.connect("mongodb+srv://pycess76x_db_user:pjCS6ss56bRMIUtX@cluster0.xbtdnoi.mongodb.net/lummilo?appName=Cluster0");
  
      // Find admin user
      const admin = await User.findOne({ role: "admin" });
      if (!admin) {
        console.log("❌ No admin user found. Cannot seed.");
        process.exit(1);
      }
  
      const rawData = fs.readFileSync("./src/Luumilo_Activiteitenlijst.json", "utf8");
      const activities = JSON.parse(rawData);
  
      console.log(`Found ${activities.length} activities`);
  
      for (let item of activities) {
        // Transform instructions from string to array
        const instructionsArray = item.Stappen
          ? item.Stappen.split(/[0-9]+\.\s*/).filter(s => s.trim() !== "")
          : [];
  
        // Transform learning domain to match frontend exactly
        const transformLearningDomain = (domain) => {
          if (!domain) return "Emotionele Gezondheid"; // default fallback
          
          const domainMap = {
            "emotionele gezondheid": "Emotionele Gezondheid",
            "emotionele gezondheid": "Emotionele Gezondheid", // exact match for your frontend
            "veerkracht": "Veerkracht",
            "dankbaarheid": "Dankbaarheid", 
            "zelfzorg": "Zelfzorg",
            "geldwijsheid": "Geldwijsheid",
            "ondernemerschap": "Ondernemerschap",
            "anders denken": "Anders denken",
            "gezondheid": "Emotionele Gezondheid" // map to existing domain
          };
          
          const normalizedDomain = domain.toLowerCase().trim();
          return domainMap[normalizedDomain] || " "; // safe fallback
        };
  
        // Transform age group to match your format "3 - 4"
        const transformAgeGroup = (ageGroup) => {
            if (!ageGroup) return "3 - 6";
            
            const ageString = ageGroup.toString().toLowerCase().trim();
            
            // Handle "3 tot 4", "3 tot 6", "5 tot 6"
            if (ageString.includes("3 tot 4") || ageString === "3-4" || ageString === "3–4") {
              return "3 - 4";
            } else if (ageString.includes("3 tot 6") || ageString === "3-6" || ageString === "3–6") {
              return "3 - 6";
            } else if (ageString.includes("5 tot 6") || ageString === "5-6" || ageString === "5–6") {
              return "5 - 6";
            }
            
            // Handle hyphen and en-dash formats directly
            if (ageString === "3-4" || ageString === "3–4") return "3 - 4";
            if (ageString === "3-6" || ageString === "3–6") return "3 - 6"; 
            if (ageString === "5-6" || ageString === "5–6") return "5 - 6";
            
            // If it doesn't match any known format, return default
            return "";
          };
  
        // Transform time to extract just the number (remove "min")
        const transformTime = (time) => {
          if (!time) return " "; // default
          
          const timeMatch = time.toString().match(/(\d+)/);
          return timeMatch ? timeMatch[1] : "10";
        };
  
        const activityData = {
          userId: admin._id,
          createdBy: admin._id,
          creatorName: admin.username,
          isApproved: true,
          status: "Actief",
          
          // Transform JSON fields to schema fields
          title: item["Titel"] || " ",
          description: item["Korte uitleg"] || " ",
          instructions: instructionsArray,
          materials: item["Materialen"] || " ",
          learningDomain: transformLearningDomain(item["Leergebied"]),
          effect: item["Effect"] || " ",
          time: transformTime(item["Duur"]),
          ageGroup: transformAgeGroup(item["Leeftijd"]),
          parentInstructions: item["Ouder instructie"] || "",
          category: "library",
          nickname: ""
        };
  
        await Activity.create(activityData);
        console.log(`✔ Inserted: ${item.Titel} (Domain: ${activityData.learningDomain}, Age: ${activityData.ageGroup})`);
      }
  
      console.log("🎉 All activities inserted successfully!");
      process.exit(0);
    } catch (err) {
      console.error("❌ Seeder error:", err);
      process.exit(1);
    }
  };

runSeeder();