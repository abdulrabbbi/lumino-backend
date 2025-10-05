/* eslint-disable no-unused-vars */
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
import { Check, Users, MessageCircle, X } from 'lucide-react'
import Faqs from "../components/faqs"
import EducationalQuotes from '../components/educational-quotes'
import StarImage from '../../public/profile-images/Frame (11)-star.svg'
import { Link, useNavigate } from "react-router-dom"
import ParentCoachBot from "../components/parenst-coach-bot"

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("Naaractiviteiten")
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false)
  const navigate = useNavigate();

  const handleProgress = () => {
    setActiveTab("bekijk voortgang")
    navigate('/progress')
  }

  const handleActivity = () => {
    setActiveTab("Naaractiviteiten")
    navigate('/activities')
  }

  const openCoachModal = () => {
    setIsCoachModalOpen(true)
  }

  const closeCoachModal = () => {
    setIsCoachModalOpen(false)
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
                  Geef je kind een sterke start.                  </span>
                  <br />
                </h1>
                <div className="flex items-center  justify-center mb-12">
                  <div className="flex items-center space-x-4">
                    <div className="text-center max-w-xl">
                      <p className="text-sm sm:text-[18px] text-[#8F8F8F] inter-tight-400 leading-relaxed">
                      Luumilo helpt je kind (3–6 jaar) groeien in dankbaarheid, veerkracht, zelfzorg en meer via korte, speelse missies die jullie band versterken
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
          className="relative h-auto max-w-7xl mb-10 m-auto mt-16 rounded-3xl bg-gradient-to-br from-[#ad1a75] via-[#435CDE] to-[#344bc0] py-16 px-4 sm:px-6 lg:px-8"
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
                >
                  <div className="flex flex-col items-center mb-4">
                    <div className="bg-orange-500 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                      <span className="text-white text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-black  text-center inter-tight-600 text-lg sm:text-2xl mb-2">
                      Speel, leer en groei 
                      <br />
                    </h3>
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
                <Link to={"/activities"}>
                  <p className="md:text-lg text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Klaar om je eigen leeravontuur te beginnen? 🎉
                  </p>
                </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      

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

      
        <ParentCoachBot />
      </div>
    </>
  )
}