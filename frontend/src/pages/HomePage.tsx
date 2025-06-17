import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, MessageCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="w-8 h-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900">TimeLoop</h1>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="btn-secondary"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            A Social Journal
            <span className="text-primary-500"> Across Time</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create time capsules, send messages to your future self, and preserve memories 
            that unlock at the perfect moment. TimeLoop helps you grow, reflect, and connect 
            with yourself and loved ones across time.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="btn-primary text-lg px-8 py-3"
          >
            Start Your Journey
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="card text-center">
            <Calendar className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Time Capsules</h3>
            <p className="text-gray-600">
              Write messages that unlock in the future. Perfect for goals, memories, and personal growth.
            </p>
          </div>
          
          <div className="card text-center">
            <MessageCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Future Mail</h3>
            <p className="text-gray-600">
              Send scheduled messages to loved ones for special occasions and milestones.
            </p>
          </div>
          
          <div className="card text-center">
            <Clock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
            <p className="text-gray-600">
              Set goals with future review dates and track your progress over time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;