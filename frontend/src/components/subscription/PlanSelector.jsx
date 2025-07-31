// src/components/subscription/PlanSelector.jsx
import React from 'react';
import { useQuery, useMutation } from 'react-query';
import { Check } from 'lucide-react';
import { subscriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';

import Button from '../ui/Button';

const PlanSelector = () => {
  const { data: plans } = useQuery('plans', subscriptionAPI.getPlans);
  const { data: currentSub } = useQuery('subscription', subscriptionAPI.getStatus);

  const upgradeMutation = useMutation(subscriptionAPI.create, {
    onSuccess: (data) => {
      // Open Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.data.order.amount,
        currency: data.data.order.currency,
        name: 'MailPilot',
        description: `${data.data.order.planType} Plan Subscription`,
        order_id: data.data.order.orderId,
        handler: function (response) {
          // Verify payment
          subscriptionAPI.verify({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            planType: data.data.order.planType
          }).then(() => {
            toast.success('Subscription upgraded successfully!');
            window.location.reload();
          }).catch(() => {
            toast.error('Payment verification failed');
          });
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create subscription');
    },
  });

  const handleUpgrade = (planType) => {
    upgradeMutation.mutate({ planType });
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan for your email marketing needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {plans?.data?.plans?.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">
                  Perfect for {plan.id === 'free' ? 'getting started' : 
                    plan.id === 'basic' ? 'small businesses' :
                    plan.id === 'premium' ? 'growing companies' : 'enterprises'}
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹{plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-base font-medium text-gray-500">
                      /month
                    </span>
                  )}
                </p>
                
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={currentSub?.data?.subscription?.plan === plan.id}
                  className="mt-8 w-full"
                  variant={currentSub?.data?.subscription?.plan === plan.id ? 'outline' : 'primary'}
                >
                  {currentSub?.data?.subscription?.plan === plan.id ? 'Current Plan' : 
                   plan.id === 'free' ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
              
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
