import { Location, AccommodationType, Activity, Accommodation, Testimonial } from '../types';

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

export const accommodations: Accommodation[] = [
  {
    id: 'luxury-villa-1',
    name: 'Lakeside Luxury Villa',
    type: 'villa',
    location: 'pawna',
    price: 8500,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Spacious villa with panoramic lake views and modern amenities',
    fullDescription: 'Experience luxury living in our premium lakeside villa featuring panoramic views of Pawna Lake. This spacious accommodation includes modern amenities, private balcony, and direct lake access.',
    inclusions: ['Breakfast', 'Wi-Fi', 'Parking', 'Lake Access', 'BBQ Kit'],
    exclusions: ['Lunch', 'Dinner', 'Transportation', 'Adventure Activities'],
    gallery: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'eco-bungalow-1',
    name: 'Eco-Friendly Bungalow',
    type: 'bungalow',
    location: 'lonavala',
    price: 4500,
    image: 'https://images.pexels.com/photos/2598638/pexels-photo-2598638.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Sustainable bungalow surrounded by lush greenery',
    fullDescription: 'Stay in harmony with nature in our eco-friendly bungalow designed with sustainable materials and surrounded by lush greenery.',
    inclusions: ['Breakfast', 'Nature Walk', 'Wi-Fi', 'Parking'],
    exclusions: ['Meals (except breakfast)', 'Transportation', 'Personal Expenses'],
    gallery: [
      'https://images.pexels.com/photos/2598638/pexels-photo-2598638.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'adventure-camp-1',
    name: 'Adventure Base Camp',
    type: 'camping',
    location: 'pawna',
    price: 2500,
    image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Traditional camping experience with modern facilities',
    fullDescription: 'Experience authentic camping with comfortable tents, shared facilities, and guided activities perfect for adventure enthusiasts.',
    inclusions: ['Tent Setup', 'Sleeping Bags', 'Bonfire', 'Basic Meals', 'Activities'],
    exclusions: ['Luxury Amenities', 'Private Bathroom', 'Air Conditioning'],
    gallery: [
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'glamping-deluxe-1',
    name: 'Deluxe Glamping Pod',
    type: 'glamping',
    location: 'panshet',
    price: 6500,
    image: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Luxury camping with hotel-like amenities in nature',
    fullDescription: 'Enjoy the perfect blend of outdoor adventure and indoor comfort in our deluxe glamping pods with private bathrooms and luxury amenities.',
    inclusions: ['All Meals', 'Private Bathroom', 'Wi-Fi', 'Adventure Kit', 'Sunset Tour'],
    exclusions: ['Alcohol', 'Transportation', 'Laundry', 'Personal Shopping'],
    gallery: [
      'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  },
  {
    id: 'heritage-cottage-1',
    name: 'Heritage Hill Cottage',
    type: 'cottage',
    location: 'pune',
    price: 5500,
    image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Charming cottage with traditional architecture and modern comfort',
    fullDescription: 'Stay in our beautifully restored heritage cottage featuring traditional architecture combined with modern amenities for a comfortable stay.',
    inclusions: ['Breakfast', 'Heritage Tour', 'Wi-Fi', 'Garden Access', 'Parking'],
    exclusions: ['Other Meals', 'Transportation', 'Spa Services', 'Adventure Activities'],
    gallery: [
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1570076/pexels-photo-1570076.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  }
];

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

export const galleryImages = [
  'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1749644/pexels-photo-1749644.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2089717/pexels-photo-2089717.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600'
];