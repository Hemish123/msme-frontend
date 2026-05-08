import { useState, useEffect, useRef } from 'react';
import { uploadExcel, getUploadStatus, getUploadHistory } from '../api/uploadAPI';
import Navbar from '../components/common/Navbar';
import ExcelUploader from '../components/upload/ExcelUploader';
import UploadProgress from '../components/upload/UploadProgress';
import { formatRelativeDate } from '../utils/formatters';
import { FileSpreadsheet, CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);
  const pollRef = useRef(null);

  useEffect(() => { loadHistory(); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  const loadHistory = async () => { const { data } = await getUploadHistory(); if (data?.data) setHistory(data.data); };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    const { data, error } = await uploadExcel(formData);
    if (error) { toast.error(error); setUploading(false); return; }
    const upload = data.data;
    setCurrentUpload(upload);
    setUploading(false);
    toast.success('Upload started! Processing...');
    pollRef.current = setInterval(async () => {
      const { data: statusData } = await getUploadStatus(upload.id);
      if (statusData?.data) {
        setCurrentUpload(statusData.data);
        if (statusData.data.upload_status === 'DONE' || statusData.data.upload_status === 'FAILED') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          loadHistory();
          if (statusData.data.upload_status === 'DONE') toast.success(`Processing complete! ${statusData.data.processed_rows} records imported.`);
          else toast.error('Processing failed.');
        }
      }
    }, 2000);
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'DONE': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'PROCESSING': return <Clock className="w-5 h-5 text-amber-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Upload Data" />
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="animate-slide-up">
          <h2 className="font-sora text-lg font-semibold text-slate-800 mb-4">Upload Excel File</h2>
          <ExcelUploader onFileSelect={setSelectedFile} selectedFile={selectedFile}
            onClear={() => { setSelectedFile(null); setCurrentUpload(null); }} />
          {selectedFile && !currentUpload && (
            <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full mt-4 py-3">
              {uploading ? 'Uploading...' : 'Start Processing'}
            </button>
          )}
        </div>

        {currentUpload && (
          <div className="animate-fade-in">
            <UploadProgress status={currentUpload.upload_status} totalRows={currentUpload.total_rows}
              processedRows={currentUpload.processed_rows} errorMessage={currentUpload.error_message} />
          </div>
        )}

        {currentUpload?.upload_status === 'DONE' && (
          <div className="glass-card p-6 border border-emerald-200 animate-slide-up">
            <h3 className="font-semibold text-emerald-600 mb-3">✅ Processing Complete</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400">File</p><p className="text-sm text-slate-700">{currentUpload.original_filename}</p></div>
              <div><p className="text-xs text-slate-400">Total Rows</p><p className="text-sm text-slate-700">{currentUpload.total_rows}</p></div>
              <div><p className="text-xs text-slate-400">Processed</p><p className="text-sm text-slate-700">{currentUpload.processed_rows}</p></div>
              <div><p className="text-xs text-slate-400">Status</p><p className="text-sm text-emerald-600">Done</p></div>
            </div>
          </div>
        )}

        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="font-sora text-lg font-semibold text-slate-800 mb-4">Upload History</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="glass-card p-4 flex items-center gap-4">
                <FileSpreadsheet className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{h.original_filename}</p>
                  <p className="text-xs text-slate-400">{formatRelativeDate(h.created_at)} · {h.processed_rows}/{h.total_rows} rows</p>
                </div>
                {statusIcon(h.upload_status)}
              </div>
            ))}
            {!history.length && (
              <div className="glass-card p-8 text-center">
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No uploads yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
