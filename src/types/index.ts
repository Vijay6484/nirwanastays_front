export interface Location {
  id: string;
  name: string;
  image: string;
}

export interface AccommodationType {
  id: string;
  name: string;
  icon: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  image: string;
  description: string;
  fullDescription: string;
  inclusions: string[];
  exclusions: string[];
  gallery: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  avatar: string;
}

export interface BookingData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
}