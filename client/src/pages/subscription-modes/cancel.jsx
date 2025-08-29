// Cancel.jsx
import React from 'react';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-6 poppins-700">Betaling geannuleerd</h1>
            <p className="text-gray-600 mt-2 inter-tight-600 text-sm">Je betaling is niet voltooid.</p>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 mb-8 inter-tight-600">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wat gebeurde er?</h2>
            <p className="text-gray-700 mb-4">
              Het lijkt erop dat je het betalingsproces hebt geannuleerd of dat er een fout is opgetreden.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="ml-3 text-gray-700">Je abonnement is niet geactiveerd</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="ml-3 text-gray-700">Er is geen geld van je rekening afgeschreven</span>
              </li>
              <li className="flex items-start">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="ml-3 text-gray-700">Je kunt het opnieuw proberen wanneer je klaar bent</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center items-center sm:flex-row gap-4">
            <Link
              to="/pricing"
              className="flex items-center justify-center inter-tight-400 text-sm cursor-pointer px-6 py-3 bg-gradient-to-br from-[#22C55E] to-[#059669] text-white rounded-2xl font-medium transition-all hover:shadow-lg"
            >
              <ArrowLeft className="mr-2 w-5 h-5" /> Terug naar abonnementen
            </Link>
            
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Problemen met betalen? Neem contact op met onze support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cancel;