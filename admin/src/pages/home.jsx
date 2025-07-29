import { useState } from "react"
import Image1 from "../../public/images/Group.svg"
import Image2 from "../../public/images/Group (1).svg"
import Image3 from "../../public/images/Frame (1).svg"
import DashImage from "../../public/activities-images/Frame (6).svg"
import DashImage2 from "../../public/activities-images/Frame (7).svg"
import DashImage3 from "../../public/activities-images/Frame (8).svg"
import DashImage4 from "../../public/activities-images/Frame (9).svg"
import DashImage5 from "../../public/activities-images/Group (3).svg"
import DashImage6 from "../../public/activities-images/SVG (1).svg"
import DashImage7 from "../../public/activities-images/SVG.svg"
import ArrowImage from "../../public/nav-images/noun-4712550-FFFFFF.png"
import Card1 from "../../public/images/new-card.svg"
import Card2 from "../../public/nav-images/ahmed-hossam-iBv9aRp9yME-unsplash.png"
import Card3 from "../../public/images/Background+Border+Shadow.svg"
import { Check, Users } from 'lucide-react'
import Faqs from "../components/faqs"

import EducationalQuotes from '../components/educational-quotes'

import StarImage from '../../public/profile-images/Frame (11)-star.svg'
import { useNavigate } from "react-router-dom"

import HomePageImage from '../../public/images/getty-images-kr0G3nDBpzg-unsplash.jpg'

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("Naaractiviteiten")
  const navigate = useNavigate();

  const handleProgress = () => {
    setActiveTab("bekijk voortgang")
    navigate('/progress')
  }


  const handleActivity = () => {
    setActiveTab("Naaractiviteiten")
    navigate('/activities')
  }



  return (
    <>
      <div className="p-3">
        <section className="max-w-7xl m-auto">
          <div className="h-auto bg-gradient-to-br rounded-3xl from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto ">
              <div className="text-center ">
                <h1 className="text-4xl py-16 sm:text-5xl lg:text-6xl font-bold ">
                  <span className="inter-tight-700 bg-clip-text text-transparent bg-gradient-to-b to-[#2563EB] from-[#9333EA]">
                    Je kind future-proof maken?
                  </span>
                  <br />
                  <span className="text-[#111827] inter-tight-700">Dat doe je samen.</span>
                </h1>
                <div className="flex items-center mt-2 justify-center mb-12">
                  <div className="flex items-center space-x-4">
                    <div className="text-center max-w-xl">
                      <p className="text-sm sm:text-[18px] text-[#8F8F8F] inter-tight-400 leading-relaxed">
                        Luumilo helpt je kind (3–6 jaar) groeien in dankbaarheid, Veerkracht zelfzorg en meer – via korte,
                        speelse missies die jullie band versterken.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pb-8 sm:pb-12 lg:pb-16">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl px-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 transition-shadow duration-500 cursor-pointer border border-slate-200 shadow-lg">
                      <div className="flex items-start space-x-3">
                        <p className="text-[#5D5D5D] text-sm md:text-base inter-tight-400">
                          <span className="inter-tight-700 text-[#5D5D5D] mr-1">Voor ouders</span>
                          die voelen dat innerlijke kracht belangrijker is dan hoge cijfers.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#8D35EA] to-[#2C60EB] rounded-2xl p-4 sm:p-6 transition-shadow duration-300 shadow-lg">
                      <div className="flex items-start space-x-3">
                        <p className="text-[#FFFFFF] text-sm md:text-base inter-tight-400">
                          <span className="inter-tight-700 text-[#FFFFFF] mr-1">Voor kinderen</span>
                          die zelfstandig, sterk en nieuwsgierig de wereld in stappen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="md:bg-[#F1F6FB] bg-white md:shadow-none shadow-xl  max-w-7xl m-auto py-16 rounded-3xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className=" flex gap-3">
                <div className="flex justify-center mb-6">
                  <div>
                    <img src={Image1 || "/placeholder.svg"} alt="" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[18px]   text-[#000000] text-left     inter-tight-700">7 Leergebieden</h3>
                  <p className="text-[#9A9A9A] inter-tight-400 text-left text-sm  leading-relaxed">
                    van emotionele gezondheid tot ondernemerschap
                  </p>
                </div>
              </div>
              <div className=" flex gap-3">
                <div className="flex justify-center mb-6">
                  <div>
                    <img src={Image2 || "/placeholder.svg"} alt="" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[18px]  text-[#000000] text-left inter-tight-700">5-15 Min Per Dag</h3>
                  <p className="text-[#9A9A9A] inter-tight-400 text-left text-sm  leading-relaxed">
                    past altijd in jullie dagritme
                  </p>
                </div>
              </div>
              <div className=" flex gap-3">
                <div className="flex justify-center mb-6">
                  <div>
                    <img src={Image3 || "/placeholder.svg"} alt="" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[18px]   text-[#000000]      text-left inter-tight-700">Geen Scherm</h3>
                  <p className="text-[#9A9A9A] inter-tight-400 text-left text-sm  leading-relaxed">
                    samen spelen samen groeien
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-auto max-w-7xl m-auto mt-10 bg-gradient-to-br rounded-3xl from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] py-16 px-4 sm:px-6 lg:px-8 ">
          <img
            src={StarImage}
            alt="Top left decoration"
            className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6 w-16 sm:w-20 lg:w-24 h-auto z-10"
          />
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl inter-tight-700 text-[#000000] poppins-700 mb-2">Welkom terug!</h2>
              <p className="text-md inter-tight-400 text-[#000000] text-sm mb-3">Klaar voor de volgende activiteit?</p>
              <div className="flex justify-center mb-12">
                <div className=" flex gap-2 items-center rounded-full p-1 ">
                  <button
                    onClick={handleActivity}
                    className={`px-10 py-2 rounded-lg text-sm inter-tight-400  cursor-pointer transition-all duration-300  ${activeTab === "Naaractiviteiten"
                      ? "bg-[#8F34EA] text-white "
                      : "text-[#000000] bg-[#FFFFFF] border border-[#EBEBEB]"
                      }`}
                  >
                    Naar activiteiten
                  </button>
                  <button
                    onClick={handleProgress}
                    className={`px-10 py-2 rounded-lg text-sm inter-tight-400 cursor-pointer  transition-all duration-300  ${activeTab === "bekijk voortgang"
                      ? "bg-[#8F34EA] text-white "
                      : "text-[#000000] bg-[#FFFFFF] border border-[#EBEBEB]"
                      }`}
                  >
                    bekijk voortgang{" "}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="sm:col-span-1 lg:row-span-2">
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full flex flex-col justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage5 || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] text-md">Emotionele Gezondheid</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">Herken wat je voelt en leer dat ook zeggen</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] text-md">Veerkracht</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">Blijf proberen, ook als iets moeilijk is</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage3 || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] text-md">Dankbaarheid</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">Zie wat er wél is — en voel hoe fijn dat is.</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage4 || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] text-md">Zelfzorg</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">Zorg goed voor je lichaam én je hoofd.</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage2 || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] ttextext-md">Geldwijsheid</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">
                      Leer omgaan met geld, spullen en slimme keuzes maken.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage7 || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] text-md">Ondernemerschap</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">Kijk anders, denk verder, vind je eigen idee</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#FFFFFF]  rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-500 h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 shadow-lg bg-[#F8E6E6] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <img src={DashImage6 || "/placeholder.svg"} className="h-10 w-10" alt="" />
                    </div>
                    <h3 className="poppins-700 text-[#000000] text-md">Anders Denken</h3>
                    <p className="text-[#828282] text-sm leading-relaxed">
                      Kijk Anders, Denk Verder, Vind Je Eigen Idee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="4rth-section"
          className="relative h-auto max-w-7xl m-auto mt-16 rounded-3xl bg-gradient-to-br from-[#ad1a75] via-[#435CDE] to-[#344bc0] py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl poppins-700 text-white mb-2">Hoe het werkt</h2>
              <p className="text-white text-md">3 Simpele Stappen</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-stretch">

              {/* Card 1 */}
              <div className="md:h-[490px] h-full">
                <div
                  className="bg-gray-200  rounded-3xl p-6 sm:p-6 h-full    relative overflow-hidden border border-white/10"
                  // style={{
                  //   boxShadow: "inset 0 8px 32px rgba(255, 255, 255, 0.3), inset 0 4px 16px rgba(255, 255, 255, 0.2)"
                  // }}
                >
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-orange-500 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                      <span className="text-white text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-black  text-center inter-tight-600 text-lg sm:text-2xl mb-2">
                      Speel, leer en groei 
                      <br />
                       - samen thuis
                    </h3>
                    {/* <img
                      src={ArrowImage || "/placeholder.svg"}
                      alt="Arrow"
                      className="absolute right-34 top-12 h-[30vh] w-full hidden lg:block"
                    /> */}
                    <p className="text-black max-w-xs mx-auto w-full text-center mt-3 inter-tight-400 text-[16px] leading-relaxed">
                      Korte, speelse activiteiten die bouwen aan de fundering van je kind - thuis, met aandacht en intentie.
                    </p>
                  </div>
                  <div className="lg:absolute lg:bottom-0 lg:left-40 mt-6 flex justify-center lg:justify-start">
                    <img src={Card1 || "/placeholder.svg"} alt="" className="w-auto h-auto max-w-full" />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:h-[490px] h-full">
                <div
                  className="bg-gray-200  rounded-3xl p-6 sm:p-6 h-full    relative overflow-hidden border border-white/10"
                  // style={{
                  //   boxShadow: "inset 0 8px 32px rgba(255, 255, 255, 0.3), inset 0 4px 16px rgba(255, 255, 255, 0.2)"
                  // }}
                >
                  <div className="flex flex-col items-center mb-4">
                  <div className="bg-orange-500 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                      <span className="text-white text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-black  text-center inter-tight-600 text-lg sm:text-2xl mb-2">
                      Versterk de band
                      <br /> 
                      met je kind
                    </h3>
                    <img
                      src={ArrowImage || "/placeholder.svg"}
                      alt="Arrow"
                      className="absolute right-68 top-64 h-[20vh] w-[20vh] hidden lg:block"
                    />
                    <p className="text-black max-w-xs mx-auto w-full text-center mt-3 inter-tight-400 text-[16px] leading-relaxed">
                      Creëer momenten van verbinding, plezier en groei. Samen ontdekken, lachen en leren.
                    </p>
                  </div>
                  <div className="lg:absolute lg:bottom-0 lg:left-40 mt-6 flex justify-center lg:justify-start">
  <img 
    src={Card2 || "/placeholder.svg"} 
    alt="" 
    className="w-auto h-auto max-w-full -rotate-[25deg] translate-x-6" 
  />
</div>
                </div>
              </div>  

              {/* Card 3 */}
              <div className="md:h-[490px] h-full">
                <div
                  className="bg-gray-200  rounded-3xl p-6 sm:p-6 h-full    relative overflow-hidden border border-white/10"
                  // style={{
                  //   boxShadow: "inset 0 8px 32px rgba(255, 255, 255, 0.3), inset 0 4px 16px rgba(255, 255, 255, 0.2)"
                  // }}
                >
                  <div className="flex flex-col items-center mb-4">
                  <div className="bg-orange-500 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                      <span className="text-white text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-black  text-center inter-tight-600 text-lg sm:text-2xl mb-2">
                      Groei op 3 vlakken:
                      <br /> hoofd, hart en handen
                    </h3>
                    <img
                      src={ArrowImage || "/placeholder.svg"}
                      alt="Arrow"
                      className="absolute right-68 top-64 h-[20vh] w-[20vh] hidden lg:block"
                    />
                    <p className="text-black max-w-xs mx-auto w-full text-center mt-3 inter-tight-400 text-[16px] leading-relaxed">
                      Elke activiteit versterkt emotionele, praktische en sociale vaardigheden, volg jullie vooruitgang!
                    </p>
                  </div>
                  <div className="lg:absolute lg:bottom-0 lg:left-40 mt-6 flex justify-center lg:justify-start">
                    <img src={Card3 || "/placeholder.svg"} alt="" className="w-auto h-auto max-w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center cursor-pointer mt-16">
              <div className="inline-block bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="bg-white rounded-full px-8 py-4">
                  <p className="md:text-lg text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Klaar om je eigen leeravontuur te beginnen? 🎉
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="py-16 px-4 mt-10 sm:px-6 lg:px-8 h-auto max-w-7xl m-auto ">
          <div className="max-w-4xl w-full m-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl poppins-700 lg:text-4xl  text-[#0F2137]">
                Bouw mee aan het
                <br />
                onderwijs van de toekomst
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="relative ">
                <div className="absolute inset-0 bg-gradient-to-br from-[#DB297A] to-[#7940EA]  rounded-3xl z-0"></div>
                <div className="absolute  left-1/2 transform -translate-x-1/2 z-20">
                  <div className=" text-white md:px-6 px-full py-2 font-bold text-sm">Slechts 15 plekken!</div>
                </div>
                <div className="bg-white mt-10 rounded-3xl pb-20 p-8 m-3 shadow-lg relative z-10">
                  <div className="flex flex-col items-start">
                    <div className="mb-4 mt-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg inter-tight-700 text-[#0F2137]">Word testgezin</h3>
                      <p className="text-[#666666] inter-tight-400 text-sm">Help ons Luzality te perfectioneren.</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8 mt-5">
                    {[
                      "Levenslang gratis toegang",
                      "Exclusieve toegang tot nieuwe features",
                      "Direct contact met ontwikkelaars",
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#3FDBB1] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm">{text}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-gradient-to-br from-[#22C55E] to-[#059669] cursor-pointer text-sm text-white inter-tight-400 py-4 px-6 rounded-2xl transition-colors duration-500">
                    Aanmelden als testgezin
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Vragenlijst met voor/achternaam, leeftijd kind, ervaring
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200 relative">
                <div className="flex flex-col items-start">
                  <div className="mb-4 mt-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg inter-tight-700 text-[#0F2137]">Blijf op de hoogte</h3>
                    <p className="text-[#666666] inter-tight-400 text-sm">Krijg als eerste bericht bij de lancering</p>
                  </div>
                </div>
                <div className="space-y-4 mb-8 mt-5">
                  {["Eerste bericht bij lancering", "Exclusieve lanceringsvoordelen", "Geen spam, alleen updates"].map(
                    (text, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#3FDBB1] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#343D48] inter-tight-400 text-sm">{text}</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="mb-6">
                  <input
                    type="email"
                    placeholder="jouw@email.nl"
                    className="w-full px-4 py-3 border-none outline-none text-sm rounded-xl bg-[#F5F5F5E5] inter-tight-400"
                  />
                </div>
                <button className="w-full bg-gradient-to-br from-[#9CA3AF] to-[#6B7280] cursor-pointer text-sm text-white inter-tight-400 py-4 px-6 rounded-2xl transition-colors duration-500">
                  📧 Houd mij op de hoogte
                </button>
                <p className="text-xs text-gray-500 text-center mt-4">Alleen je e-mailadres, meer niet</p>
              </div>
            </div>
            <div className="text-center">
              <a href="#" className="text-[#636363] cursor-pointer underline text-sm">
                Kies Jouw Abonnement!
              </a>
            </div>
          </div>
        </section>

        {/* Educational Quotes Section - Replaces Testimonials */}
        {/* <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#2D60EB] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[#000000] inter-tight-400 text-sm uppercase tracking-wide">WIJSHEID VAN EXPERTS</span>
              </div>
              <h2 className="text-4xl md:text-5xl poppins-700 text-gray-900 mb-4">Wat zeggen onderwijslegendes?</h2>
              <p className="text-[#666666] text-md max-w-2xl mx-auto">
                Inzichten van wereldberoemde experts die de basis legden voor modern onderwijs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {educationalQuotes.map((quote, index) => (
                <div key={index} className="bg-gradient-to-br from-[#F8F9FF] to-[#F0F4FF] rounded-2xl p-6 border border-[#E5E7EB] hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-4">
                    <div className="text-2xl mb-3">💡</div>
                    <h4 className="text-sm font-medium text-[#2563EB] mb-2 inter-tight-700">{quote.area}</h4>
                  </div>
                  <blockquote className="text-[#374151] text-sm leading-relaxed mb-4 inter-tight-400">
                    "{quote.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-xs poppins-700 mr-3">
                      {quote.author.split(' ').map(name => name[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="inter-tight-700 text-gray-900 text-sm">{quote.author}</div>
                      <div className="text-[#6B7280] text-xs inter-tight-400">Onderwijsexpert</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        <EducationalQuotes />
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F6FB] max-w-7xl m-auto mt-10 rounded-3xl">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-4xl sm:text-5xl font-bold text-[#2563EB] mb-2">94%</h3>
                <p className="text-[#666666] text-sm inter-tight-400">
                  van kinderen toont
                  <br />
                  verbetering in emotionele
                  <br />
                  intelligentie
                </p>
              </div>
              <div>
                <h3 className="text-4xl sm:text-5xl font-bold text-[#22C55E] mb-2">80%</h3>
                <p className="text-[#666666] text-sm inter-tight-400">
                  ervaart sterkere ouder-kind
                  <br />
                  band
                </p>
              </div>
              <div>
                <h3 className="text-4xl sm:text-5xl font-bold text-[#8B5CF6] mb-2">10 min</h3>
                <p className="text-[#666666] text-sm inter-tight-400">
                  gemiddelde tijd
                  <br />
                  per activiteit
                </p>
              </div>
            </div>
          </div>
        </section>

        <Faqs />
      </div>
    </>
  )
}