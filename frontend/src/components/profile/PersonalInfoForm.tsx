import { useForm } from 'react-hook-form';

type PersonalInfoData = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  category: string;
  pwdStatus: boolean;
  familyIncome: number;
  homeState: string;
};

export const PersonalInfoForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoData>();

  const onSubmit = async (_data: PersonalInfoData) => {
    try {
      // In real app, un-comment below
      // await axios.put('/api/student/profile', _data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Personal Information</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              {...register('fullName', { required: 'Name is required' })} 
              className="input-field" 
              placeholder="John Doe" 
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input 
              type="date"
              {...register('dateOfBirth', { required: 'DOB is required' })} 
              className="input-field" 
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select {...register('gender')} className="input-field">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select {...register('category')} className="input-field">
              <option value="">Select Category</option>
              <option value="GEN">General (GEN)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
              <option value="OBC">Other Backward Classes (OBC-NCL)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Home State</label>
            <input 
              {...register('homeState')} 
              className="input-field" 
              placeholder="e.g. Maharashtra" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Family Income (Annual)</label>
            <input 
              type="number"
              {...register('familyIncome', { valueAsNumber: true })} 
              className="input-field" 
              placeholder="e.g. 500000" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
