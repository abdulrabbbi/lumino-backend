import React from 'react';
import Badge1 from '../../public/profile-images/Frame.svg'
import Badge2 from '../../public/profile-images/Frame-1.svg'
import Badge3 from '../../public/profile-images/Frame-3.svg'
import Badge4 from '../../public//profile-images/Frame (6).svg'
import Badge5 from '../../public//profile-images/Frame (7).svg'
import Badge6 from '../../public//profile-images/Frame (8).svg'


import SBadge1 from '../../public/profile-images/Frame (6)-new.svg'
import SBadge2 from '../../public/profile-images/Frame (7)-new.svg'
import SBadge3 from '../../public/profile-images/Frame (8)-new.svg'
import SBadge4 from '../../public//profile-images/Frame (9).svg'
import SBadge5 from '../../public//profile-images/Frame (10).svg'
import SBadge6 from '../../public//profile-images/Frame (11).svg'

import TBadge1 from '../../public/profile-images/Frame (6)-new-1.svg'
import TBadge2 from '../../public/profile-images/Frame (7)-new-1.svg'
import TBadge3 from '../../public/profile-images/Frame (8)-new-1.svg'
import TBadge4 from '../../public//profile-images/Frame (9)-new-1.svg'
import TBadge5 from '../../public//profile-images/Frame (10)-new-1.svg'

import FBadge1 from '../../public/profile-images/Frame (11)-new-2.svg'
import FBadge2 from '../../public/profile-images/Frame (12).svg'
import FBadge3 from '../../public/profile-images/Frame (13).svg'
import FBadge4 from '../../public//profile-images/Frame (14).svg'
import FBadge5 from '../../public//profile-images/Frame (15).svg'
import FBadge6 from '../../public//profile-images/Frame (16).svg'




const BadgeJourney = () => {
    const coreBadges = [
        {
            id: 1,
            title: "First Step",
            image: Badge1,
            bgColor: "bg-[#FFF6F7]",
            description: "Complete Your 1st Activity",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 2,
            title: "5-In-A Row",
            image: Badge2,
            bgColor: "bg-[#FFF6F7]",
            description: "Complete all 5 activates in a week",
        },
        {
            id: 3,
            title: "Consistency Champ",
            image: Badge3,
            bgColor: "bg-[#FFF6F7]",
            description: "4+ weeks of regular activity",
        }, {
            id: 4,
            title: "Bounce back",
            image: Badge4,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ resilience activities",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 5,
            title: "Gratitude Giver",
            image: Badge5,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ gratitude activates",
        },
        {
            id: 6,
            title: "focus starter",
            image: Badge6,
            bgColor: "bg-[#FFF6F7]",
            description: "complete an activity in each area",
        }

    ];

    const areaBadges = [
        {
            id: 1,
            title: "Feelings finder",
            image: SBadge1,
            bgColor: "bg-[#FFF6F7]",
            description: "+3 emotional health activity",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 2,
            title: "Gratitude Giver",
            image: SBadge2,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ resilience activity",
        },
        {
            id: 3,
            title: "Self Care Star",
            image: SBadge3,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ self care activities",
        }, {
            id: 4,
            title: "Money minded",
            image: SBadge4,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ financial literacy activates",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 5,
            title: "Mini Maker",
            image: SBadge5,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ entrepreneurship activities",
        },
        {
            id: 6,
            title: "Creative Thinker",
            image: SBadge6,
            bgColor: "bg-[#FFF6F7]",
            description: "complete 3 self-cee activities to unlock",
        }

    ];
    const bonusBadges = [
        {
            id: 1,
            title: "Idea Contributor",
            image: TBadge1,
            bgColor: "bg-[#FFF6F7]",
            description: "Submit an activity idea",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 2,
            title: "Early Adopter",
            image: TBadge2,
            bgColor: "bg-[#FFF6F7]",
            description: "Among first 1,000 lifetime users",
        },
        {
            id: 3,
            title: "Mobile Explorer",
            image: TBadge3,
            bgColor: "bg-[#FFF6F7]",
            description: "3+ self care activities",
        }, {
            id: 4,
            title: "Social Shoutout",
            image: TBadge4,
            bgColor: "bg-[#FFF6F7]",
            description: "Share content on social media",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 5,
            title: "Surprise Streak",
            image: TBadge5,
            bgColor: "bg-[#FFF6F7]",
            description: "Random badge for fun engagement",
        }

    ];


    const highBadges = [
        {
            id: 1,
            title: "Meesterounder",
            image: FBadge1,
            bgColor: "bg-[#FFF6F7]",
            description: "een ouder die alles gedaan heeft-en meer",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 2,
            title: "Streekampioen",
            image: FBadge2,
            bgColor: "bg-[#FFF6F7]",
            description: "voltooi 12 wekelijks voltooien",
        },
        {
            id: 3,
            title: "Categories-master",
            image: FBadge3,
            bgColor: "bg-[#FFF6F7]",
            description: "voltooi alle activiteiten in en leergebied",
        }, {
            id: 4,
            title: "Verrassingsspeler",
            image: FBadge4,
            bgColor: "bg-[#FFF6F7]",
            description: "ontgrendel 3 verborgen badges bev",
            iconBg: "bg-[#F8E6E6]",
        },
        {
            id: 5,
            title: "Ontgrenneld 3",
            image: FBadge5,
            bgColor: "bg-[#FFF6F7]",
            description: "ontgrenneld 3 verborgen badfes bev",
        },
        {
            id: 6,
            title: "Sezoensdelen",
            image: FBadge6,
            bgColor: "bg-[#FFF6F7]",
            description: "voltooi 3 weken op rij om deze te op rij om deze te ",
        }

    ];

    return (
        <div className="  mt-10 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-14">
                    <h1 className="text-4xl md:text-5xl inter-tight-700 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                        Your Badge Journey
                    </h1>
                    <p className=" inter-tight-400 text-[#000000] text-sm mb-8">
                        Earn Badges As You Grow & Learn!
                    </p>

                    <div className="max-w-md mx-auto mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: '48%' }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-[#9C9C9C] inter-tight-400 text-sm">12 Of 25 Badges Earned</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl  text-center text-[#000000] poppins-700 mb-8">
                        Core Progression
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coreBadges.map((badge) => (
                            <div
                                key={badge.id}
                                className=" rounded-xl border border-[#D9D9D9] p-6   shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex justify-center mb-6 ">
                                    <div className={`w-26 h-26 rounded-2xl ${badge.iconBg} flex items-center justify-center`}>
                                        <div className={`w-26 h-26 rounded-xl shadow-xl ${badge.bgColor} flex items-center justify-center`}>
                                            <img src={badge.image} alt="" />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg md:text-xl poppins-700 text-black text-center">
                                    {badge.title}
                                </h3>
                                <p className='mt-1 text-sm flex justify-center items-center text-[#828282] inter-tight-400'>{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </div>


                <div className='mt-[13%]'>


                    <div className="">
                        <h2 className="text-2xl  text-center text-[#000000] poppins-700 mb-8">
                            Learning area badges                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {areaBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className=" rounded-xl border border-[#D9D9D9] p-6   shadow-lg transition-shadow duration-300"
                                >
                                    <div className="flex justify-center mb-6 ">
                                        <div className={`w-26 h-26 rounded-2xl ${badge.iconBg} flex items-center justify-center`}>
                                            <div className={`w-26 h-26 rounded-xl shadow-xl ${badge.bgColor} flex items-center justify-center`}>
                                                <img src={badge.image} alt="" />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg md:text-xl poppins-700 text-black text-center">
                                        {badge.title}
                                    </h3>
                                    <p className='mt-1 text-sm flex justify-center items-center text-[#828282] inter-tight-400'>{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='mt-[13%]'>


                    <div className="">
                        <h2 className="text-2xl  text-center text-[#000000] poppins-700 mb-8">
                            Special & Bonus Badges                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bonusBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className=" rounded-xl border border-[#D9D9D9] p-6   shadow-lg transition-shadow duration-300"
                                >
                                    <div className="flex justify-center mb-6 ">
                                        <div className={`w-26 h-26 rounded-2xl ${badge.iconBg} flex items-center justify-center`}>
                                            <div className={`w-26 h-26 rounded-xl shadow-xl ${badge.bgColor} flex items-center justify-center`}>
                                                <img src={badge.image} alt="" />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg md:text-xl poppins-700 text-black text-center">
                                        {badge.title}
                                    </h3>
                                    <p className='mt-1 text-sm flex justify-center items-center text-[#828282] inter-tight-400'>{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div className='mt-[13%]'>


                    <div className="">
                        <div className='flex flex-col justify-center items-center mb-10'>

                            <h2 className="text-2xl  text-center text-[#000000] poppins-700">
                                High achiever badges page                   </h2>
                            <p className='mt-1 text-sm inter-tight-400 text-black'>Complete long term challenges to earn rare badges!</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {highBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className=" rounded-xl border border-[#D9D9D9] p-6   shadow-lg transition-shadow duration-300"
                                >
                                    <div className="flex justify-center mb-6 ">
                                        <div className={`w-26 h-26 rounded-2xl ${badge.iconBg} flex items-center justify-center`}>
                                            <div className={`w-26 h-26 rounded-xl shadow-xl ${badge.bgColor} flex items-center justify-center`}>
                                                <img src={badge.image} alt="" />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg md:text-xl poppins-700 text-black text-center">
                                        {badge.title}
                                    </h3>
                                    <p className='mt-1 text-sm flex justify-center items-center text-[#828282] inter-tight-400'>{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeJourney;