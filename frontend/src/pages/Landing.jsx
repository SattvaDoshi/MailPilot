import React from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Users,
  BarChart3,
  Zap,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Sparkles,
  Crown,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'

const Landing = () => {
  const token = localStorage.getItem('token')
  if (token) {
    // Verify token is valid before redirecting
    try {
      // Basic token validation (check if it's not expired/malformed)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp > currentTime) {
        // Token is valid, redirect to dashboard
        toast.loading("Redirecting to Dashboard...")

        setTimeout(() => {
          window.location.href = '/app/dashboard'
        }, 1500) // Give user time to see the message
      } else {
        // Token expired, remove it
        localStorage.removeItem('token')
      }
    } catch (error) {
      // Invalid token format, remove it
      console.error('Invalid token format:', error)
      localStorage.removeItem('token')
    }
  }

  const features = [
    {
      icon: Mail,
      title: 'Bulk Email Campaigns',
      description: 'Send personalized emails to thousands of recipients with our powerful campaign manager.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Contact Management',
      description: 'Organize your contacts into groups and import/export with ease using CSV files.',
      color: 'bg-green-500'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Templates',
      description: 'Generate professional email templates instantly using our AI template generator.',
      color: 'bg-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your campaign performance with detailed analytics and success rates.',
      color: 'bg-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 2FA authentication and encrypted data storage.',
      color: 'bg-red-500'
    },
    {
      icon: Target,
      title: 'Custom SMTP',
      description: 'Use your own SMTP settings for better deliverability and brand consistency.',
      color: 'bg-indigo-500'
    }
  ]

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '20 emails per month',
        '2 contact groups',
        'Basic templates',
        'Email support'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Basic',
      price: '₹199',
      period: 'per month',
      description: 'Great for small businesses',
      features: [
        '100 emails per month',
        '5 contact groups',
        'AI template generation',
        'Email analytics',
        'Priority support'
      ],
      buttonText: 'Start Basic Plan',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹399',
      period: 'per month',
      description: 'Perfect for growing teams',
      features: [
        '500 emails per month',
        '10 contact groups',
        'Advanced analytics',
        'Custom SMTP settings',
        'A/B testing',
        'Priority support'
      ],
      buttonText: 'Go Pro',
      popular: true
    },
    {
      name: 'Unlimited',
      price: '₹799',
      period: 'per month',
      description: 'For enterprise needs',
      features: [
        'Unlimited emails',
        'Unlimited groups',
        'Advanced analytics',
        'Custom SMTP settings',
        'A/B testing',
        'White-label option',
        '24/7 phone support'
      ],
      buttonText: 'Get Unlimited',
      popular: false
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b976?w=64&h=64&fit=crop&crop=face',
      quote: 'MailPilot transformed our email marketing. The AI templates save us hours, and the analytics help us improve constantly.'
    },
    {
      name: 'Raj Patel',
      role: 'Small Business Owner',
      company: 'Patel Enterprises',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      quote: 'Simple, affordable, and powerful. We increased our email engagement by 300% using MailPilot\'s personalization features.'
    },
    {
      name: 'Emily Chen',
      role: 'E-commerce Manager',
      company: 'Fashion Forward',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
      quote: 'The contact management and segmentation features are incredible. Our conversion rates have never been higher.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MailPilot</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
              </div>         
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Send <span className="text-primary-600">Powerful</span> Email Campaigns with{' '}
              <span className="text-primary-600">AI Magic</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, manage, and track email campaigns that convert. With AI-powered templates,
              advanced analytics, and seamless contact management - all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="btn-secondary text-lg px-8 py-3 flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required • 20 free emails</p>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Campaign Dashboard</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Mail className="h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-900">2,547</p>
                    <p className="text-blue-600 text-sm">Emails Sent</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-900">94.2%</p>
                    <p className="text-green-600 text-sm">Success Rate</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-900">1,234</p>
                    <p className="text-purple-600 text-sm">Active Contacts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your email marketing effortless and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your business. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-3 px-4 rounded-lg font-medium text-center block transition-colors ${plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by thousands of businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying about MailPilot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your email marketing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses already using MailPilot to grow their audience and increase sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
              Start Free Trial
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-primary-100 text-sm mt-4">Free forever plan available • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mail className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold">MailPilot</span>
              </div>
              <p className="text-gray-400">
                The ultimate email marketing platform for businesses of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link to="/login" className="hover:text-white">Dashboard</Link></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MailPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
