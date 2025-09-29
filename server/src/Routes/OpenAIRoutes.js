// routes/aiSuggestions.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/suggest-activity', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      messages: [{
        role: "user",
        content: `
          Maak een kinderactiviteit in het Nederlands met de volgende regels:

          - Gebruikersinvoer (thema/idee): ${prompt}
          - **Ongeacht de invoertaal, het resultaat moet ALTIJD volledig in het Nederlands zijn.**
          - Leeftijdsgroep: moet exact één van ["Age 3 - 4", "Age 3 - 6", "Age 5 - 6"] zijn.
          - Leergebied: moet exact één van [
            "Emotionele Gezondheid",
            "Veerkracht",
            "Dankbaarheid",
            "Zelfzorg",
            "Geldwijsheid",
            "Ondernemerschap",
            "Anders denken"
          ] zijn.
          - Titel moet ALTIJD in het Nederlands zijn.
          - De "instructions" lijst moet altijd exact 5 duidelijke en korte stappen bevatten.
          - "time" moet altijd een getal of bereik tussen 5 en 15 zijn (bijvoorbeeld "7" of "10-12").
          - Geen tekst zoals "minuten", alleen een getal of bereik.
          - Houd de uitleg eenvoudig en geschikt voor jonge kinderen.

          Geef ALLEEN een JSON terug in dit formaat:
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
        `
      }],
      model: "gpt-3.5-turbo",
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      res.json({ success: true, suggestion });
    } else {
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

export default router;
