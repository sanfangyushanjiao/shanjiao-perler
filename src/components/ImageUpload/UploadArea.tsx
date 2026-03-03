import { useRef, useState } from 'react';
import { downloadCSVTemplate } from '../../utils/csvTemplate';

interface UploadAreaProps {
  onImageLoad: (image: HTMLImageElement) => void;
  onCSVLoad: (file: File) => void;
}

export default function UploadArea({ onImageLoad, onCSVLoad }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // 检查文件类型
    if (file.type.startsWith('image/')) {
      // 处理图片文件
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          onImageLoad(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.csv')) {
      // 处理 CSV 文件
      onCSVLoad(file);
    } else {
      alert('不支持的文件格式，请上传图片或 CSV 文件');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className={`
        border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? 'border-primary bg-primary/10 scale-105'
          : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="text-6xl mb-4">📸</div>
      <div className="text-xl font-semibold text-gray-700 mb-2">
        点击或拖拽上传图片或 CSV 文件
      </div>
      <div className="text-sm text-gray-500">
        支持 JPG、PNG、GIF、CSV 格式
      </div>
      <details className="mt-3 text-xs text-gray-400">
        <summary className="cursor-pointer hover:text-primary">什么是 CSV 文件？</summary>
        <div className="mt-2 text-left bg-gray-50 p-3 rounded-lg">
          <p className="mb-2">CSV 文件可以保存和分享图纸数据，适用于：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>跨设备继续编辑（PC、手机、平板）</li>
            <li>保存图纸数据以便后续修改</li>
            <li>与他人分享图纸设计</li>
          </ul>
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadCSVTemplate();
            }}
            className="mt-2 text-primary hover:underline"
          >
            下载 CSV 示例文件
          </button>
        </div>
      </details>
    </div>
  );
}
