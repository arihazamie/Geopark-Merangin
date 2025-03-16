"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.",
  itemName,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        {itemName && (
          <Alert
            variant="destructive"
            className="mt-2">
            <AlertDescription className="font-medium text-center">
              {itemName}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}>
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
