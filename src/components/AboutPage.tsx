import React from "react";
import {
  ArrowLeft,
  TreePine,
  Users,
  Award,
  Heart,
  MapPin,
  Phone,
  Mail,
  Star,
  Target,
  Eye,
} from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import LazyImage from "./perf/LazyImage.tsx";

export function AboutPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  const navigate = useNavigate();
  const stats = [
    { icon: Users, number: "2000+", label: "Happy Guests" },
    { icon: Award, number: "50+", label: "Awards Won" },
    { icon: Heart, number: "98%", label: "Satisfaction Rate" },
    { icon: Star, number: "4.9", label: "Average Rating" },
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image:
        "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      description: "Visionary leader with 15+ years in hospitality",
    },
    {
      name: "Priya Sharma",
      role: "Operations Director",
      image:
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      description: "Expert in luxury resort management",
    },
    {
      name: "Amit Patel",
      role: "Experience Manager",
      image:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      description: "Specialist in adventure and outdoor activities",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion for Excellence",
      description:
        "We are committed to delivering exceptional experiences that exceed expectations.",
    },
    {
      icon: TreePine,
      title: "Environmental Responsibility",
      description:
        "Sustainable practices and eco-friendly operations are at the core of everything we do.",
    },
    {
      icon: Users,
      title: "Guest-Centric Approach",
      description:
        "Every decision we make is focused on creating memorable moments for our guests.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navigation
        onNavigate={(section) =>
          section === "home" || section === "accommodations"
            ? navigate("/")
            : section === "gallery"
            ? navigate("/gallery")
            : null
        }
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="About Nirwana Stays"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-700/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            About Nirwana Stays
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto animate-slide-up">
            Where Nature Meets Luxury, Creating Unforgettable Memories Since
            2015
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Born from a passion for nature and hospitality, Nirwana Stays
                  began as a dream to create a sanctuary where guests could
                  disconnect from the chaos of city life and reconnect with the
                  beauty of the natural world.
                </p>
                <p>
                  Located on the pristine shores of Pawna Lake, our resort has
                  grown from a small camping site to a premier destination
                  offering diverse accommodations and experiences. We believe
                  that true luxury lies not just in comfort, but in the memories
                  created and the peace found in nature's embrace.
                </p>
                <p>
                  Today, we continue to evolve while staying true to our core
                  values of sustainability, authenticity, and exceptional guest
                  service. Every sunrise over the lake reminds us why we started
                  this journey.
                </p>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="grid grid-cols-2 gap-6">
                <LazyImage
                  src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Resort view"
                  className="rounded-2xl shadow-lg"
                />
                <LazyImage
                  src="https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Camping experience"
                  className="rounded-2xl shadow-lg mt-8"
                />
                <LazyImage
                  src="https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Water activities"
                  className="rounded-2xl shadow-lg -mt-8"
                />
                <LazyImage
                  src="https://images.pexels.com/photos/1749644/pexels-photo-1749644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Bonfire nights"
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-3xl p-10 shadow-xl animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To provide exceptional hospitality experiences that celebrate
                the beauty of nature while promoting sustainable tourism
                practices. We strive to create a haven where guests can
                rejuvenate their spirits and create lasting memories.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl animate-slide-up">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
                <Eye className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To become the leading eco-luxury resort destination in India,
                setting new standards for sustainable hospitality while
                preserving the natural beauty that makes our location so special
                for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Achievements
            </h2>
            <p className="text-emerald-100 text-lg">
              Numbers that reflect our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-emerald-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 rounded-3xl bg-gradient-to-b from-emerald-50 to-white shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind your unforgettable experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-emerald-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-emerald-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Experience Nirwana?
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            Let us create an unforgettable experience tailored just for you
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Book Your Stay
            </button>
            <a
              href="tel:+919876543210"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
