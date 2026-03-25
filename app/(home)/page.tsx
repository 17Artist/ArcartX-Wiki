'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const showcaseItems: Array<{
  icon?: string;
  title: string;
  description: string;
  details?: string[];
  image?: string;
  color: string;
}> = [
  { 
    icon: '🎮',
    image: '/pre/ui.gif', 
    title: 'UI 系统', 
    description: '灵活的 UI 系统，支持复杂布局与丰富的交互效果',
    details: ['30+ 控件类型', '事件系统', '动态绑定', '平滑渲染'],
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: '⚔️',
    image: '/pre/damage-display.gif', 
    title: '伤害显示', 
    description: '动态伤害数字效果，让战斗更有打击感',
    details: ['浮动数字', '暴击特效', '自定义样式'],
    color: 'from-red-500 to-orange-500'
  },
  { 
    icon: '❤️',
    image: '/pre/bossbar.gif', 
    title: 'Boss 血条', 
    description: '多层血条系统，完美展示 Boss 战斗状态',
    details: ['多层血条', '过渡动画', '自定义样式'],
    color: 'from-red-600 to-rose-500'
  },
  { 
    icon: '📦',
    image: '/pre/tip.png', 
    title: '物品提示', 
    description: '丰富的物品信息展示，完全自定义的 Tooltip',
    details: ['自定义布局', '动态数据'],
    color: 'from-purple-500 to-pink-500'
  },
  { 
    icon: '💬',
    image: '/pre/chat.png', 
    title: '自定义聊天栏', 
    description: '可自定义的聊天界面，额外支持卡片消息',
    details: ['卡片消息', '可实现表情功能'],
    color: 'from-amber-500 to-orange-500'
  },
  { 
    icon: '🎨',
    image: '/pre/model.png', 
    title: '自定义模型', 
    description: '支持基岩版模型格式，兼容 BlockBench 导出的模型与动画',
    details: ['模型', '动画', '骨骼'],
    color: 'from-green-500 to-emerald-500'
  },
  { 
    icon: '✨',
    image: '/pre/effects.png', 
    title: '附加特效', 
    description: '绚丽的模型附加效果，支持多种特效',
    details: ['技能特效', '环境效果'],
    color: 'from-cyan-500 to-teal-500'
  },

  { 
    icon: '🧭',
    image: '/pre/navigation.png', 
    title: '导航', 
    description: '路径点指引，帮助玩家找到目标',
    details: ['距离显示', '方向指示', '自定义图标'],
    color: 'from-teal-500 to-cyan-500'
  }
];


const stats = [
  { value: '30+', label: '功能模块' },
  { value: '100+', label: '内置函数' },
  { value: '∞', label: '创意可能' },
  { value: '7*8', label: '社区支持' }
];


const codeExamples = {
  ui: `# 创建一个自定义菜单 UI
controls:
  adaptive:
    type: adaptive
    attribute:
      width: 1920
      height: 1080
      point: ~middle_center
    children:
      background:
        type: 9SliceTexture
        attribute:
          width: 800
          height: 600
          normal: ~panel.png
          left: 8
          right: 8
          top: 8
          bottom: 8`,
  shimmer: `// Shimmer 脚本示例
var.health = Player.getHealth()

if (var.health < 10) {
    Message.chat("&c警告: 生命值过低!")
}`
};

function highlightShimmer(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    // 注释
    if (line.trim().startsWith('//')) {
      return <div key={i} className="leading-relaxed"><span className="text-gray-500">{line}</span></div>;
    }

    const parts = line.split(/(\s+|[(){}[\],.<>=!+\-*/])/);
    
    return (
      <div key={i} className="leading-relaxed">
        {parts.map((part, j) => {
          if (/^(var|val|if|else|for|while|return|fun|class)$/.test(part)) {
            return <span key={j} className="text-purple-400">{part}</span>;
          }
          if (/^(true|false|null)$/.test(part)) {
            return <span key={j} className="text-orange-400">{part}</span>;
          }
          if (/^\d+\.?\d*$/.test(part)) {
            return <span key={j} className="text-amber-400">{part}</span>;
          }
          if (/^[A-Z][a-zA-Z]*$/.test(part)) {
            return <span key={j} className="text-cyan-400">{part}</span>;
          }
          if (/^["'].*["']$/.test(part)) {
            return <span key={j} className="text-green-400">{part}</span>;
          }
          if (part.includes('&')) {
            return <span key={j} className="text-yellow-400">{part}</span>;
          }
          if (/^[(){}[\].,<>=!+\-*/]+$/.test(part)) {
            return <span key={j} className="text-gray-500">{part}</span>;
          }
          return <span key={j} className="text-gray-300">{part}</span>;
        })}
      </div>
    );
  });
}

function highlightYaml(code: string): React.ReactNode[] {
  return code.split('\n').map((line, i) => {
    if (line.trim().startsWith('#')) {
      return <div key={i} className="leading-relaxed"><span className="text-gray-500">{line}</span></div>;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);
      return (
        <div key={i} className="leading-relaxed">
          <span className="text-indigo-400">{key}</span>
          <span className="text-gray-500">:</span>
          <span className="text-green-400">{value}</span>
        </div>
      );
    }
    
    return <div key={i} className="leading-relaxed"><span className="text-gray-300">{line}</span></div>;
  });
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'ui' | 'shimmer' >('ui');
  const [previewItem, setPreviewItem] = useState<typeof showcaseItems[0] | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-[#191a21] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-15 transition-transform duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-10 transition-transform duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)',
            bottom: '-15%',
            right: '-5%',
            transform: `translate(${-mousePos.x * 8}px, ${-mousePos.y * 8}px)`,
          }}
        />

        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="ArcartX" className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              ArcartX
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">文档</Link>
            <a href="https://arcartx.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">社区</a>
            <a href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bq2Egfr376H6Tp_2KCfcbDzI2IRndERq&authKey=ffKd3oo4B9GOUjt70TDo7J9Z2NTcGVz5CiTigJEPwA%2FUX0CLSO9ZM%2FVvPi8hLtfo&noverify=0&group_code=832063293" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">QQ群</a>
          </div>
          
          <Link
            href="/docs"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition-colors"
          >
            开始使用
          </Link>
        </div>
      </nav>

      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 pt-32"
      >
        <div 
          className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >

          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl scale-150" />
            <img 
              src="/logo.png" 
              alt="ArcartX Logo" 
              className="relative w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
            <span className="text-white">
              ArcartX
            </span>
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 font-light">
            一起前往 <span className="text-indigo-400 font-semibold">更遥远的未来</span>
          </p>
          
          <p className="text-base md:text-lg text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
          灵活 UI 系统、自定义模型、原创脚本引擎，为您的服务器带来无限可能。
            <br className="hidden md:block" />
            告别枯燥，拥抱创意，让每一个细节都与众不同。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/docs"
              className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl font-semibold text-lg
                       shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 
                       transform hover:scale-105 transition-all duration-300
                       overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                立即开始
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <a
              href="https://arcartx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 border border-gray-700 hover:border-gray-500 rounded-xl font-semibold text-lg
                       text-gray-300 hover:text-white
                       transform hover:scale-105 transition-all duration-300
                       backdrop-blur-sm bg-white/5"
            >
              探索社区
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-indigo-400">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-indigo-400">
                效果预览
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              ArcartX 提供了一套完整的工具链，让您轻松打造独特的游戏体验
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {showcaseItems.map((item, index) => (
              <div
                key={index}
                className={`group relative rounded-xl overflow-hidden cursor-pointer
                         border border-gray-800 hover:border-gray-600
                         bg-gradient-to-b from-gray-900/80 to-gray-900/40
                         hover:from-gray-800/80 hover:to-gray-900/60
                         transition-all duration-300 hover:-translate-y-1
                         ${item.image ? 'aspect-[4/3]' : 'aspect-square'}`}
                onMouseEnter={() => item.image && setPreviewItem(item)}
                onMouseLeave={() => setPreviewItem(null)}
              >
                {item.image ? (
                  <>
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {item.image.endsWith('.gif') && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-gray-300 z-10">
                        GIF
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-gray-400 z-10
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      🔍 悬停预览
                    </div>
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                )}

                <div className="relative h-full flex flex-col justify-end p-5 z-10">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                    {item.title}
                  </h3>

                  <p className={`text-gray-400 text-sm leading-relaxed ${item.image ? 'line-clamp-2' : ''}`}>
                    {item.description}
                  </p>

                  {item.details && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.details.slice(0, 3).map((detail, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 text-xs bg-black/40 text-gray-400 rounded
                                   group-hover:bg-indigo-900/50 group-hover:text-indigo-300 transition-colors"
                        >
                          {detail}
                        </span>
                      ))}
                      {item.details.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500">
                          +{item.details.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {previewItem && previewItem.image && (
          <div 
            className="fixed right-8 top-1/2 -translate-y-1/2 z-50 pointer-events-none
                     animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl shadow-black/50 overflow-hidden max-w-lg">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                <span className="text-2xl">{previewItem.icon}</span>
                <div>
                  <h4 className="font-bold text-white">{previewItem.title}</h4>
                  <p className="text-xs text-gray-500">{previewItem.description}</p>
                </div>
              </div>

              <img 
                src={previewItem.image} 
                alt={previewItem.title}
                className="w-full max-h-[60vh] object-contain bg-black/50"
              />

              {previewItem.details && (
                <div className="px-4 py-3 border-t border-gray-800 flex flex-wrap gap-2">
                  {previewItem.details.map((detail, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 text-xs bg-indigo-900/50 text-indigo-300 rounded-full"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-indigo-400">
                简洁配置
              </span>
              ，强大功能
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              使用 YAML 和 Shimmer 脚本，轻松实现复杂功能
            </p>
          </div>
          
          <div className="relative">
            <div className="relative bg-[#1c1d24] rounded-xl border border-[#2d2e38] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d2e38] bg-[#16171e]">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />

                <div className="flex gap-1 ml-6">
                  {(['ui', 'shimmer'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                        activeCodeTab === tab 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {tab === 'ui' ? 'ui_config.yml' : 'shimmer'}
                    </button>
                  ))}
                </div>
              </div>

              <pre className="p-6 text-sm overflow-x-auto min-h-[300px]">
                <code className="text-gray-300 font-mono">
                  {activeCodeTab === 'shimmer' 
                    ? highlightShimmer(codeExamples.shimmer)
                    : highlightYaml(codeExamples.ui)
                  }
                </code>
              </pre>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <div className="text-2xl mb-3">📝</div>
              <h4 className="text-lg font-semibold mb-2">YAML 配置</h4>
              <p className="text-gray-400 text-sm">使用简洁的 YAML 语法定义 UI 布局配置</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <div className="text-2xl mb-3">⚡</div>
              <h4 className="text-lg font-semibold mb-2">Shimmer 脚本</h4>
              <p className="text-gray-400 text-sm">自研脚本语言，助力更好的创造</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
              <div className="text-2xl mb-3">🔄</div>
              <h4 className="text-lg font-semibold mb-2">热编译</h4>
              <p className="text-gray-400 text-sm">修改配置后重载，Shimmer脚本即时生效</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-indigo-400">
                快速开始
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              只需几步，即可开始使用 ArcartX
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              { step: '01', title: '下载插件', desc: '从官方渠道下载最新版本的 ArcartX 插件' },
              { step: '02', title: '安装插件', desc: '将插件放入服务器的 plugins 目录，重启服务器' },
              { step: '03', title: '接受协议', desc: '前往官网接受 EULA 协议，免费获取许可证密钥' },
              { step: '04', title: '开始创作', desc: '阅读文档，开始创建您的自定义内容' },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-6 p-6 rounded-xl bg-gray-900/30 border border-gray-800
                         hover:bg-gray-900/50 hover:border-gray-700 transition-colors group"
              >
                <div className="text-4xl font-black text-gray-700 group-hover:text-indigo-500 transition-colors">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            加入 <span className="text-indigo-400">社区</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            与其他开发者交流经验，获取帮助，分享您的作品
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bq2Egfr376H6Tp_2KCfcbDzI2IRndERq&authKey=ffKd3oo4B9GOUjt70TDo7J9Z2NTcGVz5CiTigJEPwA%2FUX0CLSO9ZM%2FVvPi8hLtfo&noverify=0&group_code=832063293"
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 
                       hover:bg-gray-800/50 transition-all group"
            >
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">QQ 交流群</h3>
              <p className="text-gray-400 text-sm">实时交流，快速获取帮助</p>
            </a>
            
            <a 
              href="https://arcartx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-indigo-500/50 
                       hover:bg-gray-800/50 transition-all group"
            >
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">官方社区</h3>
              <p className="text-gray-400 text-sm">浏览资源，分享作品</p>
            </a>
            
            <a 
              href="https://afdian.com/a/arcartx/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-pink-500/50 
                       hover:bg-gray-800/50 transition-all group"
            >
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">支持我们</h3>
              <p className="text-gray-400 text-sm">您的支持是我们前进的动力</p>
            </a>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            准备好了吗？
          </h2>
          <p className="text-gray-400 text-xl mb-12">
            现在就开始，为您的服务器注入新的活力
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-gray-900 rounded-xl font-bold text-xl
                     hover:bg-gray-100 transform hover:scale-105 transition-all duration-300
                     shadow-xl shadow-white/10"
          >
            查看文档
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="ArcartX" className="w-10 h-10" />
                <span className="text-xl font-bold">ArcartX</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                ArcartX 是一个为 Minecraft 服务器开发者打造的创新框架，提供自定义模型、UI 系统、脚本引擎等功能。
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">资源</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-white text-sm transition-colors">文档中心</Link></li>
                <li><a href="https://arcartx.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">官方社区</a></li>
                <li><Link href="/docs/core/1_base/1_setup" className="text-gray-400 hover:text-white text-sm transition-colors">快速开始</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">社区</h4>
              <ul className="space-y-2">
                <li><a href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bq2Egfr376H6Tp_2KCfcbDzI2IRndERq&authKey=ffKd3oo4B9GOUjt70TDo7J9Z2NTcGVz5CiTigJEPwA%2FUX0CLSO9ZM%2FVvPi8hLtfo&noverify=0&group_code=832063293" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">QQ 交流群</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2024 - 2025 上海佰云汇梦软件科技有限公司
            </div>
            <a 
              href="https://beian.miit.gov.cn/#/Integrated/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              沪ICP备2024096261号-4
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
