import React from 'react';
import { Tent, Flame, ChefHat, Waves, Music, Star } from 'lucide-react';
import { activities } from '../data';

const iconMap = {
  Tent,
  Flame,
  ChefHat,
  Waves,
  Music,
  Star
};

export function Activities() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Unforgettable Experiences</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Immerse yourself in a world of adventure and relaxation with our curated activities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap];
            return (
              <div
                key={activity.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Icon overlay */}
                  <div className="absolute top-6 right-6 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{activity.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{activity.description}</p>
                  
                  <div className="flex items-center text-emerald-600 font-semibold group-hover:text-emerald-700 transition-colors">
                    <span>Learn More</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}