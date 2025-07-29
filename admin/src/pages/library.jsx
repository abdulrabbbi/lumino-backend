import { useState } from "react"
import { IoPlayCircleOutline } from "react-icons/io5"
import Pic1 from '../../public/library-images/Frame (6).svg'
import Pic2 from '../../public/library-images/SVG (1).svg'
import Pic3 from '../../public/library-images/SVG.svg'

const Library = () => {
    const [activeTab, setActiveTab] = useState("activiteit-toevoegen")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("alle-leergebieden")
    const [selectedAge, setSelectedAge] = useState("alle-leeftijden")
    const [selectedHeight, setSelectedHeight] = useState("hoogte")

    const activities = [
        {
            id: 1,
            title: "Dank-Kettingsprint",
            description: "Maak een mini-slinger van dankbaarheid die dagelijks kan groeien",
            duration: "6 min",
            ageRange: "5-6 jaar",
            image: Pic1,
            color: "#F59E0B",
            status: "completed",
            tag: "Dankbaarheid",
        },
        {
            id: 2,
            title: "Toren-van-Terugkaats",
            description: "Bouw samen torens die omvallen en leer dat herbouwen tot groei leidt.",
            duration: "10 min",
            ageRange: "3-5 jaar",
            image: Pic3,
            color: "#3B82F6",
            status: "completed",
            tag: "Veerkracht",
        },
        {
            id: 3,
            title: "Spiegelgezicht-Safari",
            description: "Ontdek emoties door gezichtsuitdrukkingen in despiegel te maken en lichaamssignalen te voelen.",
            duration: "8 min",
            ageRange: "3-4 jaar",
            image: Pic2,
            color: "#EF4444",
            status: "available",
            tag: "Emotionele Gezondheid",
        },
    ]

    return (
        <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex md:flex-row flex-col w-full justify-center items-center gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("speelweek")}
                        className={`flex-1 min-w-[100px] w-full cursor-pointer px-6 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "speelweek"
                            ? "bg-[#8F34EA] text-white"
                            : "text-[#616161] inter-tight-400 border border-[#B4B4B4]"
                            }`}
                    >
                        Speelweek
                    </button>
                    <button
                        onClick={() => setActiveTab("activiteitenbibliotheek")}
                        className={`flex-1 min-w-[100px] w-full cursor-pointer px-6 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "activiteitenbibliotheek"
                            ? "bg-[#8F34EA] text-white"
                            : "text-[#616161] inter-tight-400 border border-[#B4B4B4]"
                            }`}
                    >
                        Activiteitenbibliotheek
                    </button>
                    <button
                        onClick={() => setActiveTab("activiteit-toevoegen")}
                        className={`flex-1 min-w-[100px] w-full cursor-pointer px-6 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "activiteit-toevoegen"
                            ? "bg-[#8F34EA] text-white"
                            : "text-[#616161] inter-tight-400 border border-[#B4B4B4]"
                            }`}
                    >
                        Activiteit Toevoegen
                    </button>
                </div>


                <div className="bg-gradient-to-br rounded-3xl from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">

                            <input
                                type="text"
                                placeholder="Zoek Activiteiten"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-none outline-none text-sm bg-[#FFFFFF] rounded-xl inter-tight-400 "
                            />
                            <div className="absolute inset-y-0 left-0 bottom-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
                        >
                            <option value="alle-leergebieden">Alle Leergebieden</option>
                            <option value="emotioneel">Emotioneel</option>
                            <option value="sociaal">Sociaal</option>
                            <option value="cognitief">Cognitief</option>
                        </select>

                        <select
                            value={selectedAge}
                            onChange={(e) => setSelectedAge(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
                        >
                            <option value="alle-leeftijden">Alle Leeftijden</option>
                            <option value="3-4">3-4 jaar</option>
                            <option value="5-6">5-6 jaar</option>
                            <option value="7-8">7-8 jaar</option>
                        </select>

                        <select
                            value={selectedHeight}
                            onChange={(e) => setSelectedHeight(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-none outline-none text-[#707070] text-sm bg-[#FFFFFF] rounded-xl inter-tight-400"
                        >
                            <option value="hoogte">Hoogte</option>
                            <option value="laag">Laag</option>
                            <option value="gemiddeld">Gemiddeld</option>
                            <option value="hoog">Hoog</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl   text-[#000000] inter-tight-700 mb-6">Activities Completed</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities.map((activity) => {
                            return (
                                <div
                                    key={activity.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="h-1" style={{ backgroundColor: activity.color }}></div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div style={{ backgroundColor: activity.color }} className="w-14 h-14 rounded-full flex items-center justify-center">
                                                            <img src={activity.image} alt="" className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold poppins-700 text-[#111827] mb-1">{activity.title}</h3>
                                                            <span
                                                                className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                                                                style={{ backgroundColor: activity.color }}
                                                            >
                                                                {activity.tag}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[#4B5563] inter-tight-400 text-sm leading-relaxed mb-4 mt-3">{activity.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full bg-[#4B5563]/40 h-[1px]">

                                        </div>

                                        <div className="flex justify-between mt-6 inter-tight-400 items-center gap-4 mb-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span>{activity.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                                <span>{activity.ageRange}</span>
                                            </div>
                                        </div>

                                        {activity.status === "completed" ? (
                                            <div className="bg-[#FEFCE8] flex-col flex justify-center items-center p-10 rounded-3xl">

                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-orange-600">
                                                    <svg className="w-4 h-4 mr-1 bg-orange-600 text-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Voltooid
                                                </div>
                                                <span className="text-[#F59E0B] inter-tight-400 mt-2 text-sm">Fantastisch gedaan!</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">

                                                <button
                                                    className="w-full bg-gradient-to-br from-[#C42E8B] to-[#6650C7] text-white inter-tight-700 cursor-pointer py-2 px-4 rounded-2xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                                                >
                                                    <IoPlayCircleOutline className="w-6 h-6" />
                                                    Start Activiteit
                                                </button>
                                                <p className="text-center text-sm inter-tight-400 text-[#767676]">Klaar om aan de slag te gaan?</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Library