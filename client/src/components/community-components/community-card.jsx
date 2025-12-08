/* eslint-disable no-unused-vars */
import React from 'react';

export function CommunityCard({ community, onSelect }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="w-full h-40 sm:h-48 overflow-hidden">
        <img
          src={community.image || "/placeholder.svg"}
          alt={community.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-md inter-tight-700  text-gray-900 mb-2">
          {community.name}
        </h3>

        {/* Description */}
        <p className="text-sm  text-gray-600 inter-tight-400 mb-4 flex-1 line-clamp-2">
          {community.description}
        </p>

        {/* Members */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex -space-x-2">
            {community.members.map((member, idx) => (
              <img
                key={member.id}
                src={member.avatar || "/placeholder.svg"}
                alt="Member"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <span className="text-xs inter-tight-400 text-gray-600">
            +{community.memberCount.toLocaleString()} members
          </span>
        </div>

        <button
          className={`justify-center md:w-auto w-full cursor-pointer text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap `}
          onClick={(e) => {
            e.stopPropagation();
            // alert(`${community.buttonText} clicked for ${community.name}`);
          }}
        >
          {community.buttonText}
        </button>
      </div>
    </div>
  );
}