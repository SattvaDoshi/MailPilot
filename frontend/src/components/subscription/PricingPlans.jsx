import React, { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Check, Sparkles, Crown, Zap, X, RefreshCw, AlertCircle } from 'lucide-react'
import { subscriptionsAPI } from '../../services/subscriptions'
import { useAuth } from '../../contexts/AuthContext'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

const PricingPlans = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const selectedPlanRef = useRef('')

  const { data: plansData } = useQuery('subscriptionPlans', subscriptionsAPI.getPlans)
  const { data: currentSubscription } = useQuery('currentSubscription', subscriptionsAPI.getCurrentSubscription)

  const plans = plansData?.data?.data
  const userSubscription = currentSubscription?.data?.data

  const verifyPaymentMutation = useMutation(subscriptionsAPI.verifySubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('currentSubscription');
      queryClient.invalidateQueries('userStats');
      toast.success('Payment successful! Your subscription has been activated.');
    },
    onError: (error) => {
      console.error('Payment verification failed:', error);
      toast.error(error.response?.data?.message || 'Payment verification failed');
    }
  });

  const createSubscriptionMutation = useMutation(subscriptionsAPI.createSubscription, {
    onSuccess: (data) => {
      const options = {
        key: data.data.data.key,
        subscription_id: data.data.data.subscriptionId,
        name: 'Bulk Email Sender',
        description: `${selectedPlanRef.current.charAt(0).toUpperCase() + selectedPlanRef.current.slice(1)} Plan Subscription`,
        handler: function (response) {
          console.log('✅ Payment Success Response:', response);
          console.log('Using plan for verification:', selectedPlanRef.current);

          verifyPaymentMutation.mutate({
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan: selectedPlanRef.current
          });
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function () {
            console.log('❌ Payment modal dismissed');
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        toast.error('Payment failed: ' + response.error.description);
      });

      rzp.open();
    },
    onError: (error) => {
      console.error('Subscription creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create subscription')
    }
  })

  // ✅ Updated for cancel-then-create logic
  const changeSubscriptionMutation = useMutation(subscriptionsAPI.changeSubscriptionPlan, {
    onSuccess: (data) => {
      console.log('Plan change response (cancel-then-create):', data.data);

      if (data.data.requiresPayment) {
        // ✅ Always requires payment for paid plans after cancellation
        console.log('Opening payment for new plan:', data.data.planType);

        const options = {
          key: data.data.key,
          subscription_id: data.data.subscriptionId,
          name: 'Bulk Email Sender',
          description: `${data.data.planType.charAt(0).toUpperCase() + data.data.planType.slice(1)} Plan - ₹${data.data.amount}/month`,
          handler: function (response) {
            console.log('✅ Payment Success for New Plan:', response);

            // Verify payment for the new subscription
            verifyPaymentMutation.mutate({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: data.data.planType
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email
          },
          theme: {
            color: '#3b82f6'
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled. You remain on the free plan.');
              // Refresh to show free plan state
              queryClient.invalidateQueries('currentSubscription');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('❌ Payment failed:', response.error);
          toast.error(`Payment failed: ${response.error.description}. You remain on the free plan.`);
          queryClient.invalidateQueries('currentSubscription');
        });

        rzp.open();

        // Show immediate feedback about cancellation
        toast.success(`Current plan cancelled. Complete payment to activate ${data.data.planType} plan.`);

        // Refresh UI to show cancelled state
        queryClient.invalidateQueries('currentSubscription');

      } else {
        // ✅ No payment required (free plan)
        queryClient.invalidateQueries('currentSubscription');
        queryClient.invalidateQueries('userStats');
        toast.success(data.data.message || 'Plan changed successfully!');
      }
    },
    onError: (error) => {
      console.error('❌ Plan change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change subscription plan');
    }
  });

  // ✅ Updated confirmation message for cancel-then-create
  const handleChangePlan = (planType) => {
    const planName = planType.charAt(0).toUpperCase() + planType.slice(1);
    const currentPlan = userSubscription?.plan || 'free';

    let confirmMessage;

    if (planType === 'free') {
      confirmMessage = `Cancel current subscription and switch to Free plan?`;
    } else {
      confirmMessage = `Cancel current subscription and switch to ${planName} plan?\n\nNote: Your current plan will be cancelled immediately and you'll need to complete payment for the new plan.`;
    }

    if (window.confirm(confirmMessage)) {
      console.log('Plan change confirmed (cancel-then-create):', { from: currentPlan, to: planType });
      setSelectedPlan(planType);
      selectedPlanRef.current = planType;
      changeSubscriptionMutation.mutate(planType);
    }
  };

  const cancelSubscriptionMutation = useMutation(subscriptionsAPI.cancelSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('currentSubscription');
      toast.success('Subscription cancelled successfully');
      setCancelModalOpen(false);
    },
    onError: (error) => {
      const errorData = error.response?.data;

      if (errorData?.error_type === 'UPI_CANCEL_NOT_ALLOWED') {
        toast.error('UPI subscriptions can only be cancelled from your UPI app (PhonePe, Google Pay, etc.). Please cancel from your UPI app.');
      } else {
        toast.error(errorData?.message || 'Failed to cancel subscription');
      }
    }
  });

  const handleSubscribe = (planType) => {
    setSelectedPlan(planType)
    selectedPlanRef.current = planType
    createSubscriptionMutation.mutate(planType)
  }

  const handleCancelSubscription = (cancelAtCycleEnd) => {
    cancelSubscriptionMutation.mutate({ cancelAtCycleEnd })
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

      {/* ✅ Added Notice About Plan Changes */}
      {userSubscription && userSubscription.plan !== 'free' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-amber-800 font-medium">Plan Change Process</h4>
              <p className="text-amber-700 text-sm mt-1">
                <strong>Note:</strong> When changing plans, your current subscription will be cancelled immediately 
                and you'll need to complete a new payment for the selected plan. This ensures a clean transition 
                and works with all payment methods.
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-100 cursor-not-allowed">
                      Current Plan
                    </button>
                    {plan.type !== 'free' && (
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="w-full py-2 px-4 border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                ) : plan.type === 'free' ? (
                  userSubscription?.plan !== 'free' && (
                    <button
                      onClick={() => handleChangePlan('free')}
                      disabled={changeSubscriptionMutation.isLoading}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {changeSubscriptionMutation.isLoading ? 'Processing...' : 'Switch to Free'}
                    </button>
                  )
                ) : (
                  <div className="space-y-2">
                    {userSubscription?.plan && userSubscription.plan !== 'free' ? (
                      <button
                        onClick={() => handleChangePlan(plan.type)}
                        disabled={changeSubscriptionMutation.isLoading}
                        className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${getButtonClasses(plan.color)} transition-colors disabled:opacity-50 flex items-center justify-center`}
                      >
                        {changeSubscriptionMutation.isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Switch to ${plan.name} - ₹${plan.price}/month`
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.type)}
                        disabled={createSubscriptionMutation.isLoading}
                        className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${getButtonClasses(plan.color)} transition-colors disabled:opacity-50`}
                      >
                        {createSubscriptionMutation.isLoading && selectedPlan === plan.type
                          ? 'Processing...'
                          : `Subscribe to ${plan.name}`
                        }
                      </button>
                    )}
                  </div>
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
              {userSubscription.cancelledAt ?
                `Cancelled on: ${new Date(userSubscription.cancelledAt).toLocaleDateString()}` :
                `Next billing: ${new Date(userSubscription.endDate).toLocaleDateString()}`
              }
            </div>
          )}
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {/* Cancel Subscription Modal */}
<Modal
  isOpen={cancelModalOpen}
  onClose={() => setCancelModalOpen(false)}
  title="Cancel Subscription"
  size="md"
>
  <div className="space-y-4">
    <p className="text-gray-600">
      How would you like to cancel your subscription?
    </p>

    <div className="space-y-3">
      <button
        onClick={() => handleCancelSubscription(false)}
        disabled={cancelSubscriptionMutation.isLoading}
        className="w-full p-4 border border-red-300 rounded-lg text-left hover:bg-red-50"
      >
        <div className="font-medium text-red-900">Cancel Immediately</div>
        <div className="text-sm text-red-600">Your subscription will be cancelled right now</div>
      </button>

      {/* ✅ Fix: Add missing closing </button> tag */}
      <button
        onClick={() => handleCancelSubscription(true)}
        disabled={cancelSubscriptionMutation.isLoading}
        className="w-full p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
      >
        <div className="font-medium text-gray-900">Cancel at Billing Cycle End</div>
        <div className="text-sm text-gray-600">Keep access until your current billing period ends</div>
      </button> {/* ✅ This closing tag was missing */}
    </div>

    <div className="flex justify-end space-x-3 pt-4">
      <button
        onClick={() => setCancelModalOpen(false)}
        className="btn-secondary"
      >
        Keep Subscription
      </button>
    </div>
  </div>
</Modal>

    </div>
  )
}

export default PricingPlans
