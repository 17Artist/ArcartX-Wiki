import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

const COMPOUND_WORDS = new Set([
  '伤害显示', '碰撞箱', '骨骼隐藏', '控件',
  '天空盒', '着色器', '按键绑定', '波浪号',
  '基岩粒子', '世界贴图', '场景相机',
  '点对点', '范围广播', '纯文本', '管道符',
  '模型特效', '动画控制器', '额外模型',
  '覆盖模型', '额外槽位', '物品冷却',
  '聊天卡片', '数据包', '区域管理',
  '路标', '导航', '血条',
]);

const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });

const chineseTokenizer = {
  language: 'chinese',
  normalizationCache: new Map<string, string>(),
  tokenize: (text: string): string[] => {
    if (!text) return [];
    // 限制输入长度，防止超长搜索请求消耗过多资源
    if (text.length > 30) text = text.slice(0, 30);

    const tokens = new Set<string>();

    const textLower = text.toLowerCase();
    for (const word of COMPOUND_WORDS) {
      if (textLower.includes(word.toLowerCase())) {
        tokens.add(word.toLowerCase());
      }
    }

    const segments = [...segmenter.segment(text)];
    for (const seg of segments) {
      if (!seg.isWordLike) continue;
      const word = seg.segment.trim().toLowerCase();
      if (word) tokens.add(word);
    }

    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    for (let i = 0; i < chineseChars.length - 1; i++) {
      tokens.add(chineseChars[i] + chineseChars[i + 1]);
    }

    const englishWords = text.match(/[a-zA-Z][a-zA-Z0-9_]*/g) || [];
    for (const w of englishWords) {
      tokens.add(w.toLowerCase());
    }

    return [...tokens];
  },
};

export const { GET } = createFromSource(source, undefined, {
  tokenizer: chineseTokenizer,
  search: {
    tolerance: 1,
  },
});
