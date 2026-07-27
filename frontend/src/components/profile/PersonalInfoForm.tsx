import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../utils/api';
import { Edit2, Trash2 } from 'lucide-react';

type PersonalInfoData = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  category: string;
  pwdStatus: boolean;
  familyIncome: number | null;
  homeState: string;
  domicileState: string;
};

export const PersonalInfoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonalInfoData>();
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState<PersonalInfoData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/student/profile');
        if (response.data.status === 'success' && response.data.data.profile) {
          const p = response.data.data.profile;
          // Format date for input
          const formattedDate = p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '';
          
          if (p.fullName) {
            const dataToSet = {
              fullName: p.fullName,
              gender: p.gender || '',
              dateOfBirth: formattedDate,
              category: p.category || '',
              pwdStatus: p.pwdStatus || false,
              familyIncome: p.familyIncome || null,
              homeState: p.homeState || '',
              domicileState: p.domicileState || ''
            };
            setSavedData(dataToSet);
            reset(dataToSet);
            setIsEditing(false); // Has data, show view mode
          } else {
            setIsEditing(true); // No data, show edit mode
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (_data: PersonalInfoData) => {
    try {
      setLoading(true);
      await api.put('/student/profile', _data);
      setSavedData(_data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your personal information?')) return;
    
    try {
      setLoading(true);
      const emptyData = {
        fullName: null,
        gender: null,
        dateOfBirth: null,
        category: null,
        pwdStatus: false,
        familyIncome: null,
        homeState: null,
        domicileState: null
      };
      // Send null to clear fields
      await api.put('/student/profile', emptyData);
      setSavedData(null);
      reset({
        fullName: '',
        gender: '',
        dateOfBirth: '',
        category: '',
        pwdStatus: false,
        familyIncome: null,
        homeState: '',
        domicileState: ''
      });
      setIsEditing(true);
      alert('Personal information deleted successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to delete personal information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
        {!isEditing && savedData && (
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setIsEditing(true)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <Edit2 size={16} /> Edit
            </button>
            <button 
              type="button"
              onClick={handleDelete} 
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        )}
      </div>
      
      {!isEditing && savedData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Full Name</p>
            <p className="font-medium text-slate-900">{savedData.fullName}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Date of Birth</p>
            <p className="font-medium text-slate-900">{savedData.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Gender</p>
            <p className="font-medium text-slate-900">{savedData.gender}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Category</p>
            <p className="font-medium text-slate-900">{savedData.category}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Home State</p>
            <p className="font-medium text-slate-900">{savedData.homeState || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Domicile State</p>
            <p className="font-medium text-slate-900">{savedData.domicileState || '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Family Income (Annual)</p>
            <p className="font-medium text-slate-900">{savedData.familyIncome ? `₹${savedData.familyIncome.toLocaleString()}` : '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Person with Disability (PwD)</p>
            <p className="font-medium text-slate-900">{savedData.pwdStatus ? 'Yes' : 'No'}</p>
          </div>
        </div>
      ) : (
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Domicile State</label>
              <input 
                {...register('domicileState')} 
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

          <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
            {savedData && (
              <button 
                type="button" 
                onClick={() => {
                  reset(savedData);
                  setIsEditing(false);
                }} 
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
