// ApplyReferralCode.jsx - NEW COMPONENT
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/api";
import { toast } from "react-toastify";

export default function ApplyReferralCode() {
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyReferral = async () => {
    if (!referralCode) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${BASE_URL}/apply`,
        { referralCode },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setReferralCode("");
      } else {
        toast.error("Failed to apply referral code");
      }
    } catch (error) {
      console.error("Error applying referral code:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-[#E2E4E9]/60 rounded-xl p-4 mt-6">
      <h2 className="text-xl font-medium mb-4 inter-tight-400">Apply a Referral Code</h2>
      <p className="text-gray-600 mb-4 inter-tight-400">
        If you have a referral code from a friend, enter it below to get 1 month free!
      </p>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          className="flex-1 border border-gray-300/40 outline-none text-sm inter-tight-400 rounded-lg px-4 py-2"
        />
        <button
          onClick={handleApplyReferral}
          disabled={isLoading || !referralCode}
          className="bg-green-600 hover:bg-green-700 text-sm cursor-pointer inter-tight-400 text-white font-medium px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          {isLoading ? "Applying..." : "Apply Code"}
        </button>
      </div>
    </div>
  );
}