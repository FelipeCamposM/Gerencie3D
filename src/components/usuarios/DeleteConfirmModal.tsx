import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<boolean>;
}

export function DeleteConfirmModal({
  userId,
  onOpenChange,
  onConfirm,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    if (!userId) return;

    const success = await onConfirm(userId);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={!!userId} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[calc(100vw-2rem)] md:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800 text-xl">
            <Trash2 className="h-6 w-6 text-red-600" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-700 font-semibold mb-2">
            Tem certeza que deseja excluir este usuário?
          </p>
          <p className="text-slate-600 text-sm">
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Confirmar Exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
