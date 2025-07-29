import React from 'react';
import { Target, BarChart3, Check, X, AlertTriangle, Play } from 'lucide-react';
import Vector1 from '../../../public/images/Vector (1).svg'

export default function KwaliteitsauditPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className='border border-[#E2E4E9] rounded-xl p-5'>

     
      <div className="mb-8 ">
        <h1 className="text-3xl font-bold text-[#262F40] inter-tight-700 mb-2">
        AI-gestuurde Kwaliteitsaudit        </h1>
        <p className="text-[#576175] inter-tight-400 text-md leading-relaxed">
          Voer een volledige kwaliteitscontrole uit van alle 32 activiteiten. Het systeem beoordeelt elke activiteit op 7 criteria en past automatisch verbeteringen toe.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-[#1E3A8A] inter-tight-700">
          🎯 Beoordelingscriteria (1-5 schaal)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">1. Helderheid:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Kindvriendelijke toon en beschrijving</span>
          </div>
          <div>
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">2. Structuur:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Max 5 eenvoudige, logische stappen</span>
          </div>
          <div>
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">3. Leergebied:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Duidelijke afstemming met één van de 7 pilaren</span>
          </div>
          <div>
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">4. Duur:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Tussen 5-15 minuten</span>
          </div>
          <div>
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">5. Materialen:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Weinig vereisten (max 1 huishoudelijk item)</span>
          </div>
          <div>
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">6. Gedragsactivatie:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Concrete acties, niet alleen discussie</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">7. Ouder-kind binding:</span>
            <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm  ">Stimuleert reflectie en verbondenheid</span>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-[#14532D] inter-tight-700">
          📊 Classificatiesysteem 
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
          ✅            <div>
              <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">Behouden (30+ punten): </span>
              <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm">Activiteit voldoet aan standaarden, kleine verbeteringen worden automatisch toegepast </span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
          🛠        <div>
              <span className="font-semibold text-[#262F40] inter-tight-700 text-sm"> Verbeteren (22-29 punten):</span>
              <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm">Kernidee behouden, beschrijving en structuur worden herschreven     </span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
          ❌           <div>
              <span className="font-semibold text-[#262F40] inter-tight-700 text-sm">Vervangen (&lt;22 punten):</span>
              <span className="text-gray-700 ml-1 inter-tight-400 md:text-md text-sm">Activiteit voldoet niet, wordt vervangen door nieuwe activiteit voor hetzelfde leergebied   </span>
            </div>
          </div>
        </div>
      </div>

      </div>

      <div className="text-center">
        <button className="bg-gradient-to-r from-[#2563EB] to-[#9333EA] cursor-pointer inter-tight-700 text-sm text-white font-medium px-10 py-3 rounded-2xl flex items-center gap-2 mx-auto transition-colors">
<img src={Vector1} alt="" />
          Start Volledige Kwaliteitsaudit
        </button>
      </div>
    </div>
  );
}