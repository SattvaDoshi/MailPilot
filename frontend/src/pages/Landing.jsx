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
  Target,
  TrendingUp,
  Clock,
  Award,
  Rocket,
  Menu,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp > currentTime) {
        toast.loading("Redirecting to Dashboard...")
        setTimeout(() => {
          window.location.href = '/app/dashboard'
        }, 1500)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Invalid token format:', error)
      localStorage.removeItem('token')
    }
  }

  const features = [
    {
      icon: Mail,
      title: 'Advanced Email Automation',
      description: 'Create sophisticated email marketing campaigns with advanced automation workflows and drip sequences.',
      stats: '500K+ emails sent daily'
    },
    {
      icon: Users,
      title: 'Smart Contact Management',
      description: 'Organize and segment your email subscribers with intelligent contact management and CSV import tools.',
      stats: '99.9% data accuracy'
    },
    {
      icon: Sparkles,
      title: 'AI Email Template Generator',
      description: 'Generate high-converting email templates instantly using our advanced AI email marketing technology.',
      stats: '10x faster template creation'
    },
    {
      icon: BarChart3,
      title: 'Real-time Email Analytics',
      description: 'Track email campaign performance with comprehensive analytics, open rates, and conversion tracking.',
      stats: '95% deliverability rate'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with two-factor authentication, encrypted email storage, and GDPR compliance.',
      stats: 'SOC 2 Type II certified'
    },
    {
      icon: Target,
      title: 'Custom SMTP Integration',
      description: 'Integrate your own SMTP servers for better email deliverability and brand reputation management.',
      stats: '40% better deliverability'
    }
  ]

  const plans = [
    {
      name: 'Starter',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for email marketing beginners',
      features: [
        '50 bulk emails per month',
        '3 contact groups',
        'Basic email templates',
        'Email campaign analytics',
        'Email support'
      ],
      buttonText: 'Start Free Email Marketing',
      popular: false
    },
    {
      name: 'Professional',
      price: '₹299',
      period: 'per month',
      originalPrice: '₹499',
      description: 'Ideal for small business email marketing',
      features: [
        '2,000 emails per month',
        '10 contact groups',
        'AI email template generator',
        'Advanced email analytics',
        'Email automation workflows',
        'Priority email support'
      ],
      buttonText: 'Upgrade to Professional',
      popular: true
    },
    {
      name: 'Business',
      price: '₹599',
      period: 'per month',
      originalPrice: '₹899',
      description: 'Perfect for growing email marketing teams',
      features: [
        '10,000 emails per month',
        '25 contact groups',
        'Advanced email segmentation',
        'Custom SMTP configuration',
        'A/B email testing',
        'Email deliverability tools',
        'Phone & chat support'
      ],
      buttonText: 'Choose Business Plan',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large-scale email marketing operations',
      features: [
        'Unlimited email campaigns',
        'Unlimited contact management',
        'White-label email platform',
        'Dedicated email infrastructure',
        'Custom email integrations',
        'Dedicated account manager',
        '24/7 priority support'
      ],
      buttonText: 'Contact Sales Team',
      popular: false
    }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Digital Marketing Manager',
      company: 'TechNova Solutions',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b976?w=80&h=80&fit=crop&crop=face',
      quote: 'MailPilot revolutionized our email marketing strategy. The AI-powered templates increased our email engagement by 250% and saved us 15 hours per week.',
      rating: 5,
      results: '250% engagement increase'
    },
    {
      name: 'Rajesh Kumar',
      role: 'E-commerce Founder',
      company: 'ShopKart India',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      quote: 'Simple yet powerful email marketing platform. Our email conversion rates jumped from 2.1% to 8.3% within 60 days of using MailPilot\'s advanced segmentation.',
      rating: 5,
      results: '8.3% conversion rate'
    },
    {
      name: 'Anita Desai',
      role: 'SaaS Marketing Head',
      company: 'CloudFlow Technologies',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      quote: 'The best email marketing automation platform we\'ve used. Customer support is exceptional, and the analytics provide actionable insights for our campaigns.',
      rating: 5,
      results: '99.2% uptime achieved'
    }
  ]

  const stats = [
    { number: '500K+', label: 'Emails Delivered Daily', icon: Mail },
    { number: '15,000+', label: 'Active Email Marketers', icon: Users },
    { number: '98.5%', label: 'Email Deliverability Rate', icon: TrendingUp },
    { number: '24/7', label: 'Customer Support', icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-lg border-b border-blue-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-xl">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                MailPilot
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium border border-blue-200">
                Email Marketing Platform
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Email Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Email Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Success Stories</a>
              <a href="#" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Email API</a>
              <Link to="/login" className="text-slate-600 hover:text-blue-700 font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-500">
                Start Email Marketing
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-blue-700 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-blue-100 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-slate-600 hover:text-blue-700 font-medium py-2">Email Features</a>
              <a href="#pricing" className="block text-slate-600 hover:text-blue-700 font-medium py-2">Email Pricing</a>
              <a href="#testimonials" className="block text-slate-600 hover:text-blue-700 font-medium py-2">Success Stories</a>
              <Link to="/login" className="block text-slate-600 hover:text-blue-700 font-medium py-2">Login</Link>
              <Link to="/register" className="block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-4 py-3 rounded-xl text-center border border-blue-500">
                Start Email Marketing
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-100/60"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
              <Rocket className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-medium text-sm">
                #1 Email Marketing Platform in India
              </span>
              <Award className="h-4 w-4 text-blue-600" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-slate-900">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Email Marketing
              </span>
              <br />
              <span className="text-slate-900">
                with AI Power
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create high-converting email campaigns, automate customer journeys, and grow your business with our 
              <span className="font-semibold text-blue-700"> AI-powered email marketing platform</span> trusted by 15,000+ marketers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                to="/register" 
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center border border-blue-500"
              >
                Start Free Email Marketing
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group bg-white hover:bg-blue-50 text-blue-700 font-bold text-lg px-10 py-4 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Watch Email Demo
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                50 Free Emails Monthly
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                Setup in 2 Minutes
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                    <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              Email Marketing Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Successful Email Campaigns
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful email marketing tools designed to help you create, send, and optimize 
              high-converting email campaigns that drive real business results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-200">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="inline-flex items-center text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {feature.stats}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              Email Marketing Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Choose Your Perfect
              <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Email Marketing Plan
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Flexible email marketing pricing that grows with your business. Start free and upgrade 
              when you're ready to scale your email campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 ${
                  plan.popular 
                    ? 'border-blue-500 scale-105 bg-gradient-to-b from-white to-blue-50 ring-4 ring-blue-200/50' 
                    : 'border-blue-100 hover:scale-105 hover:border-blue-200'
                }`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 text-sm font-bold rounded-full shadow-lg border-2 border-white">
                        🏆 Best Value
                      </div>
                    </div>
                    
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                      Popular
                    </div>
                  </>
                )}

                <div className={`text-center mb-8 ${plan.popular ? 'mt-4' : ''}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                  
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-lg text-slate-400 line-through">{plan.originalPrice}</span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full border border-blue-200">
                          Save 40%
                        </span>
                      </div>
                    )}
                    <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                    {plan.period !== 'pricing' && (
                      <span className="text-slate-500 ml-1">/{plan.period}</span>
                    )}
                  </div>
                  
                  <p className="text-slate-600 font-medium">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-center block transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-blue-500'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-slate-600 mb-6">
              All plans include our core email marketing features with 99.9% uptime guarantee
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-600 mr-2" />
                SOC 2 Type II Certified
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-blue-600 mr-2" />
                GDPR Compliant
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-600 mr-2" />
                99.9% Uptime SLA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              Customer Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Trusted by Leading
              <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Email Marketing Teams
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how businesses like yours are achieving exceptional email marketing results 
              with MailPilot's advanced email automation platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-blue-500 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-600">5.0/5</span>
                </div>
                
                <blockquote className="text-slate-700 mb-8 text-lg leading-relaxed italic">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name} - Email Marketing Success`}
                      className="w-14 h-14 rounded-full mr-4 border-2 border-blue-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-slate-600 text-sm">
                        {testimonial.role}
                      </p>
                      <p className="text-blue-600 text-sm font-semibold">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                      {testimonial.results}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
            <Crown className="h-5 w-5 text-blue-200" />
            <span className="text-white font-semibold">
              Join 15,000+ Successful Email Marketers
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Revolutionize Your
            <span className="block text-blue-200">Email Marketing?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses already using MailPilot to create powerful email campaigns, 
            automate customer journeys, and drive exceptional ROI from email marketing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link 
              to="/register" 
              className="group bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center border border-white"
            >
              Start Free Email Marketing
              <Rocket className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
            >
              Access Email Dashboard
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-200 mr-2" />
              Free Forever Plan Available
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-200 mr-2" />
              No Setup Fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-200 mr-2" />
              Cancel Anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-xl">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">MailPilot</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                The ultimate email marketing automation platform for businesses of all sizes. 
                Create, send, and optimize high-converting email campaigns with AI-powered tools.
              </p>
              <div className="flex space-x-4">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-2xl font-bold text-blue-400">15K+</span>
                  <p className="text-slate-400 text-sm">Active Users</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-2xl font-bold text-blue-400">98.5%</span>
                  <p className="text-slate-400 text-sm">Deliverability</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-blue-400">Email Marketing</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Email Automation</a></li>
                <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Email Templates</a></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Email Analytics</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Email API</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">SMTP Integration</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-blue-400">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About MailPilot</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Email Marketing Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Career Opportunities</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Partner Program</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-blue-400">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Email Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 mb-4 md:mb-0">
                &copy; 2025 MailPilot - Advanced Email Marketing Platform. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-slate-400 text-sm">
                <span>🇮🇳 Made in India</span>
                <span>🔒 SOC 2 Certified</span>
                <span>📧 99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
