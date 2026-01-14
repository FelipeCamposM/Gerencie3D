// FileUpload.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useState, useEffect } from "react";

interface FileUploadProps {
  onFilesChange?: (files: {
    nfDevolucao: File | null;
    recibo: File | null;
  }) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function FileUploadNFDevRecibo({
  onFilesChange,
  onValidationChange,
}: FileUploadProps) {
  const nfFileInputRef = useRef<HTMLInputElement | null>(null);
  const reciboFileInputRef = useRef<HTMLInputElement | null>(null);
  const [nfFileName, setNfFileName] = useState("");
  const [reciboFileName, setReciboFileName] = useState("");
  const [nfFile, setNfFile] = useState<File | null>(null);
  const [reciboFile, setReciboFile] = useState<File | null>(null);

  const handleNfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setNfFileName(file.name);
      setNfFile(file);
      onFilesChange?.({ nfDevolucao: file, recibo: reciboFile });
    }
  };

  const handleReciboFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setReciboFileName(file.name);
      setReciboFile(file);
      onFilesChange?.({ nfDevolucao: nfFile, recibo: file });
    }
  };

  const isBothFilesSelected = Boolean(nfFile && reciboFile);

  // Notificar mudanças na validação
  useEffect(() => {
    onValidationChange?.(isBothFilesSelected);
  }, [isBothFilesSelected, onValidationChange]);

  return (
    <div className="space-y-6">
      {/* Arquivo NF Devolução */}
      <div className="space-y-3">
        <Label htmlFor="nf-file" className="text-slate-300">
          Nota Fiscal de Devolução
        </Label>
        <Input
          id="nf-file"
          ref={nfFileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleNfFileChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => nfFileInputRef.current?.click()}
          className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          {nfFileName
            ? `Arquivo NF: ${nfFileName}`
            : "Selecionar Nota Fiscal de Devolução"}
        </Button>
      </div>

      {/* Arquivo Recibo */}
      <div className="space-y-3">
        <Label htmlFor="recibo-file" className="text-slate-300">
          Recibo
        </Label>
        <Input
          id="recibo-file"
          ref={reciboFileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleReciboFileChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => reciboFileInputRef.current?.click()}
          className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          {reciboFileName ? `Recibo: ${reciboFileName}` : "Selecionar Recibo"}
        </Button>
      </div>

      {/* Status dos arquivos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              nfFile ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-slate-300">
            {nfFile
              ? "NF de Devolução selecionada"
              : "NF de Devolução pendente"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              reciboFile ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-slate-300">
            {reciboFile ? "Recibo selecionado" : "Recibo pendente"}
          </span>
        </div>
      </div>
    </div>
  );
}
