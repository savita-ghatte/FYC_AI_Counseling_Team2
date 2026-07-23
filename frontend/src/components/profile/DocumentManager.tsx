import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const DocumentManager = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  const handleUpload = async (file: File) => {
    setError('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only PDF and Image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    try {
      setUploading(true);
      await api.post('/documents/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <FileText className="text-indigo-600" /> Document Vault
      </h2>

      {/* Drag & Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload size={32} className="mx-auto text-slate-400 mb-3" />
        <p className="text-slate-600 font-medium mb-1">Drag and drop your file here</p>
        <p className="text-slate-400 text-sm mb-4">Support for PDF, JPG, PNG up to 5MB</p>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Browse Files'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm mb-6">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* Document List */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Uploaded Documents</h3>
        {documents.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">{doc.fileName}</h4>
                    <p className="text-xs text-slate-500 capitalize">{doc.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.status === 'verified' ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending Review</span>
                  )}
                  {/* PDF Preview Link */}
                  <a
                    href={doc.fileUrl.startsWith('http') ? doc.fileUrl : doc.fileUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    title="View Document"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
