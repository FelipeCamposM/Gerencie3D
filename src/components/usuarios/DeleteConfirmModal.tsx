import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<boolean>;
}

export function DeleteConfirmModal({ userId, onOpenChange, onConfirm }: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    if (!userId) return;
    
    const success = await onConfirm(userId);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={!!userId} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <Trash2 className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-300">
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-slate-700 border-slate-600 text-slate-300">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Confirmar Exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
