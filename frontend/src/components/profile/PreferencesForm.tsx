import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../utils/api';
import { Edit2, Trash2 } from 'lucide-react';

type PreferencesData = {
  preferredState: string;
  budgetMax: number | null;
  hostelRequirement: boolean;
};

export const PreferencesForm = () => {
  const { register, handleSubmit, reset } = useForm<PreferencesData>();
  const [branches, setBranches] = useState<string[]>([]);
  const [branchInput, setBranchInput] = useState('');
  
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState<(PreferencesData & { preferredBranches: string[] }) | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/student/profile');
        if (response.data.status === 'success' && response.data.data.profile) {
          const p = response.data.data.profile;
          
          if (p.preferredBranches && p.preferredBranches.length > 0) {
            const dataToSet = {
              preferredState: p.preferredState || '',
              budgetMax: p.budgetMax || null,
              hostelRequirement: p.hostelRequirement || false,
            };
            setBranches(p.preferredBranches);
            setSavedData({ ...dataToSet, preferredBranches: p.preferredBranches });
            reset(dataToSet);
            setIsEditing(false); // Has data, show view mode
          } else {
            setIsEditing(true); // No data, show edit mode
          }
        }
      } catch (error) {
        console.error('Failed to fetch preferences', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleAddBranch = () => {
    if (branchInput.trim() && !branches.includes(branchInput.trim())) {
      setBranches([...branches, branchInput.trim()]);
      setBranchInput('');
    }
  };

  const handleRemoveBranch = (branchToRemove: string) => {
    setBranches(branches.filter(b => b !== branchToRemove));
  };

  const onSubmit = async (_data: PreferencesData) => {
    try {
      setLoading(true);
      const payload = {
        ..._data,
        preferredBranches: branches
      };
      await api.put('/student/profile', payload);
      setSavedData(payload);
      setIsEditing(false);
      alert('Preferences updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your preferences?')) return;
    
    try {
      setLoading(true);
      const emptyData = {
        preferredBranches: [],
        preferredState: null,
        budgetMax: null,
        hostelRequirement: false
      };
      
      await api.put('/student/profile', emptyData);
      setSavedData(null);
      setBranches([]);
      reset({
        preferredState: '',
        budgetMax: null,
        hostelRequirement: false
      });
      setIsEditing(true);
      alert('Preferences deleted successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to delete preferences');
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
        <h2 className="text-xl font-bold text-slate-800">College Preferences</h2>
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
        <div className="space-y-6">
          <div>
            <p className="text-slate-500 text-sm mb-2 font-medium">Preferred Branches / Specializations</p>
            <div className="flex flex-wrap gap-2">
              {savedData.preferredBranches.map((branch, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                  {branch}
                </span>
              ))}
              {savedData.preferredBranches.length === 0 && (
                <span className="text-sm text-slate-400 italic">No branches specified</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm pt-2">
            <div>
              <p className="text-slate-500 mb-1">Preferred State for College</p>
              <p className="font-medium text-slate-900">{savedData.preferredState || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Maximum Total Budget</p>
              <p className="font-medium text-slate-900">{savedData.budgetMax ? `₹${savedData.budgetMax.toLocaleString()}` : '-'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Hostel Accommodation</p>
              <p className="font-medium text-slate-900">{savedData.hostelRequirement ? 'Required' : 'Not Required'}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Branches / Specializations</label>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBranch())}
                  className="input-field" 
                  placeholder="e.g. Computer Science, Electronics" 
                />
                <button 
                  type="button" 
                  onClick={handleAddBranch}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {branches.map((branch, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                    {branch}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBranch(branch)}
                      className="w-4 h-4 rounded-full hover:bg-indigo-200 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {branches.length === 0 && (
                  <span className="text-sm text-slate-400 italic">No branches added yet</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred State for College</label>
              <input 
                {...register('preferredState')} 
                className="input-field" 
                placeholder="e.g. Karnataka" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Total Budget (₹)</label>
              <input 
                type="number"
                {...register('budgetMax', { valueAsNumber: true })} 
                className="input-field" 
                placeholder="e.g. 1500000" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input 
              type="checkbox" 
              id="hostelRequirement" 
              {...register('hostelRequirement')} 
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="hostelRequirement" className="text-sm font-medium text-slate-700">
              I require Hostel Accommodation
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 gap-3 mt-6">
            {savedData && (
              <button 
                type="button" 
                onClick={() => {
                  reset(savedData);
                  setBranches(savedData.preferredBranches);
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
