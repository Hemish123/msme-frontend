import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import { bulkUploadCustomers, downloadCustomerTemplate } from '../../api/customerAPI';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, X } from 'lucide-react';

const STEPS = ['Download Template', 'Fill Data', 'Upload File', 'Review & Import'];

export default function BulkUpload() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleDownloadTemplate = async () => {
    const { data, error } = await downloadCustomerTemplate();
    if (data) {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customer_bulk_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded!');
    } else {
      toast.error(error || 'Download failed');
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      toast.error('Only .xlsx or .xls files accepted');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10MB limit');
      return;
    }
    setFile(f);
    setStep(2);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const { data, error } = await bulkUploadCustomers(formData);
    setUploading(false);
    if (error) { toast.error(typeof error === 'string' ? error : 'Upload failed'); }
    else { setResult(data.data || data); setStep(3); }
  };

  const formatSize = (b) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`;

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar title="Bulk Customer Upload" />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#1a2744] text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              {!false && <span className={`ml-1.5 text-xs font-medium hidden sm:inline ${i <= step ? 'text-slate-700' : 'text-slate-400'}`}>{s}</span>}
              {i < STEPS.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-2 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
          {step < 3 && (
            <>
              {/* Download Template */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 1: Download Template</h3>
                <p className="text-sm text-slate-500 mb-3">Download the Excel template, fill in your customer data, and upload it below.</p>
                <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md">
                  <Download className="w-4 h-4" /> Download Customer Template (.xlsx)
                </button>
              </div>

              {/* Upload Zone */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Step 2 & 3: Upload Your File</h3>
                <div
                  onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                    ${dragOver ? 'border-[#1a2744] bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
                >
                  <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 font-medium">Drag & drop your filled Excel file here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse • .xlsx, .xls only • Max 10MB</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={e => handleFile(e.target.files[0])} className="hidden" />
                </div>
              </div>

              {/* Selected file */}
              {file && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
              )}

              {file && (
                <button onClick={handleUpload} disabled={uploading} className="w-full py-3 bg-[#1a2744] text-white rounded-lg font-semibold hover:bg-[#243352] transition-all disabled:opacity-60 shadow-md">
                  {uploading ? 'Uploading & Parsing...' : 'Upload & Preview'}
                </button>
              )}
            </>
          )}

          {step === 3 && result && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Import Results</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl text-center"><p className="text-2xl font-bold text-slate-700">{result.total}</p><p className="text-xs text-slate-500">Total Rows</p></div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-600">{result.imported}</p><p className="text-xs text-emerald-600">Imported</p></div>
                <div className="p-4 bg-rose-50 rounded-xl text-center"><p className="text-2xl font-bold text-rose-600">{result.skipped}</p><p className="text-xs text-rose-600">Skipped</p></div>
              </div>

              {result.preview && result.preview.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl mb-4">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-xs uppercase text-slate-500">
                      <th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th><th className="px-4 py-2 text-left">GST</th>
                      <th className="px-4 py-2 text-left">State</th><th className="px-4 py-2 text-center">Status</th>
                    </tr></thead>
                    <tbody>{result.preview.slice(0, 10).map((r, i) => (
                      <tr key={i} className={`border-t ${r.valid ? '' : 'bg-rose-50/50'}`}>
                        <td className="px-4 py-2">{r.name}</td><td className="px-4 py-2">{r.email}</td>
                        <td className="px-4 py-2">{r.phone}</td><td className="px-4 py-2 font-mono text-xs">{r.gst}</td>
                        <td className="px-4 py-2">{r.state}</td>
                        <td className="px-4 py-2 text-center">{r.valid
                          ? <span className="inline-flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                          : <span className="inline-flex items-center gap-1 text-rose-600 text-xs"><AlertCircle className="w-3.5 h-3.5" /> {r.errors}</span>
                        }</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep(0); setFile(null); setResult(null); }} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Re-upload
                </button>
                <button onClick={() => navigate('/customers')} className="flex-1 py-2.5 rounded-lg bg-[#1a2744] text-white font-semibold hover:bg-[#243352] flex items-center justify-center gap-1.5">
                  View All Customers <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
