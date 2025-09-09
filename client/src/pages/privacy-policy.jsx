import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto  p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 poppins-700">Privacyverklaring</h1>
          <h2 className="text-xl text-gray-700 mb-4 inter-tight-400">Privacyverklaring - Luumilo</h2>
          <p className="text-gray-600 inter-tight-400">Versie: 09.09.2025</p>
        </div>

        <div className="mb-8">
          <p className="text-gray-700 text-center inter-tight-400 leading-relaxed">
            Bij Luumilo hechten wij veel waarde aan de bescherming van jouw persoonsgegevens. 
            In deze privacyverklaring leggen wij uit welke gegevens wij verzamelen, waarom we dat doen 
            en hoe we deze beschermen.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-700">1. Wie zijn wij?</h3>
            <p className="text-gray-700 leading-relaxed inter-tight-400">
              Luumilo is een platform dat ouders helpt om hun kind(eren) van 3-6 jaar te ondersteunen 
              in hun ontwikkeling via speelse, schermvrije activiteiten.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-700">2. Welke gegevens verwerken wij?</h3>
            <p className="text-gray-700 mb-2">
              Wanneer je ons platform gebruikt, kunnen wij de volgende gegevens verwerken:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 inter-tight-400">
              <li><span className="font-medium">Accountgegevens:</span> naam, e-mailadres, wachtwoord.</li>
              <li><span className="font-medium">Profielgegevens:</span> leeftijd kind(eren), voorkeuren.</li>
              <li><span className="font-medium">Gebruik van het platform:</span> voltooide activiteiten, beoordelingen, voortgang.</li>
              <li><span className="font-medium">Uploads:</span> foto's die je vrijwillig deelt bij activiteiten.</li>
              <li><span className="font-medium">Technische gegevens:</span> IP-adres, apparaat, browserinformatie.</li>
              <li><span className="font-medium">Betalingsgegevens:</span> indien je een betaald abonnement afsluit (worden verwerkt door onze betaalprovider).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-700">3. Waarom verwerken wij deze gegevens?</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 inter-tight-400">
              <li>Om het platform goed te laten werken en persoonlijke Playweeks te genereren.</li>
              <li>Om je gebruikservaring te verbeteren en passende activiteiten aan te bieden.</li>
              <li>Om je voortgang en beloningen (badges, streaks) bij te houden.</li>
              <li>Om betalingen en abonnementen af te handelen.</li>
              <li>Om de veiligheid en betrouwbaarheid van het platform te waarborgen.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-700">4. Hoe lang bewaren wij je gegevens?</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 inter-tight-400">
              <li><span className="font-medium">Account- en profielgegevens:</span> zolang je account actief is.</li>
              <li><span className="font-medium">Foto's:</span> zolang je ze niet zelf verwijdert of tot je account wordt verwijderd.</li>
              <li><span className="font-medium">Technische en analytische gegevens:</span> maximaal 24 maanden.</li>
              <li><span className="font-medium">Wettelijk verplichte gegevens (bv. betalingen):</span> conform fiscale bewaartermijnen.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-700">5. Delen van gegevens</h3>
            <p className="text-gray-700 leading-relaxed inter-tight-400">
              Wij delen gegevens alleen met derde partijen die nodig zijn om de dienst te leveren, 
              zoals onze hostingprovider en betaalprovider. Met deze partijen hebben wij verwerkersovereenkomsten. 
              Gegevens worden niet verkocht.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 inter-tight-700">6. Jouw rechten</h3>
            <p className="text-gray-700 mb-2">
              Je hebt het recht om:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 inter-tight-400">
              <li>Je gegevens in te zien, te corrigeren of te verwijderen.</li>
              <li>Je toestemming in te trekken.</li>
              <li>Bezwaar te maken tegen verwerking.</li>
              <li>Je gegevens te laten exporteren.</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Verzoeken kun je indienen via ons contactformulier.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Beveiliging</h3>
            <p className="text-gray-700 leading-relaxed">
              Wij nemen passende technische en organisatorische maatregelen om jouw gegevens te beschermen, 
              zoals encryptie en toegangsbeperkingen.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Contact</h3>
            <p className="text-gray-700 leading-relaxed">
              Heb je vragen of klachten over hoe wij met jouw gegevens omgaan? Neem contact op via 
              het contactformulier of e-mail: <a href="mailto:join@luumilo.com" className="text-blue-600 hover:underline">join@luumilo.com</a>.
            </p>
            <p className="text-gray-700 mt-2">
              Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;