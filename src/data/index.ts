import { Package } from './../../../plumeriaretreat/src/types/index';
import { Location, AccommodationType, Activity, Accommodation, Testimonial } from '../types';
import axios from 'axios';
const BASE_URL=import.meta.env.VITE_ADMIN_BASE_URL;
export const locations: Location[] = [
  {
    id: 'lonavala',
    name: 'Lonavala',
    image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'pune',
    name: 'Pune',
    image: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'pawna',
    name: 'Pawna',
    image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'panshet',
    name: 'Panshet',
    image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const accommodationTypes: AccommodationType[] = [
  { id: 'villa', name: 'Villa', icon: 'Home' },
  { id: 'bungalow', name: 'Bungalow', icon: 'Building' },
  { id: 'camping', name: 'Camping', icon: 'Tent' },
  { id: 'glamping', name: 'Glamping', icon: 'TreePine' },
  { id: 'cottage', name: 'Cottage', icon: 'Castle' }
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

let accommodations: Accommodation[] = [];

// Fetch once and cache
export const fetchAccommodations = async (): Promise<Accommodation[]> => {
  if (accommodations.length) return accommodations;
  try {
    const response = await axios.get(`${BASE_URL}/admin/properties/accommodations`);
    const data = response.data.data;
    console.log(data);
    accommodations = (data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      type: item.type?.toLowerCase() || '',
      location: item.location?.address || '',
      price: parseFloat(item.price),
      image: item.images?.[0] || '',
      description: item.description,
      fullDescription: item.package?.description || item.description,
      inclusions: item.features || [],
      exclusions: [],
      gallery: item.images || []
      ,adult_price: item.package.pricing.adult,
      child_price: item.package.pricing.child,
      max_guest: item.package.pricing.maxGuests
    }));
    return accommodations;
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return [];
  }
};

export const getAccommodations = () => accommodations;

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

// export const galleryImages = [
//   'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/1749644/pexels-photo-1749644.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/2089717/pexels-photo-2089717.jpeg?auto=compress&cs=tinysrgb&w=600',
//   'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600'
// ];

export{accommodations};