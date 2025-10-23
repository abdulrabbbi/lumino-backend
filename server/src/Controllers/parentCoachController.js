// import fs from "fs/promises";
// import path from "path";
// import OpenAI from 'openai';
// import dotenv from "dotenv";
// import { LUUMILO_SYSTEM_PROMPT } from "../Utils/system-prompt.js";

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY_FOR_LUMMILO_PARENT_COACH,
// });

// let ACTIVITIES = [];
// const ACTIVITIES_PATH = path.join(process.cwd(), "src", "Luumilo_Activiteitenlijst.json");

// async function loadActivities() {
//   if (!ACTIVITIES.length) {
//     try {
//       const raw = await fs.readFile(ACTIVITIES_PATH, "utf8");
//       ACTIVITIES = JSON.parse(raw);
//     } catch (error) {
//       console.error("Error loading activities:", error);
//       throw error;
//     }
//   }
// }

// function findActivities(userQuestion, max = 2) {
//   const q = userQuestion.toLowerCase();
//   const tokens = q.split(/\W+/).filter(Boolean);
  
//   const scores = ACTIVITIES.map((a) => {
//     const hay = `${a.Titel || ""} ${a["Korte uitleg"] || ""} ${a.Leergebied || ""}`.toLowerCase();
//     const hayTokens = new Set(hay.split(/\W+/).filter(Boolean));
//     let score = 0;
//     for (const t of tokens) if (hayTokens.has(t)) score++;
//     return { score, activity: a };
//   });
  
//   scores.sort((a, b) => b.score - a.score);
//   const filtered = scores.filter((s) => s.score > 0).map((s) => s.activity);
//   return filtered.slice(0, max);
// }

// function buildUserPrompt(question, activities) {
//   let context = "";
//   if (activities.length) {
//     context =
//       "Relevante activiteiten gevonden in de Luumilo Activity List:\n" +
//       activities
//         .map(
//           (a) =>
//             `Titel: "${a.Titel}"\nKorte uitleg: ${a["Korte uitleg"] || "Geen uitleg beschikbaar"}\nStappen: ${(a.Stappen || "").replace(/\s+/g, " ").trim().substring(0, 200)}`
//         )
//         .join("\n\n");
//   } else {
//     context = "Geen direct passende activiteiten gevonden in de Luumilo Activity List.";
//   }

//   return `${context}

// Vraag van ouder:
// ${question}

// Antwoord als Luumilo Parent Coach volgens alle regels:
// - Gebruik de gevonden activiteiten indien relevant
// - Houd antwoord kort en ondersteunend (2-4 zinnen)
// - Volg alle Luumilo-richtlijnen uit de systeeminstructies`;
// }

// export const handleParentCoach = async (req, res) => {
//   try {
//     const question = (req.body.question || "").trim();
//     if (!question) return res.status(400).json({ error: "Question is required" });

//     await loadActivities();
    
//     const matches = findActivities(question, 2);
//     const userPrompt = buildUserPrompt(question, matches);

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: LUUMILO_SYSTEM_PROMPT
//         },
//         {
//           role: "user",
//           content: userPrompt,
//         },
//       ],
//       max_tokens: 400,
//       temperature: 0.25,
//     });

//     const output = response.choices?.[0]?.message?.content || "";
//     res.json({ answer: output.trim() });
//   } catch (err) {
//     console.error("Error in handleParentCoach:", err.response?.data || err.message || err);
    
//     res.status(500).json({ 
//       error: "server_error", 
//       detail: err.message 
//     });
//   }
// };


import fs from "fs/promises";
import path from "path";
import OpenAI from 'openai';
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_FOR_LUMMILO_PARENT_COACH,
  timeout: 60000, // 60 seconds - some models are slower
  maxRetries: 1,
});

let ACTIVITIES = [];
const ACTIVITIES_PATH = path.join(process.cwd(), "src", "Luumilo_Activiteitenlijst.json");

// Client's prompt settings - DO NOT CHANGE
const LUUMILO_PROMPT_ID = "pmpt_68deb3eb56c88197a764f5d9ecf909c6023134dcf4b55982";
const LUUMILO_PROMPT_VERSION = "40"; // Make sure this matches their latest version

async function loadActivities() {
  if (!ACTIVITIES.length) {
    try {
      const raw = await fs.readFile(ACTIVITIES_PATH, "utf8");
      ACTIVITIES = JSON.parse(raw);
      console.log(`✓ Loaded ${ACTIVITIES.length} activities`);
    } catch (error) {
      console.error("❌ Error loading activities:", error);
      throw error;
    }
  }
}

function findActivities(userQuestion, max = 3) {
  const q = userQuestion.toLowerCase();
  const tokens = q.split(/\W+/).filter(Boolean);
  
  const scores = ACTIVITIES.map((a) => {
    const title = (a.Titel || "").toLowerCase();
    const explanation = (a["Korte uitleg"] || "").toLowerCase();
    const area = (a.Leergebied || "").toLowerCase();
    const steps = (a.Stappen || "").toLowerCase();
    
    let score = 0;
    
    for (const t of tokens) {
      if (title.includes(t)) score += 5;
      if (explanation.includes(t)) score += 3;
      if (area.includes(t)) score += 2;
      if (steps.includes(t)) score += 1;
    }
    
    return { score, activity: a };
  });
  
  scores.sort((a, b) => b.score - a.score);
  const filtered = scores.filter((s) => s.score > 0);
  
  if (filtered.length === 0) {
    const shuffled = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, max);
  }
  
  return filtered.slice(0, max).map((s) => s.activity);
}

function formatActivitiesForPrompt(activities) {
  if (!activities.length) {
    return "Geen activiteiten beschikbaar.";
  }
  
  return activities
    .map((a) => {
      const steps = (a.Stappen || "").replace(/\s+/g, " ").trim();
      return `Titel: "${a.Titel}"
Leergebied: ${a.Leergebied || "Algemeen"}
Korte uitleg: ${a["Korte uitleg"] || ""}
Stappen: ${steps.substring(0, 400)}${steps.length > 400 ? "..." : ""}`;
    })
    .join("\n\n---\n\n");
}

export const handleParentCoach = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const question = (req.body.question || "").trim();
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.log(`\n📝 Question: "${question.substring(0, 60)}..."`);

    await loadActivities();
    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Activities loaded in ${loadTime}ms`);
    
    const matches = findActivities(question, 3);
    const searchTime = Date.now() - startTime - loadTime;
    console.log(`🔍 Found ${matches.length} activities in ${searchTime}ms`);
    console.log(`   Titles: ${matches.map(m => m.Titel).join(", ")}`);

    const activitiesContext = formatActivitiesForPrompt(matches);
    
    console.log(`⏱️  Calling OpenAI (Prompt ${LUUMILO_PROMPT_VERSION})...`);
    const apiStartTime = Date.now();

    // Use the client's prompt exactly as they configured it
    const response = await openai.responses.create({
      model: "gpt-4.1-mini", // Keep their model selection
      prompt: {
        id: LUUMILO_PROMPT_ID,
        version: LUUMILO_PROMPT_VERSION,
        variables: {
          activities_context: activitiesContext,
          parent_question: question
        }
      },
    });

    const apiDuration = Date.now() - apiStartTime;
    console.log(`✓ OpenAI responded in ${apiDuration}ms`);

    const output = response.output_text || "";
    
    const totalDuration = Date.now() - startTime;
    console.log(`✓ Total request time: ${totalDuration}ms`);
    console.log(`   Breakdown: Load=${loadTime}ms, Search=${searchTime}ms, API=${apiDuration}ms\n`);

    res.json({ 
      answer: output.trim(),
      _meta: {
        totalTime: totalDuration,
        apiTime: apiDuration,
        activitiesFound: matches.length
      }
    });
    
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error after ${duration}ms:`, err.message);
    console.error("Full error:", err.response?.data || err);
    
    res.status(500).json({ 
      error: "server_error", 
      detail: err.message,
      duration: duration
    });
  }
};


// Subject: Please Disable File Search to Improve Response Speed
// Hi [Client Name],
// The bot is working well, but responses are slower than expected because File Search is doing duplicate work.
// Our code already searches and sends the most relevant activities to the AI. The File Search tool in your prompt is searching the same database again, which doubles the processing time.
// Please disable File Search:

// Go to your prompt: https://platform.openai.com/prompts
// Open the Luumilo Parent Coach prompt
// Find the "Tools" section
// Turn OFF or remove "File Search"
// Save the prompt

// This will make responses 3-5x faster without affecting quality.
// Let me know once you've disabled it!
// Thanks,
// [Your Name]