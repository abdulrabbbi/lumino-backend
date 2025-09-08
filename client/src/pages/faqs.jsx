import { ChevronUp } from 'lucide-react'
import React, { useState } from 'react'

const Faqs = () => {
  const [openSection, setOpenSection] = useState(null)
  const [openFAQ, setOpenFAQ] = useState(null)

  const groupedFaqData = [
    {
      header: "Over Luumilo’s filosofie en aanpak",
      faqs: [
        {
          question: "Waarom richt Luumilo zich op de 7 kerngebieden?",
          answer:
            "Onze 7 kerngebieden – zoals veerkracht, dankbaarheid en zelfzorg – zijn zorgvuldig gekozen om de fundamentele ontwikkelingsbehoeften van kinderen van 3 tot 6 jaar te ondersteunen. Ze bevorderen mentale kracht, creativiteit en zelfstandigheid. Deze keuze is gebaseerd op wetenschappelijk onderzoek en inzichten van experts zoals Daniel Goleman (emotionele intelligentie), Ann Masten (veerkracht) en Maria Montessori (zelfstandigheid)."
        },
        {
          question: "Hoe inspireert Maria Montessori de filosofie van Luumilo?",
          answer:
            "Maria Montessori zag zelfzorg en praktische vaardigheden, zoals aankleden of opruimen, als sleutels tot zelfvertrouwen en verantwoordelijkheid. Luumilo verweeft deze principes in speelse activiteiten, zodat kinderen in hun eigen tempo groeien in autonomie en zelfbewustzijn, passend bij hun dagelijkse leven."
        },
        {
          question: "Hoe stimuleert Luumilo de creativiteit van kinderen?",
          answer:
            "Creativiteit staat centraal in onze kerngebieden Ondernemerschap en Anders denken. Door vrij spel, het bedenken van originele oplossingen en het gebruiken van hun verbeeldingskracht ontwikkelen kinderen een flexibele en inventieve mindset. Dit sluit aan bij inzichten van Ken Robinson en de Reggio Emilia-benadering, die creatieve processen bij jonge kinderen stimuleren."
        },
        {
          question: "Is het niet te vroeg om kinderen te leren over geldwijsheid?",
          answer:
            "Nee, jonge kinderen kunnen via spel en verhalen al spelenderwijs leren over sparen, delen en keuzes maken. Onderzoek van de OECD en experts in financiële geletterdheid toont aan dat vroege, speelse ervaringen met geld bijdragen aan sterke financiële vaardigheden later in het leven."
        },
        {
          question: "Zijn de activiteiten wetenschappelijk onderbouwd?",
          answer:
            "Ja, onze activiteiten zijn ontwikkeld met input van experts in kinderontwikkeling en onderbouwd door wetenschappelijke inzichten over hoe jonge kinderen leren. Ze zijn slim, laagdrempelig en vooral leuk, zodat ze perfect aansluiten bij de behoeften van jouw kind."
        }
      ]
    },
    {
      header: "Praktische toepassing",
      faqs: [
        {
          question: "Hoe helpt Luumilo ouders bij het begeleiden van hun kinderen?",
          answer:
            "Luumilo biedt korte, praktische oefeningen en inzichten die naadloos passen in jullie dagelijks leven. Zo kun je op kleine momenten de mentale kracht van je kind versterken, zonder extra stress. Alles is ontworpen met oog op hoe kinderen van 3 tot 6 jaar leren en groeien."
        },
        {
          question: "Hoe zorgen jullie ervoor dat de activiteiten geschikt zijn voor de leeftijd?",
          answer:
            "Onze activiteiten zijn ontwikkeld door experts en afgestemd op twee leeftijdsgroepen: 3-4 jaar en 5-6 jaar. Als ouder kun je eenvoudig filteren op de leeftijd van je kind, zodat de activiteiten altijd perfect aansluiten – simpel en effectief!"
        },
        {
          question: "Heb ik speciale materialen nodig voor de activiteiten?",
          answer:
            "Nee, je hebt alleen alledaagse spullen nodig die je waarschijnlijk al in huis hebt, zoals papier, potloden of een dosis fantasie. Luumilo maakt het makkelijk en toegankelijk voor elk gezin."
        },
        {
          question: "Hoeveel tijd kosten de activiteiten?",
          answer:
            "Elke activiteit duurt slechts 5 tot 15 minuten, ideaal voor drukke gezinnen. Ze zijn ontworpen om moeiteloos in jullie dag te passen, zodat je zonder stress samen kunt genieten."
        },
        {
          question: "Moet ik ervaring hebben om met Luumilo te starten?",
          answer:
            "Helemaal niet! Luumilo begeleidt je met eenvoudige, duidelijke stappen. Of je nu een ervaren ouder bent of net begint, onze activiteiten zijn toegankelijk en leuk – geen diploma nodig!"
        },
        {
          question: "Hoe vaak komen er nieuwe activiteiten bij?",
          answer:
            "We voegen regelmatig nieuwe activiteiten toe, ontwikkeld door ons team en geïnspireerd door creatieve ideeën van ouders zoals jij. Zo blijft Luumilo altijd fris en inspirerend voor jou en je kind."
        }
      ]
    },
    {
      header: "Logistieke en technische details",
      faqs: [
        {
          question: "Is er een gratis proefperiode?",
          answer:
            "Ja, je kunt Luumilo 7 dagen gratis uitproberen met een selectie van activiteiten. Ontdek of ons platform bij jullie gezin past, zonder verplichtingen!"
        },
        {
          question: "Kan ik mijn abonnement op elk moment opzeggen?",
          answer:
            "Absoluut, je kunt je abonnement maandelijks opzeggen. Probeer Luumilo vrijblijvend en kijk of het jullie gezin laat stralen."
        },
        {
          question: "Zijn mijn gegevens en die van mijn kind veilig?",
          answer:
            "Ja, privacy is bij ons topprioriteit. We verzamelen minimale gegevens, delen niets met derden en beveiligen alles met sterke versleuteling, zoals een digitale kluis."
        }
      ]
    }
  ]

  return (
    <section className="px-4 pb-10 sm:px-6 lg:px-8 max-w-7xl m-auto md:mt-20 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl mb-6 text-[#0F2137] inter-tight-700">
            Veelgestelde  vragen
          </h2>
        </div>

        <div className="space-y-6 bg-[#F1F6FB] mt-10 md:p-7 p-4 rounded-md">
          {groupedFaqData.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <button
                onClick={() => setOpenSection(openSection === sectionIndex ? null : sectionIndex)}
                className="md:text-lg text-sm font-bold text-[#0F2137] mb-4 flex justify-between items-center w-full text-left"
              >
                <span>{section.header}</span>
                <span className="ml-2 text-xl">{openSection === sectionIndex ? '−' : '+'}</span>
              </button>

              {openSection === sectionIndex && section.faqs.map((faq, index) => {
                const globalIndex = `${sectionIndex}-${index}`;
                return (
                  <div key={globalIndex} className="border-b border-gray-200 pb-4">
                    <button
                      onClick={() => setOpenFAQ(openFAQ === globalIndex ? null : globalIndex)}
                      className="flex justify-between items-center w-full text-left py-4"
                    >
                      <span className="text-[#0F2137] font-medium inter-tight-400 text-base">
                        {faq.question}
                      </span>
                      <div className="ml-4 flex-shrink-0">
                        {openFAQ === globalIndex ? (
                          <ChevronUp className="w-5 h-5 text-black" />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center">
                            <span className="text-black text-lg font-bold">+</span>
                          </div>
                        )}
                      </div>
                    </button>
                    {openFAQ === globalIndex && (
                      <div className="pb-4">
                        <p className="text-[#666666] text-sm inter-tight-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Faqs
