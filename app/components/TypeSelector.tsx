'use client';

interface TypeSelectorProps {
  selectedType: 'tamTru' | 'thuongTru' | null;
  onSelectType: (type: 'tamTru' | 'thuongTru') => void;
}

export default function TypeSelector({ selectedType, onSelectType }: TypeSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5 mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-3">
        Chọn loại cư trú
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => onSelectType('tamTru')}
          className={`px-4 py-4 md:px-5 md:py-5 rounded-lg border-2 transition-all duration-200 ${
            selectedType === 'tamTru'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold mb-1">1. Tạm trú</div>
          <div className="text-xs md:text-sm">Quản lý thông tin tạm trú</div>
        </button>
        <button
          type="button"
          onClick={() => onSelectType('thuongTru')}
          className={`px-4 py-4 md:px-5 md:py-5 rounded-lg border-2 transition-all duration-200 ${
            selectedType === 'thuongTru'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold mb-1">2. Thường trú</div>
          <div className="text-xs md:text-sm">Quản lý thông tin thường trú</div>
        </button>
      </div>
    </div>
  );
}
