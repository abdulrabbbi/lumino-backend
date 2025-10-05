import fs from "fs/promises";
import path from "path";
import OpenAI from 'openai';
import dotenv from "dotenv";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

dotenv.config();

let ACTIVITIES = [];
const ACTIVITIES_PATH = path.join(process.cwd(), "src", "Luumilo_Activiteitenlijst.json");
const LUUMILO_PROMPT_ID = "pmpt_68deb3eb56c88197a764f5d9ecf909c6023134dcf4b55982";

async function loadActivities() {
  if (!ACTIVITIES.length) {
    try {
      const raw = await fs.readFile(ACTIVITIES_PATH, "utf8");
      ACTIVITIES = JSON.parse(raw);
    } catch (error) {
      console.error("Error loading activities:", error);
      throw error;
    }
  }
}

function findActivities(userQuestion, max = 2) {
  const q = userQuestion.toLowerCase();

  const tokens = q.split(/\W+/).filter(Boolean);
  const scores = ACTIVITIES.map((a) => {
    const hay = `${a.Titel || ""} ${a["Korte uitleg"] || ""} ${a.Leergebied || ""}`.toLowerCase();
    const hayTokens = new Set(hay.split(/\W+/).filter(Boolean));
    let score = 0;
    for (const t of tokens) if (hayTokens.has(t)) score++;
    return { score, activity: a };
  });
  scores.sort((a, b) => b.score - a.score);
  const filtered = scores.filter((s) => s.score > 0).map((s) => s.activity);
  return filtered.slice(0, max);
}

function buildUserPrompt(question, activities) {
  let context = "";
  if (activities.length) {
    context =
      "Relevante activiteiten gevonden in de Luumilo Activity List:\n" +
      activities
        .map(
          (a) =>
            `Titel: "${a.Titel}"\nKorte uitleg: ${a["Korte uitleg"] || "Geen uitleg beschikbaar"}\nStappen: ${(a.Stappen || "").replace(/\s+/g, " ").trim().substring(0, 200)}`
        )
        .join("\n\n");
  } else {
    context = "Geen direct passende activiteiten gevonden in de Luumilo Activity List.";
  }

  return `${context}

Vraag van ouder:
${question}

Antwoord als Luumilo Parent Coach volgens alle regels:
- Gebruik de gevonden activiteiten indien relevant
- Houd antwoord kort en ondersteunend (2-4 zinnen)
- Volg alle Luumilo-richtlijnen uit de systeeminstructies`;
}

export const handleParentCoach = async (req, res) => {
  try {
    const question = (req.body.question || "").trim();
    if (!question) return res.status(400).json({ error: "Question is required" });

    await loadActivities();
    const matches = findActivities(question, 2);
    const userPrompt = buildUserPrompt(question, matches);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: LUUMILO_PROMPT_ID 
        },
        { 
          role: "user", 
          content: userPrompt 
        },
      ],
      max_tokens: 400,
      temperature: 0.25,
    });

    const output = response.choices?.[0]?.message?.content || "";
    res.json({ answer: output.trim() });
  } catch (err) {
    console.error("Error in handleParentCoach:", err.response?.data || err.message || err);
    
    // Provide more specific error messages
    if (err.code === 'invalid_prompt') {
      return res.status(400).json({ 
        error: "Invalid Prompt ID", 
        detail: "The provided Prompt ID may be incorrect or not accessible" 
      });
    }
    
    res.status(500).json({ 
      error: "server_error", 
      detail: err.message 
    });
  }
}