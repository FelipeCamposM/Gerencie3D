import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Prosseguir",
  cancelText = "Cancelar",
  onConfirm,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700">
        <DialogHeader className="text-slate-200">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <div className="text-slate-400 text-sm">{description}</div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            onClick={() => onOpenChange(false)}
            disabled={!!loading}
          >
            {cancelText}
          </Button>
          <Button
            className={`${loading ? "bg-slate-600" : "bg-green-600 hover:bg-green-700"}`}
            onClick={onConfirm}
            disabled={!!loading}
          >
            {loading ? "Processando..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
