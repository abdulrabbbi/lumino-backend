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

// System instructions (developer message)
function buildSystemInstruction() {
  return `
You are the Luumilo Parent Coach. Use ONLY the Luumilo activities from activities.json.
Do NOT invent new ones.

Rules:
- Write in natural Dutch, short sentences, warm tone.
- Start with compassionate acknowledgement.
- Keep answers 2–4 sentences, unless multi-step plan requested.
- Use line breaks, never dashes.
- When suggesting activities: titles must be in quotes, then end with: Voltooi de oefening in de app …
- If no relevant activity: kindly say so and give supportive wisdom.
- Never give medical advice. Never invent activities.
`;
}

function buildUserPrompt(question, activities) {
  let context = "";
  if (activities.length) {
    context =
      "Gevonden activiteiten:\n" +
      activities
        .map(
          (a) =>
            `Titel: "${a.Titel}"\nKorte uitleg: ${a["Korte uitleg"]}\nStappen: ${(a.Stappen || "").replace(/\s+/g, " ").trim()}`
        )
        .join("\n\n");
  } else {
    context = "Geen activiteiten gevonden.";
  }

  return `${context}

Vraag van ouder:
${question}

Antwoordregels:
- Volg strikt de systeemregels.
- Houd antwoord kort en duidelijk (2–4 zinnen).
- Als je een activiteit benoemt, eindig altijd met: Voltooi de oefening in de app …`;
}

export const handleParentCoach = async (req, res)  => {
  try {
    const question = (req.body.question || "").trim();
    if (!question) return res.status(400).json({ error: "Question is required" });

    await loadActivities();
    const matches = findActivities(question, 2);

    const systemInstruction = buildSystemInstruction();
    const userPrompt = buildUserPrompt(question, matches);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 0.25,
    });

    const output = response.choices?.[0]?.message?.content || "";
    res.json({ answer: output.trim() });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(500).json({ error: "server_error", detail: err.message });
  }
}