import { ArrowRight } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: 1 | 2;
  onStepChange: (step: 1 | 2) => void;
  canAdvanceToStep2: boolean;
}

export function ProgressIndicator({ 
  currentStep, 
  onStepChange, 
  canAdvanceToStep2 
}: ProgressIndicatorProps) {
  const handleStepClick = (step: 1 | 2) => {
    if (step === 1) {
      onStepChange(1);
    } else if (step === 2 && canAdvanceToStep2) {
      onStepChange(2);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-4">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all hover:bg-blue-500/10 ${
            currentStep === 1
              ? "bg-blue-500/20 text-blue-400"
              : "bg-slate-700 text-slate-400 hover:text-slate-300"
          }`}
          onClick={() => handleStepClick(1)}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 1
                ? "bg-blue-500 text-white"
                : "bg-slate-600 text-slate-400"
            }`}
          >
            1
          </div>
          <span className="font-medium">Informações da NF</span>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-400" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all hover:bg-blue-500/10 ${
            currentStep === 2
              ? "bg-blue-500/20 text-blue-400"
              : "bg-slate-700 text-slate-400 hover:text-slate-300"
          }`}
          onClick={() => handleStepClick(2)}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 2
                ? "bg-blue-500 text-white"
                : "bg-slate-600 text-slate-400"
            }`}
          >
            2
          </div>
          <span className="font-medium">Seleção de Produtos</span>
        </div>
      </div>
    </div>
  );
}
