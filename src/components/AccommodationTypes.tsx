import React from 'react';
import { Home, Building, Tent, TreePine, Castle } from 'lucide-react';
import { accommodationTypes } from '../data';

const iconMap = {
  Home,
  Building,
  Tent,
  TreePine,
  Castle
};

interface AccommodationTypesProps {
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
}

export function AccommodationTypes({ selectedType, onTypeSelect }: AccommodationTypesProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Accommodation Types</h2>
          <p className="text-lg text-gray-600">Choose your perfect stay experience</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 -mx-4 sm:justify-center scrollbar-hide">
          {accommodationTypes.map((type, index) => {
            const IconComponent = iconMap[type.icon as keyof typeof iconMap];
            return (
              <div
                key={type.id}
                onClick={() => onTypeSelect(type.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center p-8 rounded-3xl cursor-pointer
                  transition-all duration-300 hover:scale-105 min-w-[160px] animate-slide-up
                  ${selectedType === type.id
                    ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-2xl scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-lg hover:shadow-xl'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  selectedType === type.id ? 'bg-white/20' : 'bg-emerald-100'
                }`}>
                  <IconComponent className={`w-8 h-8 ${
                    selectedType === type.id ? 'text-white' : 'text-emerald-600'
                  }`} />
                </div>
                <span className="font-semibold text-center">{type.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}