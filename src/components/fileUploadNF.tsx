import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface FileUploadNFProps {
  onFileChange?: (file: File | null) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function FileUploadNF({
  onFileChange,
  onValidationChange,
}: FileUploadNFProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const validateFile = (file: File): boolean => {
    // Lista de tipos MIME aceitos
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg',
      'image/png'
    ];
    
    // Lista de extensões aceitas
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    
    // Verifica o tipo MIME
    const isValidMimeType = allowedTypes.includes(file.type);
    
    // Verifica a extensão do arquivo
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    // Verifica o tamanho do arquivo (máximo 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    const isValidSize = file.size <= maxSizeInBytes;
    
    if (!isValidMimeType && !isValidExtension) {
      toast.error("Tipo de arquivo não suportado. Use apenas PDF, JPG, JPEG ou PNG.");
      return false;
    }
    
    if (!isValidSize) {
      toast.error("Arquivo muito grande. O tamanho máximo é 10MB.");
      return false;
    }
    
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      
      // Validar o arquivo antes de aceitar
      if (validateFile(selectedFile)) {
        setFileName(selectedFile.name);
        setFile(selectedFile);
        onFileChange?.(selectedFile);
        toast.success("Arquivo selecionado com sucesso!");
      } else {
        // Reset the input if file is invalid
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFileName("");
        setFile(null);
        onFileChange?.(null);
      }
    }
  };

  const isFileSelected = Boolean(file);

  useEffect(() => {
    onValidationChange?.(isFileSelected);
  }, [isFileSelected, onValidationChange]);

  const clearFile = () => {
    setFileName("");
    setFile(null);
    onFileChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="nf-file" className="text-slate-300">
        Nota Fiscal
      </Label>
      <Input
        id="nf-file"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          {fileName ? `Arquivo: ${fileName}` : "Selecionar Nota Fiscal"}
        </Button>
        
        {file && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFile}
            className="bg-red-600 border-red-500 text-white hover:bg-red-700 px-3"
            title="Remover arquivo"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Status do arquivo */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            file ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-sm text-slate-300">
          {file ? `Nota Fiscal selecionada (${(file.size / 1024 / 1024).toFixed(2)} MB)` : "Nota Fiscal pendente"}
        </span>
      </div>
      
      {file && (
        <div className="text-xs text-slate-400">
          Tipo: {file.type || 'Desconhecido'} | Tamanho: {(file.size / 1024).toFixed(2)} KB
        </div>
      )}
    </div>
  );
}
