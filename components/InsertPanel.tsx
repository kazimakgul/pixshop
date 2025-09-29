/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import { PhotoPlusIcon, UploadIcon, XCircleIcon } from './icons';

interface InsertPanelProps {
  onImageInsert: (file: File) => void;
  onApplyInsert: () => void;
  onClearInsert: () => void;
  isLoading: boolean;
  insertImage: File | null;
}

const InsertPanel: React.FC<InsertPanelProps> = ({ onImageInsert, onApplyInsert, onClearInsert, isLoading, insertImage }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (insertImage) {
      const url = URL.createObjectURL(insertImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [insertImage]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      onImageInsert(files[0]);
    }
  }, [onImageInsert]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2">
        <PhotoPlusIcon className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-center text-gray-300">Insert an Image</h3>
      </div>
      <p className="text-sm text-center text-gray-400 -mt-2">Upload an object or person to intelligently add it to your photo.</p>

      {!insertImage ? (
        <label
          htmlFor="insert-image-upload"
          className={`w-full h-40 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDraggingOver ? 'border-dashed border-blue-400 bg-blue-500/10' : 'border-dashed border-gray-600 hover:border-gray-500 hover:bg-white/5'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            handleFileSelect(e.dataTransfer.files);
          }}
        >
          <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="font-semibold text-gray-300">Click to upload</span>
          <span className="text-sm text-gray-500">or drag and drop</span>
          <input id="insert-image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
        </label>
      ) : (
        <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
            <img src={previewUrl!} alt="Insert preview" className="w-full h-full object-cover" />
            <button
                onClick={onClearInsert}
                disabled={isLoading}
                className="absolute top-1 right-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors p-1"
                aria-label="Clear inserted image"
            >
                <XCircleIcon className="w-6 h-6" />
            </button>
        </div>
      )}

      <button
        onClick={onApplyInsert}
        disabled={isLoading || !insertImage}
        className="w-full max-w-xs mt-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Apply Insert
      </button>
    </div>
  );
};

export default InsertPanel;
