import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, AlertCircle, ExternalLink } from 'lucide-react';

const PURCHASE_URL = 'https://www.goofish.com/personal?spm=a21ybx.home.nav.1.4c053da6ZFTpm5';

export const ActivationModal: React.FC = () => {
  const { activate } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-F0-9-]/g, '');

    // Auto-format as SJ-XXXX-XXXX-XXXX
    if (!value.startsWith('SJ-')) {
      if (value.startsWith('SJ')) {
        value = 'SJ-' + value.slice(2);
      } else {
        value = 'SJ-' + value;
      }
    }

    // Add dashes automatically
    const parts = value.slice(3).replace(/-/g, '').match(/.{1,4}/g) || [];
    if (parts.length > 0) {
      value = 'SJ-' + parts.join('-').slice(0, 14); // SJ-XXXX-XXXX-XXXX (max length)
    }

    setCode(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length < 17) {
      setError('请输入完整的激活码');
      return;
    }

    setLoading(true);
    setError('');

    const result = await activate(code);

    if (!result.success) {
      setError(result.error || '激活失败，请重试');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-md lg:max-w-2xl w-full my-auto">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-2">
          山椒爱拼豆
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-center text-gray-600 mb-6 sm:mb-8">
          拼豆图纸生成工具
        </p>

        {/* Activation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div>
            <label htmlFor="activation-code" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
              请输入激活码
            </label>
            <input
              id="activation-code"
              type="text"
              value={code}
              onChange={handleInputChange}
              placeholder="SJ-XXXX-XXXX-XXXX"
              maxLength={17}
              className="w-full px-3 py-3 sm:px-4 lg:px-6 lg:py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-base sm:text-lg lg:text-xl font-mono tracking-wider"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm lg:text-base text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 17}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-3 lg:py-4 text-base lg:text-lg rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? '验证中...' : '激活'}
          </button>
        </form>

        {/* Pricing Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm lg:text-base text-gray-600 text-center mb-4">
            还没有激活码？选择您的套餐：
          </p>

          <div className="space-y-2 lg:space-y-3 mb-6">
            <div className="flex justify-between items-center px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 rounded-lg">
              <span className="text-sm lg:text-base text-gray-700">24小时使用权</span>
              <span className="text-sm lg:text-base font-semibold text-purple-600">¥1.8</span>
            </div>
            <div className="flex justify-between items-center px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 rounded-lg">
              <span className="text-sm lg:text-base text-gray-700">七天使用权</span>
              <span className="text-sm lg:text-base font-semibold text-purple-600">¥6.6</span>
            </div>
            <div className="flex justify-between items-center px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <span className="text-sm lg:text-base text-gray-700 font-medium">永久使用权 🔥</span>
              <span className="text-sm lg:text-base font-bold text-purple-600">¥9.9</span>
            </div>
          </div>

          <a
            href={PURCHASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white border-2 border-purple-500 text-purple-600 font-semibold py-3 lg:py-4 text-base lg:text-lg rounded-lg hover:bg-purple-50 transition-all"
          >
            立即购买激活码
            <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5" />
          </a>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs lg:text-sm text-center text-gray-500">
          激活码可在多设备使用 · 安全支付 · 即时发货
        </p>
      </div>
    </div>
  );
};
