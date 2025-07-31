// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  // src/components/auth/RegisterForm.jsx
const onSubmit = async (data) => {
  setLoading(true);
  try {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registrationData } = data;
    
    await registerUser(registrationData); // Send without confirmPassword
    setSuccess(true);
    toast.success('Registration successful! Please check your email to verify your account.');
  } catch (error) {
    toast.error(error.response?.data?.error || 'Registration failed');
  } finally {
    setLoading(false);
  }
};


  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <Mail className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a verification link to your email address. Please click the link to verify your account.
            </p>
            <Link to="/login" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                icon={User}
                {...register('firstName', { required: 'First name is required' })}
                error={errors.firstName?.message}
                placeholder="First name"
              />
              <Input
                label="Last Name"
                icon={User}
                {...register('lastName', { required: 'Last name is required' })}
                error={errors.lastName?.message}
                placeholder="Last name"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
              placeholder="Enter your email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={errors.password?.message}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message}
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
