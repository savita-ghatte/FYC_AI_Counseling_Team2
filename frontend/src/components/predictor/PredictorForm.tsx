import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Settings2, Loader2, Sparkles } from 'lucide-react';

type PredictionInput = {
  examName: string;
  rank: number;
  category: string;
  gender: string;
  homeState: string;
  pwdStatus: boolean;
  preferredBranch?: string;
  budgetMax?: number;
};

export const PredictorForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PredictionInput>({
    defaultValues: { examName: 'JEE', category: 'GEN', gender: 'Male', homeState: 'Maharashtra' }
  });

  const onSubmit = async (data: PredictionInput) => {
    setLoading(true);
    try {
      // Encode input to pass via state or URL
      // In a real app we might POST here, but passing to results page makes sharing easier
      navigate('/predictor/results', { state: { input: data } });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
          <Settings2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Predictor Engine</h2>
          <p className="text-slate-500">Enter your exact details to forecast admission chances</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Examination</label>
            <select {...register('examName')} className="input-field">
              <option value="JEE">JEE Mains</option>
              <option value="MHT-CET">MHT-CET</option>
              <option value="NEET">NEET</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">All India Rank / Score</label>
            <input 
              type="number"
              {...register('rank', { required: 'Rank is required', valueAsNumber: true })}
              className="input-field" 
              placeholder="e.g. 15000"
            />
            {errors.rank && <span className="text-xs text-red-500 mt-1">{errors.rank.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select {...register('category')} className="input-field">
              <option value="GEN">General</option>
              <option value="EWS">EWS</option>
              <option value="OBC">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
            <select {...register('gender')} className="input-field">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Home State</label>
            <select {...register('homeState')} className="input-field">
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Branch (Optional)</label>
            <select {...register('preferredBranch')} className="input-field">
              <option value="">Any Branch</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input 
            type="checkbox" 
            id="pwdStatus" 
            {...register('pwdStatus')} 
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="pwdStatus" className="text-sm font-medium text-slate-700">
            Person with Disability (PwD)
          </label>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto px-8 py-3 text-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Generate Predictions
          </button>
        </div>
      </form>
    </div>
  );
};
