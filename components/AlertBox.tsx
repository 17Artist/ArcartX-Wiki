import React from 'react';

export function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-[1px] rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
      <div className="bg-[#18181B] rounded-lg p-2">
        {children}
      </div>
    </div>
  );
}

// 如果使用默认导出
export default AlertBox;