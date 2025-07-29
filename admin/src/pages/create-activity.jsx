/* eslint-disable no-unused-vars */
import { ArrowLeft, Lightbulb, Send, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import useCreateActivity from "../hooks/useCreateActivity";

const CreateActivity = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    materials: '',
    learningDomain: '',
    nickname: '',
    time: '', 
    ageGroup: ''
  });
  
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [creatorCount, setCreatorCount] = useState(0);

  const { createActivity, loading } = useCreateActivity();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/activities');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    switch (field) {
      case 'title':
        setTitleCount(value.length);
        break;
      case 'description':
        setDescriptionCount(value.length);
        break;
      case 'nickname':
        setCreatorCount(value.length);
        break;
    }
  };

  const validateTimeFormat = (time) => {
    if (!time) return { valid: true };
    
    // Check for single number (e.g., "10")
    if (/^\d+$/.test(time)) {
      return { valid: true };
    }
    
    // Check for range (e.g., "10-15")
    if (/^\d+\s*-\s*\d+$/.test(time)) {
      const [min, max] = time.split('-').map(num => parseInt(num.trim()));
      if (min >= max) {
        return { valid: false, error: 'Eerste getal moet kleiner zijn dan tweede getal' };
      }
      return { valid: true };
    }
    
    return { valid: false, error: 'Voer een getal in (bijv. "10") of bereik (bijv. "10-15")' };
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.learningDomain || !formData.instructions || !formData.ageGroup) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    // Validate time format
    const timeValidation = validateTimeFormat(formData.time);
    if (!timeValidation.valid) {
      toast.error(timeValidation.error);
      return;
    }

    const instructionsArray = formData.instructions
      .split('\n')
      .filter(step => step.trim() !== '')
      .map(step => step.trim())
      .slice(0, 5); 

    if (instructionsArray.length === 0) {
      toast.error('Voeg minimaal één instructie stap toe');
      return;
    }

    for (const step of instructionsArray) {
      if (step.length > 180) {
        toast.error('Elke instructie stap mag maximaal 180 tekens bevatten');
        return;
      }
    }

    try {
      const activityData = {
        title: formData.title,
        description: formData.description,
        instructions: instructionsArray,
        materials: formData.materials,
        learningDomain: formData.learningDomain,
        nickname: formData.nickname || '',
        ageGroup: formData.ageGroup,
        time: formData.time // Storing exactly as entered (e.g. "10" or "10-15")
      };

      await createActivity(activityData);
      toast.success('Je activiteit is aangemaakt en wordt beoordeeld door een beheerder!');
      setTimeout(() => {
        navigate('/activities'); 
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Er is iets misgegaan');
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] px-4 py-6">
      <ToastContainer style={{ zIndex: 1000000000 }} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex cursor-pointer items-center gap-2 text-[#4B5563] hover:bg-yellow-400 hover:text-black py-2 px-6 duration-500 ease-in-out rounded-md transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium inter-tight-400">Terug naar activiteiten</span>
          </button>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#6366F1] rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl poppins-700 text-[#1F2937] mb-3">
                Voeg jouw activiteit toe
              </h1>
              <p className="text-[#6B7280] inter-tight-400 text-[16px] max-w-md mx-auto">
                "It takes a village to raise a child" - Deel jouw geweldige activiteit met andere Luumilo families!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-2xl inter-tight-600 font-semibold text-[#000000]">Jouw Activiteit Details</h2>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                maxLength={60}
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Maximaal 60 tekens ({titleCount}/60)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Beschrijving <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                rows="4"
                maxLength={250}
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Maximaal 250 tekens ({descriptionCount}/250)
              </p>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Instructies <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder={`1. Neem een vel papier\n2. Vouw het dubbel in de lengte\n3. Maak de neus door de bovenste hoeken naar beneden te vouwen\n4. Vouw de zijkanten naar binnen om vleugels te vormen\n5. Lanceer en kijk hoe ver het vliegt!`}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                rows="6"
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Gebruik genummerde stappen (1., 2., etc.). Maximaal 5 stappen, elke stap maximaal 180 tekens.
              </p>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Benodigd materiaal
              </label>
              <input
                type="text"
                value={formData.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                placeholder="Papier, kleurpotloden, telefoon voor foto's"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Kommagescheiden lijst van benodigdheden (optioneel)
              </p>
            </div>

            {/* Duration Fields */}
            <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Geschatte duur (minuten)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                placeholder="Bijvoorbeeld: 10 of 10-15"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
              />
              <Clock className="w-4 h-4 text-gray-400 absolute right-3" />
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
            </p>
          </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Leeftijdsgroep <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                required
              >
                <option value="">Selecteer een leeftijdsgroep</option>
                <option value="Age 3 - 4">Leeftijd 3 - 4</option>
                <option value="Age 5 - 6">Leeftijd 5 - 6</option>
                <option value="Age 7 - 8">Leeftijd 7 - 8</option>
              </select>
            </div>

            {/* Learning Domain */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb -2">
                Leergebied <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.learningDomain}
                onChange={(e) => handleInputChange('learningDomain', e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none"
                required
              >
                <option value="">Selecteer een leergebied</option>
                <option value="Emotionele gezondheid">Emotionele gezondheid</option>
                <option value="Veerkracht">Veerkracht</option>
                <option value="Dankbaarheid">Dankbaarheid</option>
                <option value="Zelfzorg">Zelfzorg</option>
                <option value="Geldwijsheid">Geldwijsheid</option>
                <option value="Ondernemerschap">Ondernemerschap</option>
                <option value="Anders denken">Anders denken</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Jouw voornaam of nickname
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="Bijvoorbeeld: Sarah, Mama Lisa, of laat leeg voor anoniem"
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                maxLength={50}
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Optioneel - wordt getoond als je activiteit wordt gepubliceerd ({creatorCount}/50)
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r cursor-pointer from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] text-white inter-tight-400 py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Versturen...' : 'Verstuur Activiteit'}
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-[#EBF8FF] to-[#F3E8FF] rounded-2xl p-6 border border-[#E0E7FF]">
          <div className="flex items-start gap-3">
            <div className="bg-blue-200 p-2 rounded-full">
              <Lightbulb className="w-6 h-6 text-[#3B82F6] mt-0.5 flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-xl inter-tight-700 text-[#1E40AF] mb-2">
                Wat gebeurt er nu?
              </h3>
              <p className="text-blue-600 text-[16px] leading-relaxed">
                Je activiteit wordt eerst beoordeeld door ons team. Als deze wordt goedgekeurd,
                verschijnt deze in de activiteitenlijst met vermelding "Ingezonden door een
                <span className="font-medium text-[#6366F1]"> Luumilo</span>". We streven ernaar om binnen 3-5 werkdagen te reageren.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;