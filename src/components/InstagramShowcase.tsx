import React, { useState, useRef, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, Share, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export function InstagramShowcase() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const instagramPosts = [
    {
      id: 1,
      type: 'image',
      image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      caption: 'Golden hour magic at Pawna Lake ✨ #NirwanaStays #PawnaLake #GoldenHour',
      likes: 1247,
      comments: 89,
      timeAgo: '2h'
    },
    {
      id: 2,
      type: 'video',
      image: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      caption: 'Cozy camping vibes under the stars 🏕️ #Camping #StarGazing #NatureLovers',
      likes: 892,
      comments: 45,
      timeAgo: '5h'
    },
    {
      id: 3,
      type: 'image',
      image: 'https://images.pexels.com/photos/1749644/pexels-photo-1749644.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      caption: 'Bonfire nights bring people together 🔥 #BonfireNights #Memories #Friends',
      likes: 1456,
      comments: 67,
      timeAgo: '1d'
    },
    {
      id: 4,
      type: 'image',
      image: 'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      caption: 'Adventure awaits on the crystal clear waters 🚣‍♀️ #WaterSports #Adventure #Fun',
      likes: 734,
      comments: 32,
      timeAgo: '2d'
    },
    {
      id: 5,
      type: 'image',
      image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      caption: 'Luxury meets nature in our lakeside villas 🏡 #LuxuryStay #LakesideVilla #Paradise',
      likes: 2103,
      comments: 156,
      timeAgo: '3d'
    },
    {
      id: 6,
      type: 'video',
      image: 'https://images.pexels.com/photos/2089717/pexels-photo-2089717.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      caption: 'BBQ nights with a view that never gets old 🍖 #BBQNight #LakeView #Delicious',
      likes: 967,
      comments: 78,
      timeAgo: '4d'
    }
  ];

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % instagramPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + instagramPosts.length) % instagramPosts.length);
  };

  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentSlide]);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
              Follow Our Journey
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Stay connected with us on Instagram for daily doses of nature, adventure, and unforgettable moments
          </p>
          <a
            href="https://instagram.com/nirwanastays"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Instagram className="w-5 h-5" />
            <span>@nirwanastays</span>
          </a>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {instagramPosts.map((post, index) => (
            <InstagramPost
              key={post.id}
              post={post}
              index={index}
              likedPosts={likedPosts}
              toggleLike={toggleLike}
            />
          ))}
        </div>

        {/* Mobile Slider */}
        <div className="lg:hidden relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Slider Container */}
          <div
            ref={sliderRef}
            className="flex overflow-x-hidden scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {instagramPosts.map((post, index) => (
              <div
                key={post.id}
                className="w-full flex-shrink-0 px-4"
                style={{ scrollSnapAlign: 'start' }}
              >
                <InstagramPost
                  post={post}
                  index={index}
                  likedPosts={likedPosts}
                  toggleLike={toggleLike}
                />
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {instagramPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-pink-500 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Share Your Nirwana Moments</h3>
            <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
              Tag us in your photos and stories for a chance to be featured on our page. 
              Use #NirwanaStays and let the world see your amazing experiences!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://instagram.com/nirwanastays"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Follow Us on Instagram
              </a>
              <button className="bg-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20">
                Share Your Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramPost({ 
  post, 
  index, 
  likedPosts, 
  toggleLike 
}: { 
  post: any; 
  index: number; 
  likedPosts: Set<number>; 
  toggleLike: (id: number) => void; 
}) {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Post Image/Video */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={post.image}
          alt={`Instagram post ${post.id}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        
        {/* Video Play Button */}
        {post.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Instagram-style gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Post Content */}
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">nirwanastays</p>
            <p className="text-sm text-gray-500">{post.timeAgo}</p>
          </div>
        </div>

        {/* Caption */}
        <p className="text-gray-700 mb-4 leading-relaxed">{post.caption}</p>

        {/* Engagement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => toggleLike(post.id)}
              className="flex items-center space-x-2 group"
            >
              <Heart 
                className={`w-6 h-6 transition-all duration-300 ${
                  likedPosts.has(post.id) 
                    ? 'text-red-500 fill-current scale-110' 
                    : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
                }`} 
              />
              <span className="text-sm font-medium text-gray-600">
                {likedPosts.has(post.id) ? post.likes + 1 : post.likes}
              </span>
            </button>
            
            <button className="flex items-center space-x-2 group">
              <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-emerald-500 transition-colors" />
              <span className="text-sm font-medium text-gray-600">{post.comments}</span>
            </button>
            
            <button className="group">
              <Share className="w-6 h-6 text-gray-600 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}