'use client';

import { useEffect } from 'react';

/**
 * 主页专用：mount 时给 <html> 加 data-snap="home"，
 * 配合 global.css 启用 scroll-snap。
 *
 * 离开主页（unmount）会自动移除属性，文档页等其他路由不受影响。
 */
export function SnapBoot() {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.snap = 'home';
    return () => {
      delete html.dataset.snap;
    };
  }, []);

  return null;
}
