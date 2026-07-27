import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../utils/api';
import { Edit2, Trash2 } from 'lucide-react';

type AcademicData = {
  entranceExam: string;
  rank: number | null;
  percentile: number | null;
  marks: number | null;
  board12th: string;
  percentage12th: number | null;
  percentage10th: number | null;
};

export const AcademicForm = () => {
  const { register, handleSubmit, reset } = useForm<AcademicData>();
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState<AcademicData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/student/profile');
        if (response.data.status === 'success' && response.data.data.profile) {
          const p = response.data.data.profile;
          
          let entranceExam = '';
          let rank = null;
          let percentile = null;
          let marks = null;
          
          if (p.examsAppeared && Array.isArray(p.examsAppeared) && p.examsAppeared.length > 0) {
            const exam = p.examsAppeared[0];
            entranceExam = exam.exam || '';
            rank = exam.rank || null;
            percentile = exam.percentile || null;
            marks = exam.marks || null;
          }
          
          if (p.percentage12th || entranceExam) {
            const dataToSet = {
              entranceExam,
              rank,
              percentile,
              marks,
              board12th: p.board12th || '',
              percentage12th: p.percentage12th || null,
              percentage10th: p.percentage10th || null,
            };
            setSavedData(dataToSet);
            reset(dataToSet);
            setIsEditing(false); // Has data, show view mode
          } else {
            setIsEditing(true); // No data, show edit mode
          }
        }
      } catch (error) {
        console.error('Failed to fetch academic profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (_data: AcademicData) => {
    try {
      setLoading(true);
      const examsAppeared = _data.entranceExam ? [{
        exam: _data.entranceExam,
        rank: _data.rank,
        percentile: _data.percentile,
        marks: _data.marks
      }] : [];
      
      const payload = {
        examsAppeared,
        board12th: _data.board12th,
        percentage12th: _data.percentage12th,
        percentage10th: _data.percentage10th
      };

      await api.put('/student/profile', payload);
      setSavedData(_data);
      setIsEditing(false);
      alert('Academic profile updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update academic profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your academic information?')) return;
    
    try {
      setLoading(true);
      const emptyData = {
        examsAppeared: null,
        board12th: null,
        percentage12th: null,
        percentage10th: null
      };
      
      await api.put('/student/profile', emptyData);
      setSavedData(null);
      reset({
        entranceExam: '',
        rank: null,
        percentile: null,
        marks: null,
        board12th: '',
        percentage12th: null,
        percentage10th: null
      });
      setIsEditing(true);
      alert('Academic information deleted successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to delete academic information');
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
        <h2 className="text-xl font-bold text-slate-800">Academic Details</h2>
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
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Entrance Exam</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Exam Name</p>
                <p className="font-medium text-slate-900">{savedData.entranceExam || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Rank</p>
                <p className="font-medium text-slate-900">{savedData.rank || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Percentile</p>
                <p className="font-medium text-slate-900">{savedData.percentile || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Marks</p>
                <p className="font-medium text-slate-900">{savedData.marks || '-'}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Board Exams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
              <div>
                <p className="text-slate-500 mb-1">12th Board Name</p>
                <p className="font-medium text-slate-900">{savedData.board12th || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">12th Percentage</p>
                <p className="font-medium text-slate-900">{savedData.percentage12th ? `${savedData.percentage12th}%` : '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">10th Percentage</p>
                <p className="font-medium text-slate-900">{savedData.percentage10th ? `${savedData.percentage10th}%` : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Entrance Exam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name</label>
              <select {...register('entranceExam')} className="input-field">
                <option value="">Select Exam</option>
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="NEET UG">NEET UG</option>
                <option value="MHT-CET">MHT-CET</option>
                <option value="WBJEE">WBJEE</option>
                <option value="KCET">KCET</option>
                <option value="COMEDK">COMEDK</option>
                <option value="CUET">CUET</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rank</label>
              <input 
                type="number"
                {...register('rank', { valueAsNumber: true })} 
                className="input-field" 
                placeholder="e.g. 15000" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Percentile</label>
              <input 
                type="number"
                step="0.01"
                {...register('percentile', { valueAsNumber: true })} 
                className="input-field" 
                placeholder="e.g. 98.5" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
              <input 
                type="number"
                {...register('marks', { valueAsNumber: true })} 
                className="input-field" 
                placeholder="e.g. 180" 
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mt-8">Board Exams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">12th Board Name</label>
              <input 
                {...register('board12th')} 
                className="input-field" 
                placeholder="e.g. CBSE, State Board" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">12th Percentage</label>
              <input 
                type="number"
                step="0.01"
                {...register('percentage12th', { valueAsNumber: true })} 
                className="input-field" 
                placeholder="e.g. 85.5" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">10th Percentage</label>
              <input 
                type="number"
                step="0.01"
                {...register('percentage10th', { valueAsNumber: true })} 
                className="input-field" 
                placeholder="e.g. 90.0" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 gap-3 mt-6">
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
