/* eslint-disable no-unused-vars */
import { ArrowLeft, Lightbulb, Send, Users, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import useCreateActivity from "../hooks/useCreateActivity";
import BadgeModal from "../components/badge-modal";
import { generateActivitySuggestion } from "../utils/aiService";

const CreateActivity = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    materials: '',
    learningDomain: '',
    nickname: '',
    time: '', 
    ageGroup: '',
    effect: ''
  });
  
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [creatorCount, setCreatorCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Badge modal state
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [awardedBadge, setAwardedBadge] = useState(null);

  // AI Suggestion state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLearningDomain, setAiLearningDomain] = useState('');
  const [aiAgeGroup, setAiAgeGroup] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

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

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }

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

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields validation
    if (!formData.title.trim()) {
      errors.title = 'Titel is verplicht';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Beschrijving is verplicht';
      isValid = false;
    }

    if (!formData.instructions.trim()) {
      errors.instructions = 'Instructies zijn verplicht';
      isValid = false;
    } else {
      const instructionsArray = formData.instructions
        .split('\n')
        .filter(step => step.trim() !== '')
        .map(step => step.trim())
        .slice(0, 5);

      if (instructionsArray.length === 0) {
        errors.instructions = 'Voeg minimaal één instructie stap toe';
        isValid = false;
      } else {
        for (const step of instructionsArray) {
          if (step.length > 180) {
            errors.instructions = 'Elke instructie stap mag maximaal 180 tekens bevatten';
            isValid = false;
            break;
          }
        }
      }
    }

    if (!formData.learningDomain) {
      errors.learningDomain = 'Leergebied is verplicht';
      isValid = false;
    }

    if (!formData.ageGroup) {
      errors.ageGroup = 'Leeftijdsgroep is verplicht';
      isValid = false;
    }

    // Time validation
    const timeValidation = validateTimeFormat(formData.time);
    if (!timeValidation.valid) {
      errors.time = timeValidation.error;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }

    try {
      const instructionsArray = formData.instructions
        .split('\n')
        .filter(step => step.trim() !== '')
        .map(step => step.trim())
        .slice(0, 5);

      const activityData = {
        title: formData.title,
        description: formData.description,
        instructions: instructionsArray,
        materials: formData.materials,
        learningDomain: formData.learningDomain,
        nickname: formData.nickname || '',
        ageGroup: formData.ageGroup,
        time: formData.time,
        effect: formData.effect
      };

      const response = await createActivity(activityData);
      
      // Check if a badge was awarded
      if (response && response.badge) {
        setAwardedBadge(response.badge);
        setShowBadgeModal(true);
      }
      
      toast.success('Je activiteit is aangemaakt en wordt beoordeeld door een beheerder!');
      
      // Navigate after showing badge modal or immediately if no badge
      if (!response?.badge) {
        setTimeout(() => {
          navigate('/activities'); 
        }, 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Er is iets misgegaan');
    }
  };

  const handleBadgeModalClose = () => {
    setShowBadgeModal(false);
    setAwardedBadge(null);
    
    // Navigate to activities after closing badge modal
    setTimeout(() => {
      navigate('/activities');
    }, 500);
  };

  // AI Suggestion functionality
  const handleGenerateSuggestion = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Voer een beschrijving in voor de AI');
      return;
    }

    if (!aiLearningDomain) {
      toast.error('Selecteer een leergebied voor de AI suggestie');
      return;
    }

    if (!aiAgeGroup) {
      toast.error('Selecteer een leeftijdsgroep voor de AI suggestie');
      return;
    }

    setIsGenerating(true);
    try {
      const suggestion = await generateActivitySuggestion(
        aiPrompt, 
        aiLearningDomain, 
        aiAgeGroup
      );

      // Apply the AI suggestion to the form
      setFormData(prev => ({
        ...prev,
        title: suggestion.title || prev.title,
        description: suggestion.description || prev.description,
        instructions: suggestion.instructions ? suggestion.instructions.join('\n') : prev.instructions,
        materials: suggestion.materials || prev.materials,
        time: suggestion.time || prev.time,
        effect: suggestion.effect || prev.effect,
        // Also update the main form's learning domain and age group
        learningDomain: aiLearningDomain || prev.learningDomain,
        ageGroup: aiAgeGroup || prev.ageGroup
      }));

      toast.success('AI suggestie succesvol toegepast!');
      setShowAiPanel(false);
      setAiPrompt(''); // Clear the prompt after successful generation
      
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Kon geen suggestie genereren. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to get input border color based on validation
  const getInputBorderColor = (field) => {
    return validationErrors[field] ? 'border-red-500' : 'border-[#E5E7EB]';
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] lg:px-4 lg:py-6 p-3">
      {/* <ToastContainer style={{ zIndex: 1000000000 }} /> */}

      <BadgeModal
        isVisible={showBadgeModal}
        onClose={handleBadgeModalClose}
        badges={awardedBadge}
      />

      <div className="max-w-4xl mx-auto w-full">
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

        {/* AI Suggestion Panel */}
        {showAiPanel && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Activiteit Suggestie
              </h3>
              <button
                onClick={() => setShowAiPanel(false)}
                className="text-purple-600 hover:text-purple-800"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Beschrijf je ideale activiteit:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Bijvoorbeeld: 'Een buitenactiviteit over natuur ontdekken' of 'Een knutselactiviteit over emoties'"
                  className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                  rows="3"
                />
              </div>

              {/* AI-specific dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Leergebied <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={aiLearningDomain}
                    onChange={(e) => setAiLearningDomain(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Selecteer leergebied</option>
                    <option value="Emotionele Gezondheid">Emotionele Gezondheid</option>
                    <option value="Veerkracht">Veerkracht</option>
                    <option value="Dankbaarheid">Dankbaarheid</option>
                    <option value="Zelfzorg">Zelfzorg</option>
                    <option value="Geldwijsheid">Geldwijsheid</option>
                    <option value="Ondernemerschap">Ondernemerschap</option>
                    <option value="Anders denken">Anders denken</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    Leeftijdsgroep <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={aiAgeGroup}
                    onChange={(e) => setAiAgeGroup(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Selecteer leeftijdsgroep</option>
                    <option value="Age 3 - 4">Leeftijd 3 - 4</option>
                    <option value="Age 3 - 6">Leeftijd 3 - 6</option>
                    <option value="Age 5 - 6">Leeftijd 5 - 6</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateSuggestion}
                  disabled={isGenerating || !aiPrompt || !aiLearningDomain || !aiAgeGroup}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Suggestie Genereren
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-purple-600">
                Tip: Hoe specifieker je beschrijving, hoe beter de suggestie! De AI zal een complete activiteit genereren op basis van je selecties.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="md:text-2xl text-xl inter-tight-600 font-semibold text-[#000000]">Jouw Activiteit Details</h2>
              </div>
              
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 px-7 py-3 rounded-lg transition-all"
              >
                <Sparkles className="md:w-6 md:h-6 h-6 w-6" />
                <span className="text-md font-medium lg:inline md:inline hidden">AI Hulp</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div id="title">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                className={`w-full px-4 py-3 bg-[#F9FAFB] border ${getInputBorderColor('title')} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm`}
                maxLength={60}
              />
              {validationErrors.title && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>
              )}
              <p className="text-xs text-[#6B7280] mt-1">
                Maximaal 60 tekens ({titleCount}/60)
              </p>
            </div>

            {/* Description */}
            <div id="description">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Beschrijving <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                className={`w-full px-4 py-3 bg-[#F9FAFB] border ${getInputBorderColor('description')} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none`}
                rows="4"
                maxLength={250}
              />
              {validationErrors.description && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>
              )}
              <p className="text-xs text-[#6B7280] mt-1">
                Maximaal 250 tekens ({descriptionCount}/250)
              </p>
            </div>

            {/* Instructions */}
            <div id="instructions">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Instructies <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder={`1. Neem een vel papier\n2. Vouw het dubbel in de lengte\n3. Maak de neus door de bovenste hoeken naar beneden te vouwen\n4. Vouw de zijkanten naar binnen om vleugels te vormen\n5. Lanceer en kijk hoe ver het vliegt!`}
                className={`w-full px-4 py-3 bg-[#F9FAFB] border ${getInputBorderColor('instructions')} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none`}
                rows="6"
              />
              {validationErrors.instructions && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.instructions}</p>
              )}
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
            <div id="time">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Geschatte duur (minuten)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="Bijvoorbeeld: 10 of 10-15"
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border ${getInputBorderColor('time')} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm`}
                />
                <Clock className="w-4 h-4 text-gray-400 absolute right-3" />
              </div>
              {validationErrors.time && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.time}</p>
              )}
              <p className="text-xs text-[#6B7280] mt-1">
                Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
              </p>
            </div>

            {/* Age Group */}
            <div id="ageGroup">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Leeftijdsgroep <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                className={`w-full px-4 py-3 bg-[#F9FAFB] border ${getInputBorderColor('ageGroup')} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm`}
                required
              >
                <option value="">Selecteer een leeftijdsgroep</option>
                <option value="Age 3 - 4">Leeftijd 3 - 4</option>
                <option value="Age 3 - 6">Leeftijd 3 - 6</option>
                <option value="Age 5 - 6">Leeftijd 5 - 6</option>
              </select>
              {validationErrors.ageGroup && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.ageGroup}</p>
              )}
            </div>

            {/* Learning Domain */}
            <div id="learningDomain">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Leergebied <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.learningDomain}
                onChange={(e) => handleInputChange('learningDomain', e.target.value)}
                className={`w-full px-4 py-3 bg-[#F9FAFB] border ${getInputBorderColor('learningDomain')} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none`}
                required
              >
                <option value="">Selecteer een leergebied</option>
                <option value="Emotionele Gezondheid">Emotionele Gezondheid</option>
                <option value="Veerkracht">Veerkracht</option>
                <option value="Dankbaarheid">Dankbaarheid</option>
                <option value="Zelfzorg">Zelfzorg</option>
                <option value="Geldwijsheid">Geldwijsheid</option>
                <option value="Ondernemerschap">Ondernemerschap</option>
                <option value="Anders denken">Anders denken</option>
              </select>
              {validationErrors.learningDomain && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.learningDomain}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Effect
              </label>
              <input
                type="text"
                value={formData.effect}
                onChange={(e) => handleInputChange('effect', e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
              />
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