
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  isParsing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, isParsing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
      e.target.value = ''; // Reset input to allow re-uploading the same file
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
        isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute w-full h-full opacity-0 cursor-pointer"
        accept=".csv"
        onChange={handleFileSelect}
        disabled={isParsing}
      />
      <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
        <UploadIcon className="w-10 h-10" />
        {isParsing ? (
          <p className="font-semibold">Parsing file...</p>
        ) : (
          <>
            <p className="font-semibold">
              <label htmlFor="file-upload" className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer">
                Click to upload
              </label>
              {' '}or drag and drop
            </p>
            <p className="text-xs">CSV files only</p>
          </>
        )}
      </div>
    </div>
  );
};
