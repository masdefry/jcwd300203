'use client'
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label: string;
  disabled: boolean
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  accept = "image/*",
  label
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        {label}
      </Button>
    </div>
  );
};

interface ErrorAlertProps {
  title: string;
  description: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, description }) => (
  <Alert variant="destructive">
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
);

interface SuccessAlertProps {
  title: string;
  description: string;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({ title, description }) => (
  <Alert className="bg-green-50">
    <AlertTitle className="text-green-800">{title}</AlertTitle>
    <AlertDescription className="text-green-700">{description}</AlertDescription>
  </Alert>
);

export const FormField: React.FC<{
  label: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}> = ({ label, error, touched, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    {children}
    {touched && error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
);