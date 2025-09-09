/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    file: null,
    agreeToPrivacy: false
  });

  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Generate a simple CAPTCHA on component mount
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptchaValue(captcha);
    setCaptchaInput('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Validate CAPTCHA
    if (captchaInput.toUpperCase() !== captchaValue) {
      setSubmitMessage('CAPTCHA is incorrect. Please try again.');
      generateCaptcha();
      setIsSubmitting(false);
      return;
    }

    // Validate file size and type if a file is uploaded
    if (formData.file) {
      const file = formData.file;
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (file.size > maxSize) {
        setSubmitMessage('File size exceeds 5MB limit.');
        setIsSubmitting(false);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setSubmitMessage('Only JPG, PNG, and PDF files are allowed.');
        setIsSubmitting(false);
        return;
      }
    }

    // Generate a ticket number
    const ticketNumber = 'TKT-' + Date.now();

    // Simulate form submission (in a real app, you would send this to your backend)
    try {
      // Here you would typically make an API call to your backend
      console.log('Form submitted:', { ...formData, ticketNumber });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitMessage('Your message has been sent successfully! We will contact you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        file: null,
        agreeToPrivacy: false
      });
      generateCaptcha();
      
      // In a real application, you would:
      // 1. Send the form data to your backend
      // 2. Send a confirmation email to the user with the ticket number
      // 3. Send a notification to join@luumilo.com
      
    } catch (error) {
      setSubmitMessage('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto  p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center poppins-700">Contactformulier</h2>
        
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-md ${submitMessage.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {submitMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block inter-tight-400  text-sm font-medium text-gray-700 mb-1">
              Naam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300/70 rounded-md outline-none "
            />
          </div>
          
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block inter-tight-400  text-sm font-medium text-gray-700 mb-1">
              E-mailadres <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300/70 rounded-md outline-none "
            />
          </div>
          
          {/* Subject dropdown */}
          <div>
            <label htmlFor="subject" className="block inter-tight-400  text-sm font-medium text-gray-700 mb-1">
              Onderwerp <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300/70 inter-tight-400 text-sm rounded-md outline-none "
            >
              <option value="">Selecteer een onderwerp</option>
              <option value="Algemeen">Algemeen</option>
              <option value="Technisch probleem">Technisch probleem</option>
              <option value="Abonnement">Abonnement</option>
              <option value="Privacy">Privacy</option>
              <option value="Overig">Overig</option>
            </select>
          </div>
          
          {/* Message textarea */}
          <div>
            <label htmlFor="message" className="block inter-tight-400  text-sm font-medium text-gray-700 mb-1">
              Bericht <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300/70 rounded-md outline-none "
            ></textarea>
          </div>
          
          {/* File upload */}
          <div>
            <label htmlFor="file" className="block inter-tight-400  text-sm font-medium text-gray-700 mb-1">
              Bestandsupload (optioneel, max. 5MB, JPG/PNG/PDF)
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleInputChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="w-full px-4 py-2 border border-gray-300/70 rounded-md outline-none "
            />
            {formData.file && (
              <p className="mt-2 text-sm text-gray-500 inter-tight-400">Geselecteerd bestand: {formData.file.name}</p>
            )}
          </div>
          
          {/* CAPTCHA */}
          <div>
            <label htmlFor="captcha" className="block inter-tight-400  text-sm font-medium text-gray-700 mb-1">
              Beveiligingscode <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 bg-gray-200 px-4 py-2 rounded-md font-mono text-lg tracking-wider">
                {captchaValue}
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-sm text-blue-600 inter-tight-400  hover:text-blue-800"
              >
                Nieuwe code
              </button>
            </div>
            <input
              type="text"
              id="captcha"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              required
              placeholder="Voer de code hier in"
              className="w-full mt-2 px-4 py-2 text-sm  border border-gray-300/70 inter-tight-400 rounded-md outline-none "
            />
          </div>
          
          {/* Privacy agreement checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToPrivacy"
                name="agreeToPrivacy"
                type="checkbox"
                checked={formData.agreeToPrivacy}
                onChange={handleInputChange}
                required
                className="focus:ring-blue-500 inter-tight-400 h-4 w-4 text-blue-600 border-gray-300/70 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToPrivacy" className="font-medium inter-tight-400  text-gray-700">
                Ik ga akkoord met verwerking van mijn gegevens zoals beschreven in de{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                  privacyverklaring
                </a>
                . <span className="text-red-500">*</span>
              </label>
            </div>
          </div>
          
          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center inter-tight-400 cursor-pointer  py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Versturen...' : 'Versturen'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center  inter-tight-400 text-sm text-gray-500">
          <p>We streven ernaar om binnen 2 werkdagen te reageren.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;