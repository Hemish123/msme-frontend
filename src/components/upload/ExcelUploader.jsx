import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

export default function ExcelUploader({ onFileSelect, selectedFile, onClear }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (selectedFile) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-brand-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={onClear} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`glass-card p-12 text-center cursor-pointer transition-all duration-300
        border-2 border-dashed
        ${isDragActive
          ? 'border-brand-400 bg-brand-50/50 scale-[1.01] shadow-glow'
          : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
          ${isDragActive ? 'bg-brand-100' : 'bg-slate-50'}`}>
          <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-500' : 'text-slate-400'}`} />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">
            {isDragActive ? 'Drop your file here' : 'Drag & drop your Excel file'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            or <span className="text-brand-500 hover:underline">browse files</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['.xlsx', '.xls', '.csv'].map((ext) => (
            <span key={ext} className="px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-500 border border-slate-100 font-medium">
              {ext}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400">Max file size: 10MB</p>
      </div>
    </div>
  );
}
