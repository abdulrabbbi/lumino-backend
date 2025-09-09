import React from 'react';
import Logo from '../../public/images/logo.svg'
import Image1 from '../../public/images/SVG.svg'
import Image2 from '../../public/images/SVG (1).svg'
import Image3 from '../../public/images/SVG (2).svg'
import Image4 from '../../public/images/SVG (3).svg'
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#F1F6FB] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-gray-900  inter-tight-700 mb-4">Leergebieden</h3>
                            <ul className="space-y-3">
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Emotionele Gezondheid</a></li>
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Veerkracht</a></li>
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Dankbaarheid</a></li>
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Zelfzorg</a></li>
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Financiële Basis</a></li>
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Ondernemerschap</a></li>
                                <li><a href="/" className="text-[#000000] cursor-pointer text-sm">Anders Denken</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[#000000] inter-tight-700 mb-4">Bedrijf</h3>
                            <ul className="space-y-3">
                            <li><Link to={"/about-us"} className="text-[#000000] cursor-pointer text-sm">Over Ons</Link></li>
                                <li><Link to={"/"} className="text-[#000000] cursor-pointer text-sm">Vacatures</Link></li>
                                <li><Link to={"/"} className="text-[#000000] cursor-pointer text-sm">Pers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[#000000] inter-tight-700 mb-4">Ondersteuning</h3>
                            <ul className="space-y-3">
                                <li><Link to={"/faqs"} className="text-[#000000] cursor-pointer text-sm">Veelgestelde Vragen</Link></li>
                                <li><Link to={"/privacy-policy"} className="text-[#000000] cursor-pointer text-sm">Privacybeleid</Link></li>
                                <li><Link to={"/contact-us"} className="text-[#000000] cursor-pointer text-sm">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div>
                            <img src={Logo} alt="" />
                        </div>
                        <div className="bg-gradient-to-br from-[#1E40AF] to-[#6B21A8] rounded-2xl p-4 text-white">
                            <p className="text-sm leading-relaxed">
                                "Het platform dat kinderen
                                voorbereidt op de wereld van
                                morgen, vandaag."
                            </p>
                        </div>
                    </div>
                </div>

                <div className=" pt-8">
                    <div className="flex flex-col sm:flex-row md:justify-between md:items-center justify-start items-start">
                        <div className="text-[#B1B7BE] text-sm text-left mb-4 sm:mb-0">
                        © 2025 Luumilo. Alle rechten voorbehouden.
                        </div>

                        <div className="flex flex-col items-end justify-end gap-3 space-x-4">
                            <div className="text-[#B1B7BE] text-sm">
                            Met liefde gemaakt voor kinderen over de hele wereld.
                            </div>
                            <div className="flex items-end justify-end space-x-2">
                                <div className="w-8 h-8  bg-[#8937EA99] cursor-pointer rounded-full flex items-center justify-center">
                                    <img src={Image1} alt="Social Icon 1" className="w-4 h-4" />
                                </div>
                                <div className="w-8 h-8  bg-[#8937EA99] cursor-pointer rounded-full flex items-center justify-center">
                                    <img src={Image2} alt="Social Icon 1" className="w-4 h-4" />
                                </div>
                                <div className="w-8 h-8  bg-[#8937EA99] cursor-pointer rounded-full flex items-center justify-center">
                                    <img src={Image3} alt="Social Icon 1" className="w-4 h-4" />
                                </div>
                                <div className="w-8 h-8 bg-[#8937EA99] cursor-pointer rounded-full flex items-center justify-center">
                                    <img src={Image4} alt="Social Icon 1" className="w-4 h-4" />
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;