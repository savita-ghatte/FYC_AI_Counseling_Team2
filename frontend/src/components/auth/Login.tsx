import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, User as UserIcon, Phone, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import * as THREE from 'three';

// 3D Background Component
const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.5}>
      <MeshDistortMaterial
        color="#4f46e5"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaText, setCaptchaText] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/auth/captcha');
      if (res.data.status === 'success') {
        setCaptchaSvg(res.data.data.svg);
        setCaptchaId(res.data.data.id);
        setCaptchaText(''); // Reset text
      }
    } catch (err) {
      console.error('Failed to load captcha', err);
    }
  };

  // Fetch captcha on mount and mode switch
  useEffect(() => {
    if (!isResettingPassword || otpSent) {
      fetchCaptcha();
    }
  }, [isRegister, isResettingPassword, otpSent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isResettingPassword) {
        if (!otpSent) {
          // Request OTP
          const response = await api.post('/auth/forgot-password', { email });
          if (response.data.status === 'success') {
            setSuccess(response.data.message);
            setOtpSent(true);
          }
        } else {
          // Reset Password with OTP
          const response = await api.post('/auth/reset-password', {
            email,
            otp,
            newPassword: password,
          });
          if (response.data.status === 'success') {
            setSuccess('Password reset successfully! Please login with your new password.');
            setIsResettingPassword(false);
            setOtpSent(false);
            setPassword('');
            setOtp('');
          }
        }
      } else if (isRegister) {
        const response = await api.post('/auth/register', {
          fullName,
          email,
          mobileNumber,
          password,
          captchaId,
          captchaText,
          termsAccepted
        });
        if (response.data.status === 'success') {
          setSuccess(response.data.message);
          setIsRegister(false);
          setPassword('');
        }
      } else {
        const response = await api.post('/auth/login', {
          email,
          password,
          captchaId,
          captchaText
        });

        if (response.data.status === 'success') {
          login(response.data.data.accessToken, response.data.data.user, rememberMe);
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
      // Refresh captcha on failure
      if (!isResettingPassword) {
        fetchCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCaptcha = () => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Security Verification</label>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <ShieldCheck className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={captchaText}
            onChange={(e) => setCaptchaText(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter captcha"
            required
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-2">
          {captchaSvg ? (
             <div dangerouslySetInnerHTML={{ __html: captchaSvg }} className="h-10 cursor-pointer" onClick={fetchCaptcha} title="Click to refresh"/>
          ) : (
            <div className="w-24 h-10 flex items-center justify-center text-xs text-slate-400">Loading...</div>
          )}
          <button type="button" onClick={fetchCaptcha} className="p-2 text-slate-600 hover:text-indigo-600 transition-colors" title="Refresh Captcha">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AnimatedSphere />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Floating Glassmorphism Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-indigo-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isResettingPassword ? 'Reset Password' : isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-300 text-sm text-center">
            {isResettingPassword 
              ? (otpSent ? 'Enter the OTP sent to your email and your new password' : 'Enter your email to receive a password reset OTP')
              : isRegister ? 'Sign up to get started' : 'Enter your credentials to access your AI Counsellor dashboard'}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-sm text-center">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isResettingPassword ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              {otpSent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">OTP Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="123456"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                        required={isRegister}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {renderCaptcha()}

              {isRegister && (
                <div className="flex items-center gap-2 mt-4">
                  <input 
                    type="checkbox" 
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all cursor-pointer" 
                    required
                  />
                  <label htmlFor="terms" className="text-xs text-slate-300 cursor-pointer">
                    I accept the <a href="#" className="text-indigo-400 hover:underline">Terms & Conditions</a>
                  </label>
                </div>
              )}

              {!isRegister && (
                <div className="flex justify-between items-center mt-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all cursor-pointer" 
                    />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingPassword(true);
                      setError('');
                      setSuccess('');
                      setShowPassword(false);
                      setOtpSent(false);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || (isRegister && !termsAccepted)}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Processing...' : isResettingPassword ? (otpSent ? 'Change Password' : 'Send OTP') : isRegister ? 'Sign Up' : 'Sign In'}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          {!isResettingPassword && (
            <>
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setSuccess('');
                  setShowPassword(false);
                }} 
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {isRegister ? 'Login here' : 'Register here'}
              </button>
            </>
          )}
          {isResettingPassword && (
            <button 
              type="button"
              onClick={() => {
                setIsResettingPassword(false);
                setShowPassword(false);
                setOtpSent(false);
              }} 
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
