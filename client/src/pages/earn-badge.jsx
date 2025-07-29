import { useNavigate } from "react-router-dom"; // or useRouter if Next.js
import useUserBadges from "../hooks/useUserBadges";

import Badge1 from '../../public/profile-images/Frame.svg';
import Badge2 from '../../public/profile-images/Frame-1.svg';
import Badge3 from '../../public/profile-images/Frame-3.svg';
import LoaderOverlay from "../components/LoaderOverlay";

export default function EarnedBadgesPage() {
  const navigate = useNavigate(); 
  const { badges, loading } = useUserBadges();

  const badgeImages = {
    "First Step": Badge1,
    "5-In-A Row": Badge2,
    "Consistency Champ": Badge3,
  };


  return (
    <>
    {loading && <LoaderOverlay/>}
    <div className="">
      <div className="bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
        <h1 className="text-xl md:text-[24px] intet-tight-400x text-black mb-8">
          Earned Badges
        </h1>

        {badges.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-md inter-tight-400">You haven't earned any badges yet. Complete your first activity and earn badges.</p>
            <button
              onClick={() => navigate('/activities')}
              className="bg-blue-500 text-sm cursor-pointer inter-tight-400 text-white px-10 py-2 rounded-xl duration-500 transition-all hover:bg-blue-600"
            >
              Play Activities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {badges.map((badge, index) => (
  <div
    key={index}
    className="rounded-xl border border-[#D9D9D9] p-6 shadow-lg transition-shadow duration-300"
  >
    <div className="flex justify-center mb-6 bg-[#FFFCF8]">
      <div className="w-26 h-26 rounded-xl shadow-xl bg-[#FFF6F7] flex items-center justify-center">
        <img src={badgeImages[badge.name] || badge.icon || Badge1} alt={badge.name} />
      </div>
    </div>
    <h3 className="text-lg md:text-xl poppins-700 text-black text-center">
      {badge.name}
    </h3>
    <p className="text-sm text-center text-gray-600 mt-2">{badge.description}</p>
  </div>
))}

          </div>
        )}
      </div>
    </div>
    </>

  );
}
