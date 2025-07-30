import { useState } from "react"
import Daniel from '../../public/legends-pictures/DanielGoleman_BW.jpg'
import Lev from '../../public/legends-pictures/LevVygotsky_BW.jpg'
import Robert from '../../public/legends-pictures/Robert Emmons_BW.jpg'
import Maria from '../../public/legends-pictures/Maria Montessori_BW.jpg'
import Lusardi from '../../public/legends-pictures/Lusardi & Mitchell_BW.jpg'
import Ken from '../../public/legends-pictures/KenRobinson_BW.jpg'

import BackgroundPicture1 from "../../public/activities-images/Frame (6).svg"
import BackgroundPicture2 from "../../public/activities-images/Frame (7).svg"
import BackgroundPicture3 from "../../public/activities-images/Frame (8).svg"
import BackgroundPicture5 from "../../public/activities-images/Group (3).svg"
import BackgroundPicture6 from "../../public/activities-images/Frame (9).svg"

import DashImage6 from "../../public/activities-images/SVG (1).svg"
import { Link } from "react-router-dom"

const educationalQuotes = [
  {
    area: "Emotionele Gezondheid",
    quote: "Emotionele intelligentie begint met het leren benoemen van je emoties.",
    author: "Daniel Goleman",
    color: "bg-red-600",
    icon: BackgroundPicture5,
    image: Daniel,
  },
  {
    area: "Veerkracht",
    quote: "Kinderen ontwikkelen veerkracht wanneer ze worden uitgedaagd met een helpende hand.",
    author: "Lev Vygotsky",
    color: "bg-blue-600",
    icon: BackgroundPicture1,
    image: Lev,
  },
  {
    area: "Dankbaarheid ",
    quote: "Dankbaarheid is de snelweg naar geluk.",
    author: "Robert Emmons",
    color: "bg-orange-400",
    icon: BackgroundPicture3,
    image: Robert,
  },
  {
    area: "Zelfzorg",
    quote: "Zelfzorg is een praktische weg naar zelfvertrouwen.",
    author: "Maria Montessori",
    color: "bg-green-400",
    icon: BackgroundPicture6,
    image: Maria,
  },
  {
    area: "Geldwijsheid ",
    quote: "Vroeg beginnen met financiële educatie draagt bij aan levenslang financieel welzijn.",
    author: "Lusardi & Mitchell",
    color: "bg-blue-400",
    icon: BackgroundPicture2,
    image: Lusardi,
  },
  {
    area: "Anders Denken",
    quote: "Creativiteit is net zo belangrijk als lezen en schrijven.",
    author: "Ken Robinson",
    color: "bg-blue-300",
    icon: DashImage6,
    image: Ken,
  },
  //   {
  //     area: "SPEL & LEREN",
  //     quote: "Spel is de taal van het kind, de poort naar creatief denken.",
  //     author: "Jean Piaget",
  //     color: "from-teal-400 to-blue-500",
  //     icon: "🎮",
  //   },
]

export default function Component() {
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-green-300 rounded-full opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-purple-300 rounded-full opacity-20 animate-bounce delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-orange-300 rounded-full opacity-20 animate-pulse delay-300"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-8 h-8 text-purple-500 mr-3 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <span className="bg-gradient-to-r inter-tight-600 from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-lg uppercase tracking-wide animate-pulse">
              WIJSHEID VAN EXPERTS
            </span>
          </div>

          <h2 className="md:text-5xl pb-2 text-3xl poppins-700 bg-clip-text text-transparent  bg-gradient-to-b to-[#9333EA] from-[#DB2777] mb-6 animate-fade-in">
            Wat zeggen onderwijslegendes? 🦸‍♂️
          </h2>

          <p className="text-gray-600 text-[16px] inter-tight-400 max-w-3xl mx-auto leading-relaxed">
            Inzichten van wereldberoemde experts die de basis legden voor modern onderwijs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
          {educationalQuotes.map((quote, index) => (
            <div
              key={index}
              className={`relative transform transition-all duration-500 hover:scale-105 hover:-rotate-1 ${hoveredCard === index ? "z-20" : "z-10"
                } h-full`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`bg-gradient-to-br ${quote.color} p-1 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full`}
              >
                <div className="bg-white rounded-3xl p-4 sm:p-6 h-full relative overflow-hidden flex flex-col min-h-[320px] sm:min-h-[300px]">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-200 to-pink-200 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 opacity-30"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 opacity-30"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex justify-start items-start">

                      <div className="h-16 w-16 shadow-lg bg-[#F8E6E6] rounded-xl flex justify-center items-center cursor-pointer mb-4">
                        <img src={quote.icon} className="h-10 w-10" alt="" />
                        </div>
                      </div>                      <div
                        className={`inline-block inter-tight-400  rounded-full text-md font-bold text-black poppins-700`}
                      >
                        {quote.area}
                      </div>
                    </div>

                    <blockquote className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 font-medium relative flex-grow">
                      <span className="text-3xl sm:text-4xl text-purple-300 absolute -top-1 sm:-top-2 -left-1 sm:-left-2">
                        "
                      </span>
                      <span className="relative z-10 block pt-4 inter-tight-400 sm:pt-6">{quote.quote}</span>
                      <span className="text-3xl sm:text-4xl text-purple-300 absolute -bottom-2 sm:-bottom-4 -right-1 sm:-right-2">
                        "
                      </span>
                    </blockquote>

                    <div className="flex items-center inter-tight-400 mt-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                        <img
                          src={quote.image}
                          alt=""
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-800 text-xs sm:text-sm truncate">{quote.author}</div>
                      </div>
                    </div>



                    {hoveredCard === index && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute top-8 right-8 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-100"></div>
                        <div className="absolute bottom-8 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-200"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fun call-to-action */}
        <div className="text-center cursor-pointer mt-16">
          <div className="inline-block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 p-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="bg-white rounded-full px-8 py-4">
            <Link to={"/activities"}>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Klaar om je eigen leeravontuur te beginnen? 🎉
              </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  )
}
