// routes/aiSuggestions.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/suggest-activity', async (req, res) => {
  try {
    const { prompt, domain, ageGroup } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt (theme) is required' });
    }

    if (!domain) {
      return res.status(400).json({ error: 'Learning domain is required' });
    }

    if (!ageGroup) {
      return res.status(400).json({ error: 'Age group is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that generates children's activities in Dutch.
Follow these strict rules:

- Output must ALWAYS be in Dutch.
- Output must ALWAYS be JSON only, with this exact structure:
{
  "title": "...",
  "description": "...",
  "instructions": ["...", "...", "...", "...", "..."],
  "materials": "...",
  "learningDomain": "...",
  "ageGroup": "...",
  "time": "...",
  "effect": "..."
}

Rules:
- "ageGroup" must be exactly one of ["Age 3 - 4", "Age 3 - 6", "Age 5 - 6"].
- "learningDomain" must be exactly one of ["Emotionele Gezondheid", "Veerkracht", "Dankbaarheid", "Zelfzorg", "Geldwijsheid", "Ondernemerschap", "Anders denken"].
- "instructions" must ALWAYS contain exactly 5 short and clear steps.
- "time" must be a number or range between 5 and 15 (e.g. "7" or "10-12"). No text like "minutes".
- Language must be very simple and suitable for young children.`
        },
        {
          role: "user",
          content: `Maak een kinderactiviteit in het Nederlands.

Thema: "${prompt}"
Leergebied (learningDomain): "${domain}"
Leeftijdsgroep (ageGroup): "${ageGroup}"

Geef ALLEEN de JSON terug.`
        }
      ]
    });

    const content = completion.choices[0].message.content;

    // Try to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      res.json({ success: true, suggestion });
    } else {
      res.status(500).json({ error: 'Failed to parse AI response as JSON', raw: content });
    }

  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

export default router;
