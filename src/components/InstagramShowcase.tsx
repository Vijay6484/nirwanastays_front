import React, { useState, useRef, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, Share, Play, ChevronLeft, ChevronRight } from 'lucide-react';

// Replace with your own Instagram Graph API access token
const ACCESS_TOKEN = 'IGAAKslcCRoUJBZAE80SFdEbm52YUt3aERqeFVqaC1EbjlWSFMwSVpyQmh0OWV2Yjg3TmVXUWVudUJtVnR2UU9VNUVSODZArTGVQckRJZA3dlTS1tUUZA1NC10czNpenBXNldOSlBhd05NTmkza1Q3SHQ1Q2NsaXFkS3ZASY2M2U2VOTQZDZD';

export function InstagramShowcase() {
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchInstagramPosts() {
      try {
        const fields = 'id,media_type,media_url,thumbnail_url,caption,timestamp,permalink';
        const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${ACCESS_TOKEN}&limit=6`;
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data.data)) {
          setPosts(data.data);
        } else {
          setPosts([]);
          console.error('Instagram API error:', data);
        }
      } catch (err) {
        setPosts([]);
        console.error('Failed to fetch Instagram posts', err);
      }
    }
    fetchInstagramPosts();
  }, []);

  const toggleLike = (postId: string) => {
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
    setCurrentSlide(prev => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + posts.length) % posts.length);
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
          {posts.map((post, index) => (
            <InstagramPost
              key={post.id}
              post={{
                ...post,
                image: post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url,
                type: post.media_type.toLowerCase(),
                likes: 0, // Instagram Graph API does not provide like count for Basic Display API
                comments: 0, // nor comments count
                timeAgo: post.timestamp ? new Date(post.timestamp).toLocaleDateString() : '',
              }}
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
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="w-full flex-shrink-0 px-4"
                style={{ scrollSnapAlign: 'start' }}
              >
                <InstagramPost
                  post={{
                    ...post,
                    image: post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url,
                    type: post.media_type.toLowerCase(),
                    likes: 0,
                    comments: 0,
                    timeAgo: post.timestamp ? new Date(post.timestamp).toLocaleDateString() : '',
                  }}
                  index={index}
                  likedPosts={likedPosts}
                  toggleLike={toggleLike}
                />
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {posts.map((_, index) => (
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
  likedPosts: Set<string>; 
  toggleLike: (id: string) => void; 
}) {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Post Image/Video */}
     <div className="relative aspect-square overflow-hidden group">
  {post.type === 'video' ? (
    <video
      src={post.media_url}
      poster={post.thumbnail_url || post.image}
      controls
      className="w-full h-full object-cover bg-black rounded-2xl"
      style={{ borderRadius: '1.5rem' }}
    />
  ) : (
    <img
      src={post.image}
      alt={`Instagram post ${post.id}`}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
  )}

  {/* Instagram-style gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
            <p className="text-xs text-gray-500">{post.timeAgo}</p>
          </div>
        </div>

        {/* Caption - smaller text */}
        {/* <p className="text-gray-600 text-xs mb-2 leading-relaxed">{post.caption}</p> */}

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
              <span className="text-xs font-medium text-gray-600">
                {likedPosts.has(post.id) ? post.likes + 1 : post.likes}
              </span>
            </button>
            
            <button className="flex items-center space-x-2 group">
              <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs font-medium text-gray-600">{post.comments}</span>
            </button>
            
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Share className="w-6 h-6 text-gray-600 group-hover:text-emerald-500 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}