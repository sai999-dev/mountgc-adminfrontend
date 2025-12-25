import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, Shield, Clock, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import OtpInput from "./OtpInput";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('kasaramvamshi7143@gmail.com');
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [otpKey, setOtpKey] = useState(0); // Key to reset OTP input

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mountgc-backend.onrender.com/api';

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 'otp') {
      setCanResend(true);
    }
  }, [countdown, step]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin-auth/request-otp`, {
        email: email.trim()
      });

      if (response.data.success) {
        toast.success('OTP sent to your email! 📧');
        setStep('otp');
        setCountdown(60); // 60 seconds cooldown
        setCanResend(false);
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setLoading(true);
    setOtpValue(otp);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin-auth/verify-otp`, {
        email: email.trim(),
        otp: otp
      });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;

        // Store token and user data
        localStorage.setItem("adminToken", accessToken);
        localStorage.setItem("adminUser", JSON.stringify({
          email: user.email,
          role: user.role
        }));

        toast.success("Welcome back, Admin! 🎉");
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
      setOtpValue(''); // Reset OTP
      setOtpKey(prev => prev + 1); // Force OTP input to reset
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    await handleRequestOtp({ preventDefault: () => {} });
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpValue('');
    setCountdown(0);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 px-4">
      <Toaster position="top-center" />

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-16 h-16 flex items-center justify-center rounded-full shadow-lg">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            {step === 'email' ? 'Secure OTP Login' : 'Enter Verification Code'}
          </p>
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">
              <p className="text-sm text-green-800 font-semibold">📧 Email-Based Authentication</p>
              <p className="text-xs text-green-700 mt-1">
                Enter your admin email to receive a 6-digit OTP code
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-gray-50 text-gray-900 pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2" size={20} />
                  Send OTP Code
                </>
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <p className="text-sm text-green-800 font-semibold">✅ OTP Sent Successfully!</p>
              <p className="text-xs text-green-700 mt-1">
                Check your email: <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-4 text-gray-700 text-center">
                Enter 6-Digit OTP Code
              </label>
              <OtpInput
                key={otpKey}
                onChange={handleVerifyOtp}
                disabled={loading}
                error={false}
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Verifying...</span>
              </div>
            )}

            {/* Countdown & Resend */}
            <div className="text-center space-y-3">
              {countdown > 0 ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">
                    Resend OTP in <strong>{countdown}s</strong>
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading || !canResend}
                  className="text-green-600 hover:text-green-700 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP Code
                </button>
              )}

              <button
                onClick={handleBackToEmail}
                disabled={loading}
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-sm mx-auto disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Change Email Address
              </button>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-xs text-yellow-800">
                <strong>⏱️ OTP expires in 10 minutes</strong><br />
                Maximum 3 verification attempts allowed
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Shield size={14} />
            Secure Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
