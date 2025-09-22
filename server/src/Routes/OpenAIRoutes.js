// routes/aiSuggestions.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/suggest-activity', async (req, res) => {
  try {
    const { prompt, ageGroup, learningDomain } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
        messages: [{
          role: "user", 
          content: `
            Create a children's activity in Dutch with the following rules:
      
            - User input (theme/idea): ${prompt}
            - Age group: must be exactly one of ["Age 3 - 4", "Age 3 - 6", "Age 5 - 6"].
            - Learning domain: must be one of [
              "Emotionele Gezondheid",
              "Veerkracht",
              "Dankbaarheid",
              "Zelfzorg",
              "Geldwijsheid",
              "Ondernemerschap",
              "Anders denken"
            ].
      
            Return JSON format only with:
            {
              "title": "...",
              "description": "...",
              "instructions": ["...", "..."],
              "materials": "...",
              "learningDomain": "...",
              "ageGroup": "...",   
              "time": "...",  // must be either a number or a range (e.g. "10" or "10-15"), no words like "minuten"
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