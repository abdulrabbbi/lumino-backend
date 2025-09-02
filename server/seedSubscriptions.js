import connectToDatabase from './src/Utils/db.js';
import Subscription from './src/Models/Subscription.js';
import { configDotenv } from 'dotenv';

configDotenv();

(async () => {
  await connectToDatabase(process.env.MONGODB_URL);

  await Subscription.deleteMany(); 

  await Subscription.insertMany([
    {
      name: "Proefreis",
      key: "proefreis",
      description: "Start vandaag met je kind",
      details: [
        "7 dagen gratis starten",
        "Daarna €9,99 / maand",
        "Onbeperkt activiteiten",
        "Per maand opzegbaar",
        "Exclusief voor de eerste 1.000 ouders",
      ],
      price: 9.99,
      priceType: "monthly",
      trialPeriodDays: 7,
      currency: "EUR",
    },
    {
      name: "Jaaravontuur",
      key: "jaaravontuur",
      description: "Ervaar nu samen een jaar vol groei en inspiratie",
      details: [
        "7 dagen gratis starten",
        "Daarna €99,99 / jaar (16% voordeliger)",
        "Onbeperkt activiteiten",
        "Wordt jaarlijks verlengd – na het eerste jaar maandelijks opzegbaar",
        "Exclusief voor de eerste 1.000 ouders",
      ],
      price: 99.99,
      priceType: "yearly",
      trialPeriodDays: 7,
      currency: "EUR",
    },
    {
      name: "Eeuwig Sterk",
      key: "eeuwigsterk",
      description: "Bouw aan het onderwijs van de toekomst",
      details: [
        "7 dagen gratis starten",
        "Daarna €199,99 eenmalig",
        "Levenslange toegang",
        "Unieke Early Adopter-badge",
        "Exclusief voor de eerste 1.000 ouders",
      ],
      price: 199.99,
      priceType: "one-time",
      trialPeriodDays: 7,
      currency: "EUR",
    },
  ]);

  process.exit();
})();
