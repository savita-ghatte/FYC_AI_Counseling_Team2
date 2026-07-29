import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../utils/api';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email link.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.post('/auth/verify-email', { token });
        if (response.data.status === 'success') {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now login.');
        } else {
          setStatus('error');
          setMessage('Verification failed. The link might be invalid or expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center"
      >
        <div className="flex flex-col items-center justify-center mb-6">
          {status === 'loading' && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 text-indigo-400 mb-4" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <XCircle className="w-16 h-16 text-red-400 mb-4" />
            </motion.div>
          )}
          <h2 className="text-2xl font-bold text-white mb-2">Email Verification</h2>
          <p className="text-slate-300 text-sm">
            {message}
          </p>
        </div>

        {status !== 'loading' && (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 group mt-8"
          >
            Go to Login
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </motion.div>
    </div>
  );
};
