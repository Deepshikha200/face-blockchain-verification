import React, { useState } from 'react';
import { VerificationPipelineHeader } from './components/VerificationPipelineHeader';
import { FaceImageUpload } from './components/FaceImageUpload';
import { ContinueSuccessModal } from './components/ContinueSuccessModal';
import type { UploadedFaceImage, PipelineStep } from './types/upload';
import { Shield, Sparkles, CheckCircle, Code, Layers, FileWarning } from 'lucide-react';

export const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<UploadedFaceImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('upload');

  // Sample face portraits for quick testing in browser
  const sampleFaces = [
    {
      name: 'Alex Rivera (Portrait 1)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      label: 'Female • Neutral lighting',
    },
    {
      name: 'Marcus Chen (Portrait 2)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      label: 'Male • Front-facing',
    },
    {
      name: 'Sarah Jenkins (Portrait 3)',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
      label: 'Studio quality',
    },
  ];

  // Helper to load sample face into a simulated File object
  const loadSampleFace = async (sampleUrl: string, sampleName: string) => {
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, '_')}.jpg`, {
        type: 'image/jpeg',
      });

      // Dispatch file into the component via the file input or custom setter
      const inputElement = document.getElementById('face-image-input') as HTMLInputElement;
      if (inputElement) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        inputElement.files = dataTransfer.files;
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (e) {
      console.error('Error fetching sample face', e);
    }
  };

  // Helper to test invalid file type
  const triggerInvalidFileTest = () => {
    const invalidFile = new File(['invalid file content'], 'document.pdf', {
      type: 'application/pdf',
    });
    const inputElement = document.getElementById('face-image-input') as HTMLInputElement;
    if (inputElement) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // Helper to test oversized file
  const triggerOversizedFileTest = () => {
    // 11MB dummy file
    const oversizedBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'image/jpeg' });
    const oversizedFile = new File([oversizedBlob], 'giant_face_scan.jpg', {
      type: 'image/jpeg',
    });
    const inputElement = document.getElementById('face-image-input') as HTMLInputElement;
    if (inputElement) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(oversizedFile);
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // Helper to test no-face image error validation
  const triggerNoFaceImageTest = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Blue sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 320, 140);

      // Green grass landscape
      const grassGrad = ctx.createLinearGradient(0, 140, 0, 240);
      grassGrad.addColorStop(0, '#15803d');
      grassGrad.addColorStop(1, '#166534');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 140, 320, 100);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const noFaceFile = new File([blob], 'scenery_no_face.jpg', { type: 'image/jpeg' });
        const inputElement = document.getElementById('face-image-input') as HTMLInputElement;
        if (inputElement) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(noFaceFile);
          inputElement.files = dataTransfer.files;
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }, 'image/jpeg');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col">
        {/* Verification Pipeline Stepper Header */}
        <VerificationPipelineHeader
          currentStep={pipelineStep}
          isImageUploaded={currentImage !== null}
        />

        {/* Primary Face Image Upload Section */}
        <div className="flex-1 flex flex-col items-center justify-center my-4">
          <FaceImageUpload
            onContinue={(data) => {
              setCurrentImage(data);
              setIsModalOpen(true);
            }}
            onImageSelect={(data) => {
              setCurrentImage(data);
              if (!data) {
                setPipelineStep('upload');
              }
            }}
            maxSizeBytes={10 * 1024 * 1024} // 10MB
            acceptedFormats={['image/jpeg', 'image/png', 'image/jpg']}
            acceptedExtensions={['.jpg', '.jpeg', '.png']}
          />

          {/* Preset Demo Tools / Sample Faces */}
          <div className="w-full max-w-2xl mx-auto mt-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Quick Test Utilities & Demo Samples</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any sample to test the upload & preview flow
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              {sampleFaces.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSampleFace(sample.url, sample.name)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                      Sample #{idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{sample.label}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Validation Test Triggers */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <FileWarning className="w-3.5 h-3.5 text-amber-400" />
                Test error validation:
              </span>
              <button
                type="button"
                onClick={triggerNoFaceImageTest}
                className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 transition-colors cursor-pointer"
              >
                Trigger No-Face Image (Landscape)
              </button>
              <button
                type="button"
                onClick={triggerInvalidFileTest}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Trigger Invalid Format (.pdf)
              </button>
              <button
                type="button"
                onClick={triggerOversizedFileTest}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Trigger Oversized (&gt;10MB)
              </button>
            </div>
          </div>
        </div>

        {/* Continue Handshake Modal */}
        <ContinueSuccessModal
          image={currentImage}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onStepChange={(step) => setPipelineStep(step)}
        />
      </main>

      {/* Modern SaaS Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Face Identification &amp; Blockchain Verification Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>React 19 + TypeScript</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Tailwind CSS</span>
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Production Ready</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
