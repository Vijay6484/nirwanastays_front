import { Location, AccommodationType, Activity, Accommodation, Testimonial } from '../types';
import axios from 'axios';

const BASE_URL = "https://api.nirwanastays.com";
console.log("API Base URL:", BASE_URL);

// Global variables to store the data
let locations: Location[] = [];
let accommodations: Accommodation[] = [];

// Fetch locations and cache them
export const fetchLocations = async (): Promise<Location[]> => {
  console.log("Fetching locations from API...");
  if (locations.length) return locations;
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/cities`);
    const data = response.data.data;
    console.log("Locations data:", data);
    
    locations = (data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      image: item.image || "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400",
    }));
    
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const getLocations = (): Location[] => locations;

export const accommodationTypes: AccommodationType[] = [
  { id: 'cottage', name: 'Cottage', icon: 'Castle' },
  { id: 'villa', name: 'Villa', icon: 'Home' },
  { id: 'camping', name: 'Camping', icon: 'Tent' },
  { id: 'glamping', name: 'Glamping', icon: 'TreePine' }
];

export const activities: Activity[] = [
  {
    id: 'camping',
    name: 'Lakeside Camping',
    description: 'Experience nature under the stars by the beautiful Pawna Lake',
    image: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: 'Tent'
  },
  {
    id: 'bonfire',
    name: 'Bonfire Nights',
    description: 'Gather around the fire with music, stories, and marshmallows',
    image: 'https://images.pexels.com/photos/1749644/pexels-photo-1749644.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: 'Flame'
  },
  {
    id: 'bbq',
    name: 'BBQ & Dining',
    description: 'Enjoy delicious grilled food with scenic lake views',
    image: 'https://images.pexels.com/photos/2089717/pexels-photo-2089717.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: 'ChefHat'
  },
  {
    id: 'kayaking',
    name: 'Water Sports',
    description: 'Kayaking, boating, and water activities on pristine waters',
    image: 'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: 'Waves'
  },
  {
    id: 'music',
    name: 'Music Nights',
    description: 'Live music sessions and acoustic performances',
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: 'Music'
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    description: 'Observe constellations in the clear night sky',
    image: 'https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: 'Star'
  }
];

// Fetch accommodations and cache them
export const fetchAccommodations = async (): Promise<Accommodation[]> => {
  console.log("Fetching accommodations from API...");
  if (accommodations.length) return accommodations;
  
  try {
    const response = await axios.get(`${BASE_URL}/admin/properties/accommodations`);
    const data = response.data.data;
    console.log("Accommodations data:", data);
    
    const normalizeType = (raw: any): string => {
      const t = String(raw || '').trim().toLowerCase();
      const map: Record<string, string> = {
        tent: 'camping',
        tents: 'camping',
        campsite: 'camping',
        camping: 'camping',
        glamp: 'glamping',
        glamping: 'glamping',
        cottage: 'cottage',
        cottages: 'cottage',
        bungalow: 'bungalow',
        bungalows: 'bungalow',
        villa: 'villa',
        villas: 'villa',
        resort: 'villa',
        resorts: 'villa'
      };
      return map[t] || t;
    };

    accommodations = (data || []).map((item: any) => {
      const rawType =
        item.type ||
        item.category ||
        item.category?.name ||
        item.package?.type ||
        item.property_type ||
        item.propertyType ||
        item.accommodationType ||
        '';

      let normalizedType = normalizeType(rawType);
      if (!normalizedType && typeof item.name === 'string') {
        const nameLc = item.name.toLowerCase();
        if (nameLc.includes('cottage')) normalizedType = 'cottage';
        else if (nameLc.includes('bungalow')) normalizedType = 'bungalow';
        else if (nameLc.includes('villa') || nameLc.includes('resort')) normalizedType = 'villa';
        else if (nameLc.includes('glamp')) normalizedType = 'glamping';
        else if (nameLc.includes('camp')) normalizedType = 'camping';
      }

      const loc = item.location;
      const locationString = typeof loc === 'string'
        ? loc
        : [loc?.address, loc?.city, loc?.name].filter(Boolean).join(' ');

      const rawCityId = item.city_id ?? item.cityId ?? item.location?.city_id ?? item.location?.cityId;
      const cityId = rawCityId !== undefined && rawCityId !== null && String(rawCityId).trim() !== ''
        ? String(rawCityId)
        : undefined;

      return ({
        id: String(item.id),
        name: item.name,
        type: normalizedType,
        location: locationString,
        cityId,
        price: parseFloat(item.price),
        image: item.images?.[0] || '',
        description: item.description,
        fullDescription: item.package?.description || item.description,
        inclusions: item.features || [],
        exclusions: [],
        gallery: item.images || [],
        adult_price: item.package?.pricing?.adult || 0,
        child_price: item.package?.pricing?.child || 0,
        max_guest: item.package?.pricing?.maxGuests || 0,
        available: item.available 
      });
    });
    
    return accommodations;
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }
};

export const getAccommodations = (): Accommodation[] => accommodations;

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    review: 'Amazing experience! The lakeside villa was perfect for our weekend getaway. The views were breathtaking and the staff was incredibly helpful.',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Rahul Patel',
    location: 'Pune',
    rating: 5,
    review: 'The glamping experience was phenomenal! Perfect blend of adventure and comfort. The bonfire nights and activities made it unforgettable.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Anjali Singh',
    location: 'Delhi',
    rating: 5,
    review: 'Nirwana Stays exceeded all expectations! The location is pristine, activities are well-organized, and the food was delicious. Highly recommended!',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'Vikram Joshi',
    location: 'Bangalore',
    rating: 5,
    review: 'Perfect for a corporate retreat! The eco-bungalow was spacious, the team-building activities were engaging, and the natural setting was refreshing.',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

// Export the arrays (note: these will be empty until fetch functions are called)
export { accommodations, locations };