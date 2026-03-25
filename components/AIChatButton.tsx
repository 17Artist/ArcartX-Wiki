'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface Model {
  id: string;
}

const STORAGE_KEY = 'arcartx-ai-config';
const HISTORY_KEY = 'arcartx-ai-history';

function normalizeUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '');
  if (url && !/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

function loadConfig(): AIConfig {
  if (typeof window === 'undefined') return { baseUrl: '', apiKey: '', model: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { baseUrl: '', apiKey: '', model: '' };
}

function saveConfig(config: AIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadHistory(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(messages: Message[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-50)));
}

const SYSTEM_PROMPT = `你是 ArcartX 官方文档助手。你的职责是基于下方提供的文档内容，帮助用户理解 ArcartX 的功能、用法和 API。

## 回答原则
1. **严格基于文档**：你的所有回答必须来源于下方提供的文档内容。如果文档中没有相关信息，明确告知用户"文档中未找到相关内容"，绝不编造或推测。
2. **准确引用**：回答时尽量指出信息来源的文档章节或页面，方便用户进一步查阅。
3. **区分相似概念**：注意区分同名但不同上下文的方法、属性或配置项（如范围广播 vs 点对点发送）。
4. 回答使用中文，简洁清晰。

## 示例与配置
- 鼓励给出代码片段和配置示例来辅助说明，帮助用户更直观地理解用法。
- 示例必须严格基于文档中的语法和 API，不要引入文档中不存在的字段、函数或写法。
- 可以根据文档内容组合出合理的示例，但要确保每个用到的元素都能在文档中找到依据。

## Shimmer 脚本语言
- Shimmer 是 ArcartX 自研的脚本语言，与 JavaScript、Lua、Python 等无关。
- Shimmer 的语法、内置函数、对象全部以文档为准，不要用其他语言的知识去类推或补充。

## UI 配置要点
- 波浪号 \`~\` 放在 YAML 属性值开头表示纯文本，不经过 Shimmer 解析。\`~\` 和脚本表达式互斥。
- 多行脚本使用 \`|-\`，不要用 \`>-\`。
- attribute 属性值每帧运算，避免在其中创建对象，应在事件回调中提前创建。

## 以下是 ArcartX 的文档内容：

`;

export function AIChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
                   bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25
                   flex items-center justify-center transition-all hover:scale-110"
        title="AI 助手"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      {open && <AIChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="thinking-shimmer text-xs text-fd-muted-foreground">思考中</div>
      <div className="flex gap-0.5">
        <span className="thinking-dot w-1 h-1 rounded-full bg-indigo-400" />
        <span className="thinking-dot w-1 h-1 rounded-full bg-indigo-400 [animation-delay:0.15s]" />
        <span className="thinking-dot w-1 h-1 rounded-full bg-indigo-400 [animation-delay:0.3s]" />
      </div>
      <style jsx>{`
        .thinking-shimmer {
          background: linear-gradient(
            90deg,
            hsl(var(--muted-foreground)) 0%,
            hsl(var(--muted-foreground) / 0.4) 40%,
            hsl(var(--muted-foreground)) 60%,
            hsl(var(--muted-foreground) / 0.4) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer-flow 2s ease-in-out infinite;
        }
        @keyframes shimmer-flow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .thinking-dot {
          animation: dot-pulse 0.8s ease-in-out infinite;
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="font-bold text-sm mt-2 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="font-semibold text-xs mt-2 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="font-medium text-xs mt-1.5 mb-0.5">{children}</h3>,
        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="pl-4 mb-1.5 space-y-0.5 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="pl-4 mb-1.5 space-y-0.5 list-decimal">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        code: ({ className, children }) => {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match?.[1] || '';
          const codeStr = String(children).replace(/\n$/, '');

          // 行内代码
          if (!match) {
            return <code className="px-1 py-0.5 rounded bg-black/20 text-[11px] font-mono text-indigo-300">{children}</code>;
          }

          // shimmer 自定义高亮
          if (lang === 'shimmer') {
            return (
              <pre className="my-1.5 p-3 rounded-md bg-[#1e1e1e] overflow-x-auto">
                <code className="text-[11px] font-mono leading-relaxed">
                  {highlightShimmer(codeStr)}
                </code>
              </pre>
            );
          }

          // 其他语言用 react-syntax-highlighter
          return (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={lang}
              customStyle={{
                margin: '0.375rem 0',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                fontSize: '11px',
                lineHeight: '1.6',
              }}
            >
              {codeStr}
            </SyntaxHighlighter>
          );
        },
        pre: ({ children }) => <>{children}</>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        a: ({ href, children }) => <a href={href} className="text-indigo-400 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-500/50 pl-2 my-1 text-fd-muted-foreground">{children}</blockquote>,
        table: ({ children }) => <div className="overflow-x-auto my-1.5"><table className="text-[11px] w-full">{children}</table></div>,
        th: ({ children }) => <th className="text-left px-2 py-1 border-b border-fd-border font-semibold">{children}</th>,
        td: ({ children }) => <td className="px-2 py-1 border-b border-fd-border/50">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const SHIMMER_RULES: Array<{ pattern: RegExp; className: string }> = [
  { pattern: /\/\/.*$/gm, className: 'text-[#6A9955]' },
  { pattern: /\/\*[\s\S]*?\*\//gm, className: 'text-[#6A9955]' },
  { pattern: /"""[\s\S]*?"""/gm, className: 'text-[#CE9178]' },
  { pattern: /"(?:[^"\\]|\\.)*"/gm, className: 'text-[#CE9178]' },
  { pattern: /'[^']*'/gm, className: 'text-[#CE9178]' },
  { pattern: /\b(if|else|elif|for|in|while|switch|case|break|next|return|range)\b/g, className: 'text-[#C586C0]' },
  { pattern: /\b(var|val|global|client|server|async)\b/g, className: 'text-[#569CD6]' },
  { pattern: /\b(self|tmp)\b/g, className: 'text-[#569CD6]' },
  { pattern: /\b(true|false)\b/g, className: 'text-[#569CD6]' },
  { pattern: /\b(Shimmer|Math)\b/g, className: 'text-[#4EC9B0]' },
  { pattern: /\b0[xX][0-9a-fA-F]+\b/g, className: 'text-[#B5CEA8]' },
  { pattern: /\b\d*\.\d+([eE][+-]?\d+)?\b/g, className: 'text-[#B5CEA8]' },
  { pattern: /\b\d+\b/g, className: 'text-[#B5CEA8]' },
  { pattern: /->|[=!<>~]=|~~|&&|\|\||[<>!+\-*/%]=?|\+\+|--/g, className: 'text-[#D4D4D4]' },
];

interface TokenSpan {
  start: number;
  end: number;
  className: string;
}

function highlightShimmer(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const tokens: TokenSpan[] = [];
    for (const rule of SHIMMER_RULES) {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        tokens.push({ start: m.index, end: m.index + m[0].length, className: rule.className });
      }
    }
    tokens.sort((a, b) => a.start - b.start);
    const filtered: TokenSpan[] = [];
    let lastEnd = 0;
    for (const t of tokens) {
      if (t.start >= lastEnd) {
        filtered.push(t);
        lastEnd = t.end;
      }
    }
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    for (const t of filtered) {
      if (t.start > cursor) {
        parts.push(<span key={`${lineIdx}-${cursor}`} className="text-[#D4D4D4]">{line.slice(cursor, t.start)}</span>);
      }
      parts.push(<span key={`${lineIdx}-${t.start}`} className={t.className}>{line.slice(t.start, t.end)}</span>);
      cursor = t.end;
    }
    if (cursor < line.length) {
      parts.push(<span key={`${lineIdx}-${cursor}`} className="text-[#D4D4D4]">{line.slice(cursor)}</span>);
    }
    return <div key={lineIdx}>{parts.length > 0 ? parts : ' '}</div>;
  });
}

interface DocChunk {
  title: string;
  url: string;
  content: string;
}

function parseDocsIntoChunks(fullText: string): DocChunk[] {
  const chunks: DocChunk[] = [];
  const sections = fullText.split(/\n---\n/);
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    const titleMatch = trimmed.match(/^## (.+)/m);
    const urlMatch = trimmed.match(/^URL: (.+)/m);
    const title = titleMatch?.[1] || '';
    const url = urlMatch?.[1] || '';
    const content = trimmed
      .replace(/^## .+\n?/, '')
      .replace(/^URL: .+\n?/, '')
      .trim();
    if (title || content) {
      chunks.push({ title, url, content });
    }
  }
  return chunks;
}

function searchRelevantChunks(chunks: DocChunk[], query: string, maxChars: number = 60000): DocChunk[] {
  const keywords: string[] = [];
  const cnChars = query.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  keywords.push(...cnChars);
  const enWords = query.match(/[a-zA-Z_][\w]*/g) || [];
  keywords.push(...enWords.map(w => w.toLowerCase()));

  if (keywords.length === 0) {
    let total = 0;
    const result: DocChunk[] = [];
    for (const chunk of chunks) {
      if (total + chunk.content.length > maxChars) break;
      result.push(chunk);
      total += chunk.content.length;
    }
    return result;
  }

  const scored = chunks.map(chunk => {
    const text = (chunk.title + ' ' + chunk.content).toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (chunk.title.toLowerCase().includes(kwLower)) score += 10;
      const matches = text.split(kwLower).length - 1;
      score += Math.min(matches, 5);
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const result: DocChunk[] = [];
  let total = 0;
  for (const { chunk, score } of scored) {
    if (score === 0) break;
    if (total + chunk.content.length > maxChars) continue;
    result.push(chunk);
    total += chunk.content.length;
  }
  return result;
}

function buildDocsContext(chunks: DocChunk[], query: string): string {
  const relevant = searchRelevantChunks(chunks, query);
  if (relevant.length === 0) return '（未找到相关文档内容）';
  return relevant.map(c => {
    const header = c.title ? `## ${c.title}` : '';
    const url = c.url ? `URL: ${c.url}` : '';
    return [header, url, '', c.content].filter(Boolean).join('\n');
  }).join('\n\n---\n\n');
}

function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<AIConfig>(loadConfig);
  const [showSettings, setShowSettings] = useState(() => !loadConfig().apiKey);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [docsChunks, setDocsChunks] = useState<DocChunk[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/llms-full.txt')
      .then(r => r.text())
      .then(text => setDocsChunks(parseDocsIntoChunks(text)))
      .catch(() => {
        fetch('/llms.txt')
          .then(r => r.text())
          .then(text => setDocsChunks([{ title: '索引', url: '', content: text }]))
          .catch(() => {});
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const fetchModels = useCallback(async () => {
    if (!config.baseUrl || !config.apiKey) return;
    setLoadingModels(true);
    setModelsError('');
    try {
      const url = normalizeUrl(config.baseUrl);
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${text ? ': ' + text.slice(0, 100) : ''}`);
      }
      const data = await res.json();
      const list: Model[] = (data.data || []).map((m: { id: string }) => ({ id: m.id }));
      list.sort((a, b) => a.id.localeCompare(b.id));
      setModels(list);
      if (list.length === 0) {
        setModelsError('返回了空的模型列表，请检查 API Key 权限');
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setModels([]);
      if (e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
        setModelsError('无法连接，可能是 CORS 跨域限制。请直接在下方手动输入模型名称。');
      } else if (e.message?.includes('<!doctype') || e.message?.includes('<!DOCTYPE')) {
        setModelsError('Base URL 不正确，请求未到达 API 服务。请检查地址是否正确（需包含 /v1）。');
      } else {
        setModelsError(e.message || '获取失败，请在下方手动输入模型名称');
      }
    } finally {
      setLoadingModels(false);
    }
  }, [config.baseUrl, config.apiKey]);

  const handleSaveConfig = () => {
    saveConfig(config);
    setShowSettings(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    if (!config.apiKey || !config.baseUrl || !config.model) {
      setShowSettings(true);
      return;
    }

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      abortRef.current = new AbortController();
      const url = normalizeUrl(config.baseUrl);
      const res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          stream: true,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT + buildDocsContext(docsChunks, text),
            },
            ...newMessages.slice(-10),
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: `请求失败: ${res.status} ${err.slice(0, 200)}` };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') break;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                setMessages(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    role: 'assistant',
                    content: copy[copy.length - 1].content + delta,
                  };
                  return copy;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (e.name !== 'AbortError') {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: `错误: ${e.message}` };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 w-[560px] flex flex-col
                    bg-fd-background border border-fd-border rounded-xl shadow-2xl overflow-hidden"
         style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fd-border bg-fd-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fd-foreground">AI 助手</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">BYOK</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleClear} className="p-1.5 rounded hover:bg-fd-muted text-fd-muted-foreground" title="清空对话">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded hover:bg-fd-muted text-fd-muted-foreground" title="设置">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-fd-muted text-fd-muted-foreground" title="关闭">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="p-4 border-b border-fd-border bg-fd-muted/20 space-y-3 shrink-0 overflow-y-auto max-h-[50vh]">
          <p className="text-[11px] text-fd-muted-foreground">所有请求从您的浏览器直接发送，本站不存储任何密钥。</p>
          <div>
            <label className="text-xs text-fd-muted-foreground mb-1 block">Base URL</label>
            <input
              type="text"
              placeholder="https://api.openai.com/v1"
              value={config.baseUrl}
              onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground/50"
            />
          </div>
          <div>
            <label className="text-xs text-fd-muted-foreground mb-1 block">API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={config.apiKey}
              onChange={e => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchModels}
              disabled={loadingModels || !config.baseUrl || !config.apiKey}
              className="px-3 py-1.5 text-xs rounded-md bg-fd-muted hover:bg-fd-muted/80 text-fd-foreground disabled:opacity-40"
            >
              {loadingModels ? '加载中...' : '获取模型列表'}
            </button>
          </div>
          {modelsError && (
            <p className="text-[11px] text-red-400">{modelsError}</p>
          )}
          {models.length > 0 && (
            <div>
              <label className="text-xs text-fd-muted-foreground mb-1 block">模型（从列表选择）</label>
              <select
                value={config.model}
                onChange={e => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-fd-border bg-fd-background text-fd-foreground"
              >
                <option value="">选择模型...</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-fd-muted-foreground mb-1 block">
              模型{models.length > 0 ? '（或手动输入）' : ''}
            </label>
            <input
              type="text"
              placeholder="doubao-1.5-pro-32k"
              value={config.model}
              onChange={e => setConfig({ ...config, model: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground/50"
            />
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={!config.baseUrl || !config.apiKey || !config.model}
            className="w-full py-1.5 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
          >
            保存配置
          </button>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.length === 0 && !showSettings && (
          <div className="text-center text-fd-muted-foreground text-xs py-12">
            <p className="text-sm mb-1">向 AI 助手提问关于 ArcartX 的任何问题</p>
            <p className="text-[11px] opacity-60">基于文档内容回答，使用您自己的 API Key</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white whitespace-pre-wrap'
                  : 'bg-fd-muted text-fd-foreground'
              }`}
            >
              {msg.role === 'user'
                ? msg.content
                : msg.content
                  ? <MarkdownMessage content={msg.content} />
                  : (streaming && i === messages.length - 1 ? <ThinkingIndicator /> : '')
              }
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-3 border-t border-fd-border shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入问题..."
            disabled={streaming}
            className="flex-1 px-3 py-2.5 text-sm rounded-md border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground/50 disabled:opacity-50"
          />
          {streaming ? (
            <button onClick={handleStop} className="px-4 py-2.5 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white">
              停止
            </button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-2.5 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40">
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
