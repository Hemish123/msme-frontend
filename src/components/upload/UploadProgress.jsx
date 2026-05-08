import { CheckCircle2, Loader2, XCircle, FileSearch, Database, Brain, Save } from 'lucide-react';

const stages = [
  { key: 'upload', label: 'Uploading', icon: Loader2 },
  { key: 'reading', label: 'Reading columns', icon: FileSearch },
  { key: 'extracting', label: 'AI extracting', icon: Brain },
  { key: 'saving', label: 'Saving records', icon: Database },
  { key: 'done', label: 'Done', icon: Save },
];

const getStageIndex = (status) => {
  switch (status) {
    case 'PENDING': return 0;
    case 'PROCESSING': return 2;
    case 'DONE': return 4;
    case 'FAILED': return -1;
    default: return 0;
  }
};

export default function UploadProgress({ status, totalRows = 0, processedRows = 0, errorMessage = '' }) {
  const currentStage = getStageIndex(status);
  const progressPercent = totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0;

  if (status === 'FAILED') {
    return (
      <div className="glass-card p-6 border border-rose-200">
        <div className="flex items-center gap-3 mb-3">
          <XCircle className="w-6 h-6 text-rose-500" />
          <h3 className="text-lg font-semibold text-rose-600">Processing Failed</h3>
        </div>
        <p className="text-sm text-slate-500">{errorMessage || 'An error occurred while processing the file.'}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Processing progress</span>
          <span className="text-brand-600 font-medium">{status === 'DONE' ? '100%' : `${progressPercent}%`}</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${status === 'DONE' ? 100 : progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = i === currentStage;
          const isComplete = i < currentStage || status === 'DONE';

          return (
            <div key={stage.key} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${isComplete ? 'bg-brand-100' : isActive ? 'bg-brand-50' : 'bg-slate-50'}`}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                ) : isActive ? (
                  <Icon className="w-4 h-4 text-brand-500 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <span className={`text-[10px] text-center ${isComplete || isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {(totalRows > 0 || status === 'DONE') && (
        <div className="flex gap-4 pt-2 border-t border-slate-100">
          <div className="text-center">
            <p className="text-lg font-bold text-brand-600">{totalRows}</p>
            <p className="text-xs text-slate-400">Total rows</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-accent-600">{processedRows}</p>
            <p className="text-xs text-slate-400">Processed</p>
          </div>
        </div>
      )}
    </div>
  );
}
