import React from 'react';
import { Camera, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VerificationPipelineHeaderProps {
  currentStep: 'upload' | 'search' | 'blockchain';
  isImageUploaded: boolean;
}

export const VerificationPipelineHeader: React.FC<VerificationPipelineHeaderProps> = ({
  currentStep,
  isImageUploaded,
}) => {
  const steps = [
    {
      id: 'upload',
      title: 'Face Scan Upload',
      subtitle: 'Biometric input & validation',
      icon: Camera,
      completed: isImageUploaded,
      active: currentStep === 'upload',
    },
    {
      id: 'search',
      title: 'Web & Social Search',
      subtitle: 'Reverse identity match',
      icon: Search,
      completed: false,
      active: currentStep === 'search',
    },
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      subtitle: 'Polygon Amoy on-chain proof',
      icon: ShieldCheck,
      completed: false,
      active: currentStep === 'blockchain',
    },
  ];

  return (
    <header className="w-full max-w-4xl mx-auto mb-8">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">VeriFace</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Decentralized Face Identity & Blockchain Proof</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Network:</span>
          <span className="font-medium text-slate-200">Polygon Amoy Testnet</span>
        </div>
      </div>

      {/* Stepper Flow */}
      <nav aria-label="Verification progress" className="mt-6">
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  step.active
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                    : step.completed
                    ? 'bg-slate-900/40 border-emerald-500/30 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    step.completed
                      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                      : step.active
                      ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Step {idx + 1}
                    </span>
                    {step.completed && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                        Done
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-100 truncate">{step.title}</div>
                  <div className="text-[11px] text-slate-400 truncate hidden sm:block">{step.subtitle}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
};
