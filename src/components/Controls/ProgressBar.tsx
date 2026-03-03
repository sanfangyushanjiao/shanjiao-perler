interface ProgressBarProps {
  progress: number;
  isProcessing: boolean;
}

export default function ProgressBar({ progress, isProcessing }: ProgressBarProps) {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">处理中...</h3>

        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-600 mt-3 text-center">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
