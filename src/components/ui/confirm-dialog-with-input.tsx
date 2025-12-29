'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogWithInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: (message?: string) => void | Promise<void>;
  isLoading?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  inputMaxLength?: number;
}

export function ConfirmDialogWithInput({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  isLoading = false,
  inputLabel = 'Message',
  inputPlaceholder = 'Enter a message...',
  inputRequired = false,
  inputMaxLength = 500,
}: ConfirmDialogWithInputProps) {
  const [message, setMessage] = useState('');

  const handleConfirm = async () => {
    if (inputRequired && !message.trim()) {
      return;
    }
    await onConfirm(message.trim() || undefined);
    setMessage(''); 
    onOpenChange(false);
  };

  const handleCancel = () => {
    setMessage(''); 
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message-input">
              {inputLabel} {inputRequired && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="message-input"
              placeholder={inputPlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              maxLength={inputMaxLength}
              rows={4}
              className="resize-none"
            />
            {inputMaxLength && (
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/{inputMaxLength} characters
              </p>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || (inputRequired && !message.trim())}
            className={
              variant === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

