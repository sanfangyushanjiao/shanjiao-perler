import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, LogOut, Clock, AlertTriangle } from 'lucide-react';

export const ActivationStatus: React.FC = () => {
  const { code, type, getRemainingTime, logout, isExpired } = useAuth();
  const [remainingTime, setRemainingTime] = useState(getRemainingTime());
  const [showDetails, setShowDetails] = useState(false);

  // Update remaining time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getRemainingTime]);

  const expired = isExpired();

  const getTypeLabel = () => {
    switch (type) {
      case '24h':
        return '24小时版';
      case '7d':
        return '七天版';
      case 'lifetime':
        return '永久版';
      default:
        return '';
    }
  };

  const isWarning = () => {
    if (type === 'lifetime' || !remainingTime) return false;
    // Show warning if less than 2 hours remaining
    return remainingTime.includes('分钟') && !remainingTime.includes('小时');
  };

  const handleLogout = () => {
    if (confirm('确定要退出吗？退出后需要重新输入激活码。')) {
      logout();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        {/* Main Status Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
            expired
              ? 'bg-red-500 text-white'
              : isWarning()
              ? 'bg-yellow-500 text-white'
              : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
          } hover:shadow-xl`}
        >
          {expired ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <KeyRound className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {expired ? '已过期' : remainingTime}
          </span>
        </button>

        {/* Details Dropdown */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-3 text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium opacity-90">激活码</span>
                <span className="text-xs opacity-90">{getTypeLabel()}</span>
              </div>
              <div className="font-mono text-sm tracking-wider">{code}</div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500">剩余时间</div>
                  <div className={`text-sm font-semibold ${
                    expired ? 'text-red-600' : isWarning() ? 'text-yellow-600' : 'text-gray-800'
                  }`}>
                    {remainingTime}
                  </div>
                </div>
              </div>

              {isWarning() && !expired && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  ⚠️ 即将过期，建议提前续费
                </div>
              )}

              {expired && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  🔒 使用权已过期，请购买新的激活码
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出登录</span>
              </button>
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                激活码可在多设备使用
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showDetails && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};
