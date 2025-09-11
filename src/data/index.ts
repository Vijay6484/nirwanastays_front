// import { Package } from './../../../plumeriaretreat/src/types/index';
import { Location, AccommodationType, Activity, Accommodation, Testimonial } from '../types';
import axios from 'axios';
const BASE_URL="https://api.nirwanastays.com";
console.log("API Base URL:", BASE_URL);
export const locations: Location[] = [
  {
    id: 'lonavala',
    name: 'Lonavala',
    image: 'https://static.toiimg.com/photo/msid-60778415,width-96,height-65.cms'
  },
  {
    id: 'pune',
    name: 'Pune',
    image: 'https://www.agoda.com/wp-content/uploads/2024/05/Shaniwar-Wada-Fort-Pune-Maharashtra.jpg'
  },
  {
    id: 'pawna',
    name: 'Pawna',
    image: 'https://www.trawell.in/admin/images/upload/080966593Lonavala_Tung_Fort_Main.jpg'
  },
  {
    id: 'Kamshet',
    name: 'Kamshet',
    image: 'https://static2.tripoto.com/media/filter/nl/img/15546/TripDocument/1461349203_camera360_2014_9_6_015119.jpg'
  }
];

export const accommodationTypes: AccommodationType[] = [
  { id: 'villa', name: 'Villa', icon: 'Home' },
  // { id: 'bungalow', name: 'Bungalow', icon: 'Building' },
  { id: 'camping', name: 'Camping', icon: 'Tent' },
  { id: 'glamping', name: 'Glamping', icon: 'TreePine' },
  { id: 'cottage', name: 'Cottage', icon: 'Castle' }
];

export const activities: Activity[] = [
  {
    id: 'camping',
    name: 'Lakeside Camping',
    description: 'Experience nature under the stars by the beautiful Pawna Lake',
    image: 'https://img.freepik.com/free-photo/tent-set-up-with-cooking-pots-ground-camping_91128-3712.jpg?semt=ais_hybridsponsored_sponsored&size=626&ext=jpg',
    icon: 'Tent'
  },
  {
    id: 'bonfire',
    name: 'Bonfire Nights',
    description: 'Gather around the fire with music, stories, and marshmallows',
    image: 'https://www.nscf.org.au/wp-content/uploads/2016/09/bonfire.jpg',
    icon: 'Flame'
  },
  {
    id: 'bbq',
    name: 'BBQ & Dining',
    description: 'Enjoy delicious grilled food with scenic lake views',
    image: 'https://blog.countrylife.ie/wp-content/uploads/2020/04/iStock-932487536-scaled.jpg',
    icon: 'ChefHat'
  },
  {
    id: 'kayaking',
    name: 'Water Sports',
    description: 'Kayaking, boating, and water activities on pristine waters',
    image: 'https://avatars.mds.yandex.net/i?id=dcc569bded0668fbfcee991ded85cb7a1a0a9ef6-4485911-images-thumbs&n=13',
    icon: 'Waves'
  },
  {
    id: 'music',
    name: 'Music Nights',
    description: 'Live music sessions and acoustic performances',
    image: 'https://i.ytimg.com/vi/iM6t2sKlcjc/maxresdefault.jpg',
    icon: 'Music'
  },
  {
    id: 'stargazing',
    name: 'Stargazing',
    description: 'Observe constellations in the clear night sky',
    image: 'https://d1l57x9nwbbkz.cloudfront.net/files/s3fs-public/2021-09/Stargazing_LennoxAddington.jpg?VersionId=kOxSBRwDe8u0d80i_cEwoYaHqgMa0UWM',
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