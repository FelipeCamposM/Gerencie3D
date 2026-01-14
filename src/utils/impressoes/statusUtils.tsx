import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Target,
  FileText,
} from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case "APROVADA":
      return <CheckCircle2 className="h-4 w-4" />;
    case "RECUSADA":
      return <XCircle className="h-4 w-4" />;
    case "PENDENTE":
      return <Clock className="h-4 w-4" />;
    case "DESDOBRADA":
      return <Target className="h-4 w-4" />;
    case "ABATIDA":
      return <AlertTriangle className="h-4 w-4" />;
    case "FINALIZADA":
      return <Zap className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case "APROVADA":
    case "FINALIZADA":
    case "RECUSADA":
    case "PENDENTE":
    case "ABATIDA":
    case "DESDOBRADA":
      return "default";
    default:
      return "secondary";
  }
};

export const getStatusClass = (status: string) => {
  const baseClasses = "min-w-32 max-w-32 w-full font-bold px-1 py-[10px] rounded-3xl flex justify-center h-full";
  
  switch (status?.toUpperCase()) {
    case "APROVADA":
      return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
    case "RECUSADA":
      return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
    case "PENDENTE":
      return `${baseClasses} bg-slate-400 hover:bg-slate-500 text-white`;
    case "DESDOBRADA":
      return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white`;
    case "ABATIDA":
      return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white`;
    case "FINALIZADA":
      return `${baseClasses} bg-lime-500 hover:bg-lime-600 text-white`;
    default:
      return `${baseClasses} bg-blue-900 hover:bg-blue-950 text-white`;
  }
};
