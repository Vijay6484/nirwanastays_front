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
    <section className="py-0 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Accommodation Types</h2>
          <p className="text-base text-gray-600">Choose your perfect stay experience</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-center">
          {accommodationTypes.map((type, index) => {
            const IconComponent = iconMap[type.icon as keyof typeof iconMap];
            return (
              <div
                key={type.id}
                onClick={() => onTypeSelect(type.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center cursor-pointer
                  transition-all duration-300 hover:scale-105 min-w-[70px] sm:min-w-[80px] animate-slide-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`
                  w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${selectedType === type.id 
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg scale-105' 
                    : 'bg-gradient-to-br from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 shadow-md'
                  }
                `}>
                  <IconComponent className={`
                    w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300
                    ${selectedType === type.id ? 'text-white' : 'text-emerald-700'}
                  `} />
                </div>
                <span className={`
                  text-xs font-medium text-center transition-colors duration-300
                  ${selectedType === type.id ? 'text-emerald-600' : 'text-gray-700'}
                `}>
                  {type.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style> */}
    </section>
  );
}