import BackgroundPicture1 from "../../public/activities-images/Frame (6).svg";
import BackgroundPicture2 from "../../public/activities-images/Frame (7).svg";
import BackgroundPicture3 from "../../public/activities-images/Frame (8).svg";
import BackgroundPicture5 from "../../public/activities-images/Group (3).svg";
import BackgroundPicture6 from "../../public/activities-images/Frame (9).svg";

import DashImage6 from "../../public/activities-images/SVG (1).svg";
import DashImage7 from "../../public/activities-images/SVG.svg";

export const learningDomainImages = {
    'Emotionele Gezondheid': BackgroundPicture5, // fixed casing
    'Veerkracht': BackgroundPicture1,
    'Dankbaarheid': BackgroundPicture3,
    'Zelfzorg': BackgroundPicture6,
    'Geldwijsheid': BackgroundPicture2,
    'Ondernemerschap': DashImage7,
    'Anders denken': DashImage6, 
  };
  
  export const learningDomainColors = {
    'Emotionele Gezondheid': 'bg-[#EF4444] text-white', // fixed casing
    'Veerkracht': 'bg-[#3B82F6] text-white',
    'Dankbaarheid': 'bg-orange-600 text-white',
    'Zelfzorg': 'bg-[#10B981] text-white',
    'Geldwijsheid': 'bg-[#8B5CF6] text-white',
    'Ondernemerschap': 'bg-[#F97316] text-white',
    'Anders denken': 'bg-blue-400 text-white',
  };
  export const newlearningDomainColors = {
    'Emotionele Gezondheid': 'bg-[#DC2626] text-white', // was #EF4444
    'Veerkracht': 'bg-[#2563EB] text-white',           // was #3B82F6
    'Dankbaarheid': 'bg-orange-500 text-white',         // was bg-orange-500
    'Zelfzorg': 'bg-[#059669] text-white',              // was #10B981
    'Geldwijsheid': 'bg-[#7C3AED] text-white',          // was #8B5CF6
    'Ondernemerschap': 'bg-[#EA580C] text-white',       // was #F97316
    'Anders denken': 'bg-blue-500 text-white',          // was bg-blue-400
  };
  

  export const LearningDomainDescription = {
    'Emotionele Gezondheid': 'Je kind leert stap voor stap woorden geven aan gevoelens zoals boos, blij, verdrietig of bang. Dat zorgt voor meer zelfvertrouwen en helpt bij het begrijpen van zichzelf én de ander. Dit is de basis voor gezonde relaties, nu en later.', 
    'Veerkracht': 'Soms gaat iets niet in één keer goed. In dit leergebied oefent je kind met doorzetten, omgaan met tegenslag en opnieuw proberen. Zo groeit het vertrouwen dat je iets kunt leren, ook als het spannend of moeilijk is.',
    'Dankbaarheid': 'Kinderen die leren stilstaan bij wat fijn is, voelen zich vaak rustiger en blijer. In dit leergebied leert je kind kijken naar wat er wél is, waardering uitspreken en kleine dingen opmerken. Dat helpt bij een positieve kijk op het leven.',
    'Zelfzorg': 'In dit leergebied ontdekt je kind hoe het goed voor zichzelf kan zorgen. Denk aan gezond eten, rust nemen, bewegen en je grenzen aangeven. Zelfzorg is de basis voor een gezond en stevig leven.',
    'Geldwijsheid': 'Je kind leert spelenderwijs wat geld is, waar spullen vandaan komen, en waarom keuzes maken belangrijk is. Geldwijsheid betekent niet alleen rekenen, maar ook begrijpen wat iets waard is, en wat je echt nodig hebt.',
    'Ondernemerschap': 'Je kind ontdekt hoe leuk het is om een idee te bedenken, iets te maken of zelf een oplossing te verzinnen. Het stimuleert creativiteit, eigen initiatief en denken in mogelijkheden, precies wat later zo belangrijk is.',
    'Anders denken': 'Soms is er niet één goed antwoord. In dit leergebied leert je kind nieuwe ideeën te bedenken, buiten de gebaande paden te denken en dingen vanuit een andere hoek te bekijken. Zo ontstaat ruimte voor verbeelding, flexibiliteit en eigenheid.',
  }

   export const speelweekActivities = [
        {
            id: 1,
            title: "Dank-Kettingsprint",
            description: "Maak een mini-slinger van dankbaarheid die dagelijks kan groeien.",
            image: BackgroundPicture3,
            progress: "20 min",
            ageRange: "4-6 jaar",
            rating: "9.5",
            reviews: "203 reviews",
            tag: "Dankbaarheid",
            tagColor: "bg-[#F59E0B] text-white",
        },
        {
            id: 2,
            title: "Toren-van-Terugkaats",
            description: "Maak een mini-slinger van dankbaarheid die dagelijks kan groeien.",
            image: BackgroundPicture1,
            progress: "10 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "167 reviews",
            tag: "Veerkracht",
            tagColor: "bg-[#3B82F6] text-white",
        },
        {
            id: 3,
            title: "Spiegelgezicht-Safari",
            description: "Ontdek emoties door gezichtsuitdrukkingen in de iegel te maken en lichaamssignalen te voelen.",
            image: BackgroundPicture5,
            progress: "10 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "156 reviews",
            tag: "Emotionele Gezondheid",
            tagColor: "bg-[#EF4444] text-white",
        },
        {
            id: 4,
            title: "Limonade-Lab",
            description: "Experimenteer met smaken en laat familie jouw creaties beoordelen als echte klanten.",
            image: DashImage7,
            progress: "10 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "167 reviews",
            tag: "Veerkracht",
            tagColor: "bg-[#3B82F6] text-white",
        },
        {
            id: 5,
            title: "Papieren-Brug-Challenge",
            description: "Los technische uitdagingen op door te experimenteren met eenvoudige materialen.",
            image: DashImage6,
            progress: "8 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "156 reviews",
            tag: "Emotionele Gezondheid",
            tagColor: "bg-[#EF4444] text-white",
        },
    ];