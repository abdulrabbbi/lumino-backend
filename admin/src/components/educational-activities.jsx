import { Clock, User, Star, Play } from "lucide-react"
import { IoPlayCircleOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";


import BackgroundPicture1 from "../../public/images/Background (1).svg"
import BackgroundPicture2 from "../../public/images/Background (2).svg"
import BackgroundPicture3 from "../../public/images/Background (3).svg"
import BackgroundPicture4 from "../../public/images/Background (4).svg"
import BackgroundPicture5 from "../../public/images/Background.svg"
import { Link } from "react-router-dom";

export default function EducationalActivites() {
    const activities = [
        {
            id: 1,
            title: "Dank-Kettingsprint",
            description: "Maak een mini-slinger van dankbaarheid die dagelijks kan groeien.",
            image: BackgroundPicture5,
            progress: "20 min",
            ageRange: "4-6 jaar",
            rating: "9.5",
            reviews: "203 reviews",
            tag: "Dankbaarheid",
            tagColor: "bg-[#F59E0B] text-white",
        },
        {
            id: 2,
            title: "Toren-van-Terugkaats",
            description: "Maak een mini-slinger van dankbaarheid die dagelijks kan groeien.",
            image: BackgroundPicture1,
            progress: "10 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "167 reviews",
            tag: "Veerkracht",
            tagColor: "bg-[#3B82F6] text-white",
        },
        {
            id: 3,
            title: "Spiegelgezicht-Safari",
            description: "Ontdek emoties door gezichtsuitdrukkingen in de iegel te maken en lichaamssignalen te voelen.",
            image: BackgroundPicture2,
            progress: "10 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "156 reviews",
            tag: "Emotionele Gezondheid",
            tagColor: "bg-[#EF4444] text-white",
        },
        {
            id: 4,
            title: "Limonade-Lab",
            description: "Experimenteer met smaken en laat familie jouw creaties beoordelen als echte klanten.",
            image: BackgroundPicture3,
            progress: "10 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "167 reviews",
            tag: "Veerkracht",
            tagColor: "bg-[#3B82F6] text-white",
        },
        {
            id: 5,
            title: "Papieren-Brug-Challenge",
            description: "Los technische uitdagingen op door te experimenteren met eenvoudige materialen.",
            image: BackgroundPicture4,
            progress: "8 min",
            ageRange: "3-6 jaar",
            rating: "9.5",
            reviews: "156 reviews",
            tag: "Emotionele Gezondheid",
            tagColor: "bg-[#EF4444] text-white",
        },
    ]

    return (
        <div className="h-auto bg-gradient-to-br rounded-3xl from-[#EFF6FF] via-[#FAF5FF] to-[#FDF2F8] md:mt-24 mt-10 p-4 md:p-8">
            <div className="max-w-7xl mx-auto py-16">
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl  text-[#000000] poppins-700 mb-2">Deze Week: Week 1</h1>
                    <p className="text-[#4B5563] text-sm mb-6">5 zorgvuldig geselecteerde activiteiten om samen te ontdekken</p>

                    <div className="flex flex-col mt-10 sm:flex-row gap-4 justify-center items-center">
                        <button className="px-6 py-2 text-[#616161] cursor-pointer  text-sm transition-colors">
                            Speelweek
                        </button>

                        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

                        <button className="px-6 py-2 text-[#616161]  cursor-pointer text-sm  transition-colors">
                            Activiteitenbibliotheek
                        </button>

                        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

                        <button className="px-6 py-2 bg-[#8F34EA] text-white rounded-xl cursor-pointer  text-sm hover:bg-blue-700 transition-colors">
                            Activiteit Toevoegen
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity, index) => (
                        <Link
                            to={`/activity-detail/${activity.id}`}
                            key={activity.id}
                            className="relative group pt-5 pb-2 p-[1px]"
                        >
                            <div className="absolute -inset-1  rounded-2xl bg-gradient-to-br from-[#DB297A] to-[#7940EA] z-0 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <div
                                className={`
          relative z-10 bg-white  rounded-2xl overflow-hidden
          transition-shadow duration-300 ease-in-out
          group-hover:shadow-lg
          cursor-pointer
          ${index >= 3 ? "lg:col-span-1" : ""}
        `}
                            >
                                <div className="p-3">
                                    <div className="bg-[#F3F4F6] rounded-2xl h-48 flex items-center justify-center">
                                        <img src={activity.image || "/placeholder.svg"} alt="" className="w-16 h-16 object-cover" />
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div>
                                        <h3 className="text-lg text-[#0F2137] poppins-700 mb-1">{activity.title}</h3>
                                        <p className="text-[#666666] space-grotesk-400 text-[16px] leading-relaxed">{activity.description}</p>
                                    </div>

                                    <div className="flex items-center inter-tight-400 justify-between text-sm mt-8 text-[#838383]">
                                        <div className="flex items-center gap-1 sora-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{activity.progress}</span>
                                        </div>
                                        <div className="flex items-center gap-1 sora-400">
                                            <FiUsers className="w-4 h-4" />
                                            <span>{activity.ageRange}</span>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-[#FFFCE6] border border-yellow-200 p-3 flex items-center justify-center gap-2">
                                        <Star className="w-4 h-4 text-[#FACC15] fill-current" />
                                        <span className="text-sm inter-tight-400 font-medium text-gray-700">
                                            <span className="font-bold text-black inter-tight-700">{activity.rating}</span> ({activity.reviews})
                                        </span>
                                    </div>

                                    <div className="flex justify-center">
                                        <span className={`${activity.tagColor} px-3 py-1 rounded-full text-xs font-medium`}>
                                            {activity.tag}
                                        </span>
                                    </div>

                                    <button
                                        className="w-full bg-gradient-to-br from-[#C42E8B] to-[#6650C7] text-white inter-tight-700 cursor-pointer py-2.5 px-4 rounded-2xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                                    >
                                        <IoPlayCircleOutline className="w-6 h-6" />
                                        Start Activiteit
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>






                {/* Bottom spacing for the 2-card row */}
                <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:mt-6">
                    <div className="lg:col-start-1 lg:col-end-3">{/* This creates proper spacing for the bottom row */}</div>
                </div>
            </div>
        </div>
    )
}
