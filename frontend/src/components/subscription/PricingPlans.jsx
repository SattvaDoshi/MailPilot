import React from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Check, Sparkles, Crown, Zap } from 'lucide-react'
import { subscriptionsAPI } from '../../services/subscriptions'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const PricingPlans = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: plansData } = useQuery('subscriptionPlans', subscriptionsAPI.getPlans)
  const { data: currentSubscription } = useQuery('currentSubscription', subscriptionsAPI.getCurrentSubscription)

  const plans = plansData?.data?.data
  const userSubscription = currentSubscription?.data?.data

  const createSubscriptionMutation = useMutation(subscriptionsAPI.createSubscription, {
    onSuccess: (data) => {
      const options = {
        key: data.data.data.key,
        amount: data.data.data.amount,
        currency: data.data.data.currency,
        name: 'Bulk Email Sender',
        description: 'Subscription Payment',
        order_id: data.data.data.orderId,
        handler: function (response) {
          verifyPaymentMutation.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: selectedPlan
          })
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#3b82f6'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create subscription')
    }
  })

  const verifyPaymentMutation = useMutation(subscriptionsAPI.verifyPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries('currentSubscription')
      queryClient.invalidateQueries('userStats')
      toast.success('Payment successful! Your subscription has been activated.')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment verification failed')
    }
  })

  const [selectedPlan, setSelectedPlan] = React.useState('')

  const handleSubscribe = (planType) => {
    setSelectedPlan(planType)
    createSubscriptionMutation.mutate(planType)
  }

  const planConfigs = [
    {
      name: 'Free',
      type: 'free',
      price: 0,
      icon: Sparkles,
      color: 'gray',
      features: [
        '20 emails per month',
        '2 contact groups',
        'Basic templates',
        'Email support'
      ]
    },
    {
      name: 'Basic',
      type: 'basic',
      price: 199,
      icon: Zap,
      color: 'blue',
      popular: false,
      features: [
        '100 emails per month',
        '5 contact groups',
        'AI template generation',
        'Email analytics',
        'Priority support'
      ]
    },
    {
      name: 'Pro',
      type: 'pro',
      price: 399,
      icon: Crown,
      color: 'purple',
      popular: true,
      features: [
        '500 emails per month',
        '10 contact groups',
        'Advanced analytics',
        'Custom SMTP settings',
        'A/B testing',
        'Priority support'
      ]
    },
    {
      name: 'Unlimited',
      type: 'unlimited',
      price: 799,
      icon: Crown,
      color: 'gold',
      features: [
        'Unlimited emails',
        'Unlimited groups',
        'Advanced analytics',
        'Custom SMTP settings',
        'A/B testing',
        'White-label option',
        '24/7 phone support'
      ]
    }
  ]

  const getColorClasses = (color, isActive = false) => {
    const colors = {
      gray: isActive ? 'border-gray-500 bg-gray-50' : 'border-gray-200',
      blue: isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
      purple: isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200',
      gold: isActive ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
    }
    return colors[color] || colors.gray
  }

  const getButtonClasses = (color) => {
    const colors = {
      gray: 'bg-gray-600 hover:bg-gray-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      gold: 'bg-yellow-600 hover:bg-yellow-700'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="mt-2 text-gray-600">Select the perfect plan for your email marketing needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planConfigs.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = userSubscription?.plan === plan.type
          const isActive = isCurrentPlan || (plan.type === 'free' && !userSubscription)

          return (
            <div
              key={plan.type}
              className={`relative rounded-lg border-2 p-6 ${getColorClasses(plan.color, isActive)} ${
                plan.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <Icon className={`mx-auto h-8 w-8 text-${plan.color}-500`} />
                <h3 className="mt-4 text-lg font-medium text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/month</span>}
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isCurrentPlan ? (
                  <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-100 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.type === 'free' ? (
                  <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-100 cursor-not-allowed">
                    Free Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.type)}
                    disabled={createSubscriptionMutation.isLoading}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${getButtonClasses(plan.color)} transition-colors disabled:opacity-50`}
                  >
                    {createSubscriptionMutation.isLoading && selectedPlan === plan.type
                      ? 'Processing...'
                      : 'Subscribe Now'
                    }
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Current Subscription Info */}
      {userSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Current Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Plan: </span>
              <span className="font-medium capitalize">{userSubscription.plan}</span>
            </div>
            <div>
              <span className="text-blue-700">Email Limit: </span>
              <span className="font-medium">
                {userSubscription.emailLimit === -1 ? 'Unlimited' : userSubscription.emailLimit}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Status: </span>
              <span className={`font-medium ${userSubscription.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {userSubscription.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {userSubscription.endDate && (
            <div className="mt-2 text-sm text-blue-700">
              Expires: {new Date(userSubscription.endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PricingPlans
