import { Share } from "lucide-react";
import { IoIosShareAlt } from "react-icons/io";

export default function ReferralPage() {
  return (
    <div className="">
      <div className="border border-[#E2E4E9] rounded-xl p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl inter-tight-400 md:text-[24px] text-gray-900 mb-3">
            Refer a Friend & Earn Rewards!
          </h1>
          <p className="text-[#696969] inter-tight-400 text-[14px]  ">
          Share the love! Invite your friends to join and get rewarded when they sign up.          </p>
        </div>

        <hr className="border-gray-300 mb-8" />

        <div className="mb-5">
          <h2 className="text-2xl inter-tight-400 md:text-[20px] text-gray-900 mb-3">
            How It Works:
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 text-[#737373]  flex items-center justify-center text-sm font-medium">
                1.
              </span>
              <p className="text-[14px] inter-tight-400 text-[#737373]">
                Share your link with friends.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 text-[#737373]  flex items-center justify-center text-sm font-medium">
                2.
              </span>
              <p className="text-[14px] inter-tight-400 text-[#737373]">
                They sign up and complete their first action.
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 text-[#737373]  flex items-center justify-center text-sm font-medium">
                3.
              </span>
              <p className="text-[14px] inter-tight-400 text-[#737373]">
                You both get exclusive rewards!
              </p>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h2 className="text-xl inter-tight-400 md:text-[20px] text-[#000000] mb-6">
            You Get: 1 Free Month / Bonus Points / Discount
          </h2>
        </div>

        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-[#000000] inter-tight-400 font-medium text-[14px] whitespace-nowrap">
              Your Referral Link:
            </label>
            <div className="flex-1 bg-[#F7FAFC] border-none  rounded px-3 py-2">
              <span className="text-[#000000] inter-tight-400 text-sm  break-all">
                https://dummylink.com/referral/yourname123
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl inter-tight-400 md:text-[20px] text-[#000000] mb-4">
            Start Inviting Now!
          </h2>
          <button className="bg-[#16A34A] inter-tight-400 text-sm cursor-pointer hover:bg-green-700 text-white font-medium px-8 py-2.5 rounded-lg   flex items-center gap-2 transition-colors duration-200">
            <IoIosShareAlt size={20} />
            Share Now
          </button>
        </div>
      </div>
    </div>
  );
}