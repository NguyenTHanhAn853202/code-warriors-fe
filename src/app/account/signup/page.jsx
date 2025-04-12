"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear any previous errors for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Only check for empty required fields - backend will handle format validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!formData.repeatPassword) {
      newErrors.repeatPassword = 'Please confirm your password';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must agree to the terms of service';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          repeatPassword: formData.repeatPassword
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setFormData({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
      });
      setTermsAccepted(false);
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        window.location.href = '/account/signin';
      }, 2000);
      
    } catch (error) {
      setErrors({ 
        submit: error.message 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowRepeatPassword(!showRepeatPassword);
    }
  };
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left section with form */}
        <div className="w-full lg:w-1/2 px-8 py-12 flex flex-col justify-center">
          <div className="flex mb-10">
            <div className="relative w-13 h-13">
              <Image 
                src="/logoCode.png" 
                alt="CodeWars Logo"
                width={50}
                height={50}
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">CodeWars</h1>
          </div>
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your Name"
                className={`w-full py-3 pl-10 pr-4 border-b ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </div>
            
            {/* Email input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className={`w-full py-3 pl-10 pr-4 border-b ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            {/* Password input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full py-3 pl-10 pr-12 border-b ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => togglePasswordVisibility('password')}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500 absolute">{errors.password}</p>}
            </div>

            {/* Repeat password input */}
            <div className="relative mt-8">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input 
                type={showRepeatPassword ? "text" : "password"}
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`w-full py-3 pl-10 pr-12 border-b ${errors.repeatPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => togglePasswordVisibility('repeatPassword')}
              >
                {showRepeatPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
              {errors.repeatPassword && <p className="mt-1 text-sm text-red-500 absolute">{errors.repeatPassword}</p>}
            </div>  
            
            {/* Terms checkbox */}
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className={`h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 ${errors.terms ? 'border-red-500' : ''}`}
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                I agree all statements in <Link href="/terms" className="text-blue-600 hover:underline">Terms of service</Link>
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}
            
            {/* Register button and login link in the same row */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="submit"
                disabled={isSubmitting || !termsAccepted}
                className={`w-48 py-3 text-white font-medium rounded-md transition duration-300 ${
                  termsAccepted && !isSubmitting
                    ? 'bg-blue-500 hover:bg-orange-600 cursor-pointer' 
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'loading...' : 'Sign Up'}
              </button>
              
              <Link href="/account/signin" className="text-gray-600 hover:text-gray-800 flex items-center">
                I am already member
                <span className="inline-block ml-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </div>
          </form>
        </div>
        
        {/* Right section with image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="h-full flex items-center justify-center p-8">
            <div className="relative w-full h-full">
              <Image
                src="/itemRegister.jpg"
                fill
                style={{ objectFit: 'cover' }}
                alt="Desk with laptop, plant and chair"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}