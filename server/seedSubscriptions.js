import connectToDatabase from './src/Utils/db.js';
import Subscription from './src/Models/Subscription.js';
import { configDotenv } from 'dotenv';

configDotenv();
// console.log(process.env.MONGODB_URL);

(async () => {
  await connectToDatabase(process.env.MONGODB_URL);

  await Subscription.deleteMany(); 

  await Subscription.insertMany([
    {
      name: "Proefreis",
      key: "proefreis",
      description: "Start vandaag met je kind",
      details: [
        "Gratis week om te starten: Probeer 1 week alle activiteiten, exclusief voor de eerste 1,000 ouders!",
        "Flexibel stoppen wanneer je wilt: Geen gedoe, opzeggen is makkelijk!",
      ],
      price: 9.95,      priceType: "monthly",
      trialPeriodDays: 7,
      currency: "EUR",
    },
    {
      name: "Jaaravontuur",
      key: "jaaravontuur",
      description: "Ervaar nu samen een jaar vol groei en inspiratie",
      details: [
        "Heel jaar onbeperkt waarde: Geniet een jaar lang van alle activiteiten, exclusief voor de eerste 1,000 ouders!",
        "Bespaar 16% op je abonnement: Een slimme deal voor je portemonnee!",
      ],
      price: 99.95,      priceType: "yearly",
      trialPeriodDays: 0,
      currency: "EUR",
    },
    {
      name: "Eeuwig Sterk",
      key: "eeuwigsterk",
      description: "Bouw aan het onderwijs van de toekomst",
      details: [
        "Eénmalig investeren, altijd toegang: Betaal nu één keer en ontvang betekenis voor een lifetime.",
        "Exclusieve pioniersstatus: Word een pionier met early adaptor badge.",
      ],
      price: 199.95,      priceType: "one-time",
      trialPeriodDays: 0,
      currency: "EUR",
    },
  ]);
  process.exit();
})();
