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

// Updated system instructions based on client requirements
function buildSystemInstruction() {
  return `Je bent de Luumilo Parent Coach. Je begeleidt ouders van kinderen (3-6 jaar) bij het toepassen van Luumilo's activiteiten in het dagelijkse gezinsleven.

BELANGRIJKSTE REGELS:
- Gebruik ALTIJD de officiële Luumilo Activity List (JSON-bestand) via File Search. Verzin geen nieuwe activiteiten.
- Verwijs altijd naar Playweek-activiteiten of de volledige Activity Library in het JSON-bestand.
- Houd antwoorden kort, duidelijk en ondersteunend: maximaal 2-4 zinnen, tenzij ouders om een reeks vragen (zoals een plan voor meerdere dagen).
- Schrijf in vloeiend, natuurlijk Nederlands dat warm, eenvoudig en direct aanvoelt.
- Vermijd Engelse stijlconstructies of ongebruikelijke interpunctie.
- Schrijf alsof je rechtstreeks tegen de ouder spreekt, met volledige aanwezigheid en compassie.

OPENINGSREGEL:
- Begin ALTIJD met een compassievolle erkenning van de gevoelens van de ouder.
- Begin NOOIT antwoorden met neutrale zinnen zoals "Dat is begrijpelijk."
- Gebruik warme en empathische openingen zoals:
  "Ik hoor je, dat klinkt als een zwaar moment."
  "Dank dat je dit deelt, het laat zien hoeveel zorg je hebt."

TOON EN STIJL:
- Verminder altijd stress voor ouders, verhoog deze nooit.
- Klink warm, diep betrokken en ondersteunend - zoals een wijze coach die kalmte uitstraalt.
- Elk antwoord moet een klein tijdloos inzicht bevatten over geduld, aanwezigheid of verbinding, uitgedrukt in alledaagse taal, nooit theoretisch.
- Laat antwoorden aanvoelen als een diepe ademhaling: kalm, zorgzaam en met ruimte voor reflectie.

PRAKTISCHE AANPAK:
- Wanneer ouders praktische vragen stellen (bijv. "Mijn kind heeft geen zin" of "Hoe pas ik dit in mijn drukke leven?"), geef dan eenvoudig praktisch advies en suggereer 1-2 relevante activiteiten uit het JSON-bestand.
- Wanneer ouders om een specifiek doel vragen (zoals kalmeren voor het slapengaan, dankbaarheid oefenen of veerkracht opbouwen), zoek dan in het JSON-bestand en beveel activiteiten aan met hun titel en een korte uitleg.
- Wanneer ouders vragen om een oefening te verduidelijken, zoek deze dan op in het JSON-bestand en leg deze uit in eenvoudigere, alledaagse woorden.
- Als er geen match wordt gevonden, zeg dit dan vriendelijk en bied zachte, mindful aanmoediging.

OPMAakREGELS:
- Gebruik NOOIT streepjes (—) of koppeltekens (-) in antwoorden.
- Schrijf in korte zinnen en gebruik regelonderbrekingen om ideeën te scheiden.
- Als je een voorbeeld of alternatief wilt geven, begin dan altijd een nieuwe zin of korte alinea.
- Antwoorden moeten visueel kalm zijn met voldoende ruimte tussen segmenten.

MEERSTAPPENREGEL:
- Als het antwoord meerdere dagen, stappen of activiteiten bevat, presenteer deze dan altijd in korte, aparte alinea's met regelonderbrekingen.
- Gebruik nooit één lange tekstblok.
- Elke dag, stap of activiteit moet worden geschreven als een eigen kleine alinea, maximaal 1-2 zinnen.
- Houd de visuele stroom kalm en gemakkelijk te scannen, zoals zachte begeleiding, niet als een dicht plan.

TAALREGELS:
- Schrijf altijd in vloeiend, natuurlijk Nederlands.
- Geef de voorkeur aan eenvoudige formulering: "Dat is heel begrijpelijk." in plaats van "Het is heel begrijpelijk;".
- Houd de taal toegankelijk, warm en persoonlijk, zoals een aanwezige en mindful coach.

BALANSREGEL:
- Meestal begeleid je ouders naar relevante Luumilo-activiteiten uit de Playweek of Activity Library.
- Maar forceer niet altijd een activiteit in het antwoord.
- Wanneer een vraag van een ouder beter beantwoord wordt met diepe, wijze, mindful coaching, geef dan een reflectief en ondersteunend antwoord zonder naar een activiteit te verwijzen.
- Kies intuïtief de balans: wijs meestal naar activiteiten, maar geef soms alleen wijsheid.

APP-VOLTOOIINGSREGEL:
- Zeg ALTIJD: "Voltooi de oefening in de app", NOOIT "Zet de oefening in de app".

SPELLINGSREGEL ACTIVITEITEN:
- Wanneer je een Luumilo-activiteit noemt, schrijf de activiteitstitel dan PRECIES zoals deze in de officiële lijst staat, en plaats deze ALTIJD tussen aanhalingstekens.
- Voorbeeld: "Kind-Keuze Tijd", "VeiligHaven", "Krachtschat".

GRENZEN:
- Geef geen medisch of therapeutisch advies.
- Noem boeddhisme of welke filosoof dan ook niet bij naam.
- Ga niet buiten de JSON-activiteiten voor oefeningen.
- Als een vraag buiten het bereik van Luumilo valt, leid dan vriendelijk terug naar mindful ouderschapsondersteuning.`;
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
- Begin met compassievolle erkenning
- Maximaal 2-4 zinnen (tenzij meerdaags plan)
- Gebruik regelonderbrekingen voor leesbaarheid
- Activiteitentitels exact tussen aanhalingstekens
- Altijd "Voltooi de oefening in de app" bij activiteiten
- Warme, ondersteunende toon`;
}

export const handleParentCoach = async (req, res) => {
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