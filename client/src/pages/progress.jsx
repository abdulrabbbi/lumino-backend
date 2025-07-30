/* eslint-disable no-unused-vars */
import StatImage1 from "../../public/images/Background-1-progress.svg";
import StatImage2 from "../../public/images/Background (1)-progress.svg";
import StatImage3 from "../../public/images/Background (2)-progress.svg";
import StatImage4 from "../../public/images/Background (3)-progress.svg";

import PDashImage from "../../public/activities-images/Frame (6).svg";
import PDashImage2 from "../../public/activities-images/Frame (7).svg";
import PDashImage3 from "../../public/activities-images/Frame (8).svg";
import PDashImage4 from "../../public/activities-images/Frame (9).svg";
import PDashImage5 from "../../public/activities-images/Group (3).svg";
import PDashImage6 from "../../public/activities-images/SVG (1).svg";
import PDashImage7 from "../../public/activities-images/SVG.svg";
import { useProgressStats } from "../hooks/useProgressState";
import LoaderOverlay from '../components/LoaderOverlay'

// Color mapping for categories
const categoryColors = {
  "Emotionele Gezondheid": "red",
  "Veerkracht": "blue",
  "Dankbaarheid": "yellow",
  "Zelfzorg": "green",
  "Geldwijsheid": "purple",
  "Ondernemerschap": "orange",
  "Anders denken": "blue"
};

// Image mapping for categories
const categoryImages = {
  "Emotionele Gezondheid": PDashImage5,
  "Veerkracht": PDashImage,
  "Dankbaarheid": PDashImage3,
  "Zelfzorg": PDashImage4,
  "Geldwijsheid": PDashImage2,
  "Ondernemerschap": PDashImage7,
  "Anders denken": PDashImage6
};

// Default categories data for non-logged users or when no data is available
const defaultCategories = [
  {
    title: "Emotionele Gezondheid",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  },
  {
    title: "Veerkracht",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  },
  {
    title: "Dankbaarheid",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  },
  {
    title: "Zelfzorg",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  },
  {
    title: "Geldwijsheid",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  },
  {
    title: "Ondernemerschap",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  },
  {
    title: "Anders denken",
    percentage: 0,
    totalActivities: 0,
    finishedActivities: 0
  }
];

const ProgressDashboard = () => {
  const { stats, loading, error } = useProgressStats();

  const ProgressBar = ({ color, percentage = 0 }) => {
    const colorClasses = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      cyan: "bg-cyan-500",
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${colorClasses[color]}`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const CircularProgress = ({ color }) => {
    const tickColorClasses = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      cyan: "bg-cyan-500",
    };

    return (
      <div className="relative w-5 h-5">
        <div className={`w-5 h-5 ${tickColorClasses[color]} rounded-full flex items-center justify-center`}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  };

  // Default stats data (for loading or error states)
  const defaultStatsData = [ 
    {
      value: "0",
      label: "Voltooid",
      image: StatImage1,
    },
    {
      value: "0",
      label: "Badges",
      image: StatImage2,
    },
    {
      value: "0%",
      label: "Week %",
      image: StatImage3,
    },
    {
      value: "0",
      label: "Toegevoegde activiteiten",
      image: StatImage4,
    },
  ];

  // Prepare stats data based on API response
  const statsData = stats ? [
    {
      value: stats.stats.completedActivities.toString(),
      label: "Voltooid",
      image: StatImage1,
    },
    {
      value: stats.stats.badges.toString(),
      label: "Badges",
      image: StatImage2,
    },
    {
      value: `${stats.stats.weekPercentage}%`,
      label: "Week %",
      image: StatImage3,
    },
    {
      value: stats.stats.addedActivities.toString(),
      label: "Toegevoegde activiteiten",
      image: StatImage4,
    },
  ] : defaultStatsData;

  // Use API data if available, otherwise use default categories
  // const categoriesToShow = stats?.categories && stats.categories.length > 0 ? stats.categories : defaultCategories;

  const categoriesToShow = stats?.categories || [];

  // Prepare category cards based on API response or default data
  const categoryCards = categoriesToShow.map(category => ({
    title: category.title,
    color: categoryColors[category.title] || "blue",
    percentage: category.percentage,
    totalActivities: category.totalActivities,
    finishedActivities: category.finishedActivities,
    image: categoryImages[category.title] || PDashImage,
    icon: (
      <div className="w-12 h-12 bg-[#F8E6E6] rounded-xl flex items-center justify-center">
        <img src={categoryImages[category.title] || "/placeholder.svg"} alt={category.title} className="w-6 h-6" />
      </div>
    ),
  }));

  if (loading) {
    return <LoaderOverlay/>
  }

  return (
    <div className="min-h-screen p-4 mt-10 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl inter-tight-700 pb-3 bg-clip-text text-transparent bg-gradient-to-b to-[#9333EA] from-[#DB2777]">
            Jouw Voortgang{" "}
          </h1>
          <p className="text-[#4B5563] text-sm mt-3 sm:text-base max-w-2xl mx-auto">
            Fantastisch! Bekijk hier al je voltooide activiteiten en behaalde prestaties.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-[#FFFFFFCC] rounded-xl shadow-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div>
                  <img src={stat.image || "/placeholder.svg"} alt="" />
                </div>
              </div>
              <div className="text-2xl text-[#111827] poppins-700 mb-1">{stat.value}</div>
              <div className="text-sm inter-tight-400 text-[#4B5563]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 mt-10 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categoryCards.map((category, index) => (
            <div key={index} className="bg-[#FFFFFF] border-[#D9D9D9] border shadow-xl rounded-2xl p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {category.icon}
                  <h3 className="font-semibold text-gray-900 text-lg">{category.title}</h3>
                </div>
              </div>

              <div className="space-y-2 max-w-xs w-full m-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{category.finishedActivities} van {category.totalActivities} Voltooid</span>
                  <CircularProgress color={category.color} />
                </div>
                <ProgressBar color={category.color} percentage={category.percentage} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#A855F7] to-[#EC4899] rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4 text-center">Tijd om te beginnen! 🚀</h2>
          <p className="text-center max-w-3xl mx-auto">
            Start je eerste activiteit en begin aan je leerreis!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;