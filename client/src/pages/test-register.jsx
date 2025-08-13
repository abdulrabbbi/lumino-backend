/* eslint-disable no-unused-vars */
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import LoaderOverlay from '../components/LoaderOverlay'
import useSubmitTesterForm from "../hooks/useSubmitTesterForm";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function TestRegister() {
  const navigate = useNavigate();
  const [experience, setExperience] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [childFirstName, setChildFirstName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [moreChildrenInfo, setMoreChildrenInfo] = useState("");
  const [tellMoreAboutExperience, setTellMoreAboutExperience] = useState("");
  const [whyWantToBecomeTester, setWhyWantToBecomeTester] = useState("");
  const [timePerWeek, setTimePerWeek] = useState("");

  const { submitTesterForm, loading, error, success } = useSubmitTesterForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const result = await submitTesterForm({
      firstName,
      lastName,
      email,
      childFirstName,
      childAge,
      moreChildrenInfo,
      experienceBackground:
        experience === "professional"
          ? "Yes, I Am A Professional Teacher, Child Coach, Pedagogue, Etc!"
          : experience === "interested"
          ? "NO, But I Am Very Interested In Child Development"
          : "No, No Specific Background",
      tellMoreAboutExperience,
      whyWantToBecomeTester,
      timePerWeek,
    });
  
    if(result?.success){
      toast.success(result.message || "Form submitted successfully! You're now a test family.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate('/')
      }, 2000);
    } else {
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  

  return (
    <>
{/* <ToastContainer style={{ zIndex: 99999 }} /> */}
{loading && <LoaderOverlay/>} 
   
    <div className="h-full p-4 mt-5">
      <div className="max-w-7xl mx-auto">
        <div>
          <h1 className="text-[#000000] mb-5 poppins-700 text-2xl">
            Register As Tester
          </h1>
        </div>

        <div className="rounded-lg border border-[#E2E4E9] p-6 md:p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg text-[#000000] mb-4 inter-tight-700">
                Parent / Guardian Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="type..."
                      className="w-full px-3 py-2 border border-[#F0F1F4] bg-[#FBFCFD] rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="type..."
                      className="w-full px-3 py-2 border border-[#F0F1F4] bg-[#FBFCFD] rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abc@def.com"
                    className="w-full px-3 py-2 border border-[#F0F1F4] bg-[#FBFCFD] rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Child Information */}
            <div>
              <h2 className="text-lg text-[#000000] mb-4 inter-tight-700">Child Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="childFirstName" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                      Child's First Name*
                    </label>
                    <input
                      type="text"
                      id="childFirstName"
                      value={childFirstName}
                      onChange={(e) => setChildFirstName(e.target.value)}
                      placeholder="your child's first name"
                      className="w-full px-3 py-2 border border-[#F0F1F4] bg-[#FBFCFD] rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="childAge" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                      Child's Age*
                    </label>
                    <input
                      type="text"
                      id="childAge"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      placeholder="type..."
                      className="w-full px-3 py-2 border border-[#F0F1F4] bg-[#FBFCFD] rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="multipleChildren" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                    Do You Have More Than One Child? (Optional)
                  </label>
                  <input
                    type="text"
                    id="multipleChildren"
                    value={moreChildrenInfo}
                    onChange={(e) => setMoreChildrenInfo(e.target.value)}
                    placeholder="eg. yes, also an 8 year old son"
                    className="w-full px-3 py-2 border border-[#F0F1F4] bg-[#FBFCFD] rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-lg text-[#000000] mb-4 inter-tight-700">Your Experience & Background</h2>
              <div className="space-y-4">
                <p className="text-sm text-[#000000] inter-tight-400 mb-3">
                  Do You Have Experience In Education, Upbringing Or Child Coaching?*
                </p>
                <div className="space-y-2">
                  {/* radio buttons */}
                  <label className="flex items-start">
                    <input type="radio" name="experience" value="professional"
                      checked={experience === "professional"}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="ml-2 text-sm text-[#898989]">Yes, I Am A Professional Teacher, Child Coach, Pedagogue, Etc!</span>
                  </label>
                  <label className="flex items-start">
                    <input type="radio" name="experience" value="interested"
                      checked={experience === "interested"}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="ml-2 text-sm text-[#898989]">NO, But I Am Very Interested In Child Development</span>
                  </label>
                  <label className="flex items-start">
                    <input type="radio" name="experience" value="none"
                      checked={experience === "none"}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300" />
                    <span className="ml-2 text-sm text-[#898989]">No, No Specific Background</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="experienceDetails" className="block text-sm text-[#000000] inter-tight-400 mb-1">
                    Tell Us More About Your Experience (Optional)
                  </label>
                  <textarea id="experienceDetails" rows={3} value={tellMoreAboutExperience}
                    onChange={(e) => setTellMoreAboutExperience(e.target.value)}
                    placeholder="for example, I am a primary school teacher with 10 years of experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm resize-none" />
                </div>
              </div>
            </div>

            {/* Why */}
            <div>
              <h2 className="text-lg text-[#000000] mb-4 inter-tight-700">Why Do You Want To Become A Test Family?</h2>
              <div className="space-y-4">
                <div>
                  <textarea rows={3} value={whyWantToBecomeTester}
                    onChange={(e) => setWhyWantToBecomeTester(e.target.value)}
                    placeholder="Tell us why you want to participate..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 outline-none inter-tight-400 text-sm resize-none" />
                </div>
                <div>
                  <label htmlFor="timeCommitment" className="block text-sm font-medium text-[#000000] mb-1">
                    How Much Time Per Week Can You Spend On Testing And Feedback?
                  </label>
                  <div className="relative">
                    <select id="timeCommitment" value={timePerWeek}
                      onChange={(e) => setTimePerWeek(e.target.value)}
                      className="w-full px-3 py-2 border border-[#B9B9B9] bg-[#F7FAFC] rounded-md outline-none text-sm appearance-none">
                      <option value="">Select Time Investment</option>
                      <option value="1-2">1-2 hours per week</option>
                      <option value="3-5">3-5 hours per week</option>
                      <option value="6-10">6-10 hours per week</option>
                      <option value="10+">More than 10 hours per week</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-end ">
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white inter-tight-400 text-sm cursor-pointer  px-8 py-2 rounded-xl hover:bg-blue-700 transition">
                {loading ? "Submitting..." : "Register"}
              </button>
              {/* {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && <p className="text-green-600 mt-2">{success}</p>} */}
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
