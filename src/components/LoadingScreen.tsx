import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type RenderTip = {
  title: string;
  description: string;
  html: string;
  css: string;
};

const CODE_BLOCK = (label: string, code: string) => `/* ${label} */\n${code}`;

// Pretty-print helpers to make HTML/CSS easier to read
const formatHtml = (src: string) => {
  const s = src.replace(/></g, ">\n<").replace(/\n+/g, "\n").trim();
  const lines = s.split("\n");
  let indent = 0;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (/^<\//.test(trimmed)) indent = Math.max(indent - 1, 0);
      const pad = "  ".repeat(indent);
      const out = pad + trimmed;
      if (/^<[^/!][^>]*[^/]?>$/.test(trimmed) && !/^(<area|<br|<hr|<img|<input|<link|<meta)/i.test(trimmed)) {
        indent += 1;
      }
      return out;
    })
    .join("\n");
};

const formatCss = (src: string) => {
  const s = src
    .replace(/\{/g, "{\n")
    .replace(/;\s*/g, ";\n")
    .replace(/}\s*/g, "\n}\n")
    .replace(/\n+/g, "\n")
    .trim();
  const lines = s.split("\n");
  let indent = 0;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "}") indent = Math.max(indent - 1, 0);
      const pad = "  ".repeat(indent);
      const out = pad + trimmed;
      if (trimmed.endsWith("{")) indent += 1;
      return out;
    })
    .join("\n");
};

const tipSrcDoc = (tip: RenderTip) => `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <style>
      html,body{height:100%;margin:0}
      body{display:flex;align-items:center;justify-content:center;background:#f3f4f6}
      .frame{background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:12px;min-width:220px;min-height:100px}
      ${tip.css}
    </style>
  </head>
  <body>
    <div class=\"frame\">${tip.html}</div>
  </body>
</html>`;

const div = (cls = "demo", text = "Demo") => `<div class=\"${cls}\">${text}</div>`;
const img = (cls = "demo-img") =>
  `<img class=\"${cls}\" alt=\"img\" src=\"data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#60a5fa'/><stop offset='1' stop-color='#f472b6'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)' /><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-size='16'>IMG</text></svg>`
  )}\" />`;

const list = () => `<ul class=\"demo\"><li>Apple</li><li>Banana</li><li>Cherry</li></ul>`;
const gridItems = (n = 6) =>
  `<div class=\"demo-item\">1</div>`.repeat(n).replace(/>(\d+)</g, ">Item $1<");

// Curated property tips (~30)
const PROPERTY_TIPS: RenderTip[] = [
  { title: "color", description: "テキストの色を指定します。", html: div("demo", "Colored text"), css: `.demo{ color:#e11d48; font:16px/1.6 sans-serif; }` },
  { title: "background-color", description: "要素の背景色を指定します。", html: div("demo", "Background"), css: `.demo{ background:#fde68a; padding:16px; border-radius:8px; }` },
  { title: "font-size", description: "フォントサイズを指定します。", html: div("demo", "Big text"), css: `.demo{ font-size:24px; font-family:sans-serif; }` },
  { title: "font-weight", description: "文字の太さを指定します。", html: div("demo", "Bold"), css: `.demo{ font-weight:700; font-family:sans-serif; }` },
  { title: "line-height", description: "行の高さを指定します。", html: div("demo", "A\nB\nC"), css: `.demo{ white-space:pre-line; line-height:2; font-family:sans-serif; }` },
  { title: "letter-spacing", description: "文字間隔を調整します。", html: div("demo", "Spacing"), css: `.demo{ letter-spacing:.2em; font-family:sans-serif; }` },
  { title: "text-align", description: "テキストの配置を指定します。", html: div("demo", "Centered"), css: `.demo{ text-align:center; }` },
  { title: "text-decoration", description: "下線などの装飾を指定します。", html: `<a class=\"demo\" href=\"#\">Link</a>`, css: `.demo{ text-decoration:underline wavy #ef4444; }` },
  { title: "text-transform", description: "大文字・小文字の変換を指定します。", html: div("demo", "uppercase"), css: `.demo{ text-transform:uppercase; font-family:sans-serif; }` },
  { title: "white-space", description: "空白や改行の扱いを指定します。", html: div("demo", "preserve    spaces"), css: `.demo{ white-space:pre; font-family:monospace; }` },
  { title: "word-break", description: "単語の折り返し方法を指定します。", html: div("demo", "supercalifragilisticexpialidocious"), css: `.demo{ width:140px; word-break:break-all; border:1px solid #ddd; padding:8px; }` },
  { title: "overflow", description: "はみ出しの表示方法を制御します。", html: div("demo", "Overflow Overflow Overflow Overflow"), css: `.demo{ width:180px; height:48px; overflow:auto; border:1px solid #e5e7eb; }` },
  { title: "display:flex", description: "Flexで横並びにします。", html: `<div class=\"demo\"><span class=\"chip\">A</span><span class=\"chip\">B</span><span class=\"chip\">C</span></div>`, css: `.demo{ display:flex; gap:8px; } .chip{ background:#e5e7eb; padding:6px 10px; border-radius:9999px; }` },
  { title: "position:absolute", description: "バッジの位置を絶対配置します。", html: `<div class=\"demo card\">Card<div class=\"badge\">NEW</div></div>`, css: `.card{ position:relative; padding:16px; border:1px solid #ddd; border-radius:8px; } .badge{ position:absolute; top:-8px; right:-8px; background:#f43f5e; color:#fff; font:12px/1 sans-serif; padding:4px 6px; border-radius:6px; }` },
  { title: "z-index", description: "要素の重なり順序を指定します。", html: `<div class=\"wrap\"><div class=\"a\">A</div><div class=\"b\">B</div></div>`, css: `.wrap{ position:relative; height:80px } .a,.b{ position:absolute; top:10px; left:10px; width:80px; height:60px; display:flex; align-items:center; justify-content:center; color:#fff } .a{ background:#60a5fa; z-index:1 } .b{ background:#f97316; left:40px; z-index:2 }` },
  { title: "margin/padding", description: "余白を指定します。", html: div("demo", "Space"), css: `.demo{ margin:8px; padding:16px; border:1px dashed #9ca3af; }` },
  { title: "border / radius", description: "枠線と角丸の指定。", html: div("demo", "Rounded"), css: `.demo{ border:2px solid #34d399; border-radius:12px; padding:10px; }` },
  { title: "box-shadow", description: "影を付けます。", html: div("demo", "Shadow"), css: `.demo{ box-shadow:0 10px 30px rgba(0,0,0,.2); padding:14px; }` },
  { title: "opacity", description: "不透明度を指定します。", html: div("demo", "60%"), css: `.demo{ opacity:.6; background:#e5e7eb; padding:12px; }` },
  { title: "width/height", description: "サイズを指定します。", html: div("demo", "200×80"), css: `.demo{ width:200px; height:80px; background:#eef2ff; display:flex; align-items:center; justify-content:center; }` },
  { title: "object-fit:cover", description: "画像の収まり方を制御します。", html: img("demo"), css: `.demo{ width:200px; height:120px; object-fit:cover; border-radius:8px; }` },
  { title: "background-image/size/position", description: "グラデ背景と調整。", html: div("demo", "BG"), css: `.demo{ width:220px; height:100px; color:#fff; display:flex; align-items:center; justify-content:center; background-image:linear-gradient(135deg,#6366f1,#06b6d4); background-size:cover; background-position:center; }` },
  { title: "background-repeat", description: "背景の繰り返しを制御。", html: div("demo", "No-repeat"), css: `.demo{ width:220px; height:100px; background: url('data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='10' fill='%23a78bfa'/></svg>`)}') no-repeat 10px 10px, #fef3c7; }` },
  { title: "list-style", description: "リストのマーカー指定。", html: list(), css: `ul.demo{ list-style:square; padding-left:20px }` },
  { title: "transform:rotate", description: "要素を回転します。", html: div("demo", "Rotate"), css: `.demo{ transform:rotate(10deg); background:#fef3c7; padding:10px; display:inline-block }` },
  { title: "filter:grayscale", description: "画像をグレースケール化。", html: img("demo"), css: `.demo{ width:200px; height:120px; filter:grayscale(100%); }` },
  { title: "flex alignment", description: "中央揃えにする。", html: `<div class=\"demo\"><div class=\"inner\">Center</div></div>`, css: `.demo{ display:flex; align-items:center; justify-content:center; width:220px; height:100px; background:#e0f2fe; } .inner{ background:#bae6fd; padding:8px 12px; border-radius:6px; }` },
  { title: "grid", description: "Gridで整列。", html: `<div class=\"demo\">${gridItems(6)}</div>`, css: `.demo{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px } .demo-item{ background:#e5e7eb; padding:10px; text-align:center; border-radius:6px }` },
  { title: "visibility:hidden", description: "非表示(レイアウト保持)。", html: `<div class=\"demo\">Visible</div><div class=\"demo hidden\">Hidden</div>`, css: `.demo{ display:inline-block; padding:8px; background:#eef2ff; margin-right:8px } .hidden{ visibility:hidden }` },
  { title: "pointer-events:none", description: "ポインターの無効化。", html: `<button class=\"demo off\">Disabled</button> <button class=\"demo\">Enabled</button>`, css: `.demo{ padding:6px 10px; border-radius:6px; border:1px solid #ddd; background:#fff } .off{ pointer-events:none; opacity:.6 }` },
  { title: "aspect-ratio", description: "比率を固定。", html: `<div class=\"demo\"></div>`, css: `.demo{ aspect-ratio:16/9; width:220px; background:#fde68a; border-radius:6px }` },
  { title: "outline", description: "アウトラインを付与。", html: div("demo", "Outline"), css: `.demo{ outline:2px solid #4f46e5; outline-offset:2px; padding:8px }` },
  { title: "clip-path", description: "円形にくり抜き。", html: div("demo", ""), css: `.demo{ width:100px; height:100px; background:linear-gradient(135deg,#34d399,#22d3ee); clip-path:circle(50%); }` },
  { title: "backdrop-filter", description: "背景をぼかすガラス風。", html: `<div class=\"bg\"><div class=\"glass\">Glass</div></div>`, css: `.bg{ background: linear-gradient(135deg,#60a5fa,#f472b6); padding:16px; border-radius:8px } .glass{ backdrop-filter: blur(6px); background:rgba(255,255,255,.3); padding:10px 14px; border-radius:8px }` },
];

// こうしたい時に、こうする（20）
const HOWTO_TIPS: RenderTip[] = [
  { title: "中央にぴったり配置したい", description: "Flexの中央寄せを使います。", html: `<div class=\"demo\">Center</div>`, css: `.demo{ display:flex; align-items:center; justify-content:center; width:220px; height:100px; background:#e0f2fe; border-radius:8px }` },
  { title: "円形のアバターを作りたい", description: "画像に50%の角丸を適用します。", html: img("demo"), css: `.demo{ width:100px; height:100px; border-radius:50%; object-fit:cover }` },
  { title: "カードにドロップシャドウを付けたい", description: "box-shadowで柔らかい影を。", html: div("demo", "Card"), css: `.demo{ padding:16px; border-radius:12px; background:#fff; box-shadow:0 10px 30px rgba(0,0,0,.15) }` },
  { title: "ボタンをホバーで持ち上げたい", description: "transformとtransitionを組み合わせ。", html: `<button class=\"demo\">Hover me</button>`, css: `.demo{ padding:8px 14px; border:none; border-radius:8px; background:#6366f1; color:#fff; transition:transform .2s } .demo:hover{ transform: translateY(-3px) }` },
  { title: "固定ヘッダーを作りたい", description: "position:stickyで上部に固定。", html: `<div class=\"wrap\"><div class=\"demo\">Header</div><div style=\"height:80px\">Scroll</div></div>`, css: `.demo{ position:sticky; top:0; background:#fff; border-bottom:1px solid #e5e7eb; padding:8px }` },
  { title: "等間隔の2列カードを作りたい", description: "Gridのrepeatとgapで整列。", html: `<div class=\"demo\">${gridItems(4)}</div>`, css: `.demo{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px } .demo-item{ background:#f1f5f9; padding:10px; border-radius:8px; text-align:center }` },
  { title: "三角形をCSSだけで作りたい", description: "borderの片側だけを残す方法。", html: `<div class=\"demo\"></div>`, css: `.demo{ width:0; height:0; border-left:20px solid transparent; border-right:20px solid transparent; border-bottom:30px solid #fb7185 }` },
  { title: "小さな画面で1列、大きい画面で2列", description: "auto-fit + minmaxで実現。", html: `<div class=\"demo\">${gridItems(4)}</div>`, css: `.demo{ display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:8px } .demo-item{ background:#e5e7eb; padding:8px; border-radius:6px; text-align:center }` },
  { title: "テキストを省略記号で切りたい", description: "1行のellipsisを適用。", html: `<div class=\"demo\" style=\"width:180px\">とても長いテキストがここにあります。とても長いテキストがここにあります。</div>`, css: `.demo{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border:1px solid #e5e7eb; padding:6px }` },
  { title: "固定比率のサムネイルを作りたい", description: "aspect-ratioを指定。", html: `<div class=\"demo\"></div>`, css: `.demo{ aspect-ratio:1/1; width:120px; background:#c7d2fe; border-radius:8px }` },
  { title: "背景をぼかしてガラス風カード", description: "backdrop-filterで演出。", html: `<div class=\"bg\"><div class=\"demo\">Glass</div></div>`, css: `.bg{ background:linear-gradient(135deg,#60a5fa,#f472b6); padding:16px; border-radius:12px } .demo{ backdrop-filter: blur(6px); background:rgba(255,255,255,.3); padding:12px 16px; border-radius:10px }` },
  { title: "モーダルを中央に配置したい", description: "fixed+transformで中央寄せ。", html: `<div class=\"demo\">Modal</div>`, css: `.demo{ position:fixed; inset:0; margin:auto; width:200px; height:100px; background:#fff; border:1px solid #e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center }` },
  { title: "ボタンを無効化して見せたい", description: "opacityとpointer-eventsを併用。", html: `<button class=\"demo\">Disabled</button>`, css: `.demo{ opacity:.5; pointer-events:none; padding:8px 14px; border-radius:8px; border:1px solid #ddd }` },
  { title: "縦書きにしたい", description: "writing-modeを縦書きに。", html: `<div class=\"demo\">縦書きテキスト</div>`, css: `.demo{ writing-mode: vertical-rl; height:120px; border:1px solid #e5e7eb; padding:6px }` },
  { title: "バッジを右上に重ねたい", description: "relative + absolute配置。", html: `<div class=\"wrap\">Item<div class=\"demo\">NEW</div></div>`, css: `.wrap{ position:relative; width:120px; height:80px; border:1px solid #e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center } .demo{ position:absolute; top:-8px; right:-8px; background:#ef4444; color:#fff; font:12px/1 sans-serif; padding:4px 6px; border-radius:6px }` },
  { title: "画像をトリミングして見せたい", description: "object-fit:coverを利用。", html: img("demo"), css: `.demo{ width:160px; height:100px; object-fit:cover; border-radius:8px }` },
  { title: "テキストにグラデーションを付けたい", description: "背景クリップで実現。", html: `<div class=\"demo\">Gradient</div>`, css: `.demo{ font:700 28px/1 sans-serif; background:linear-gradient(90deg,#06b6d4,#8b5cf6); -webkit-background-clip:text; background-clip:text; color:transparent }` },
  { title: "スクロール領域に影を付けたい", description: "内側のshadowで上端に影。", html: `<div class=\"demo\">${"Line<br/>".repeat(8)}</div>`, css: `.demo{ width:220px; height:80px; overflow:auto; box-shadow: inset 0 8px 8px -8px rgba(0,0,0,.3); border:1px solid #e5e7eb; padding:8px }` },
  { title: "Gridで中央寄せしたい", description: "place-items:centerで中央揃え。", html: `<div class=\"demo\">${gridItems(4)}</div>`, css: `.demo{ display:grid; grid-template-columns:repeat(2,1fr); place-items:center; gap:8px } .demo-item{ background:#f1f5f9; padding:10px; border-radius:8px }` },
  { title: "吹き出しを作りたい", description: "角丸ボックス+三角形。", html: `<div class=\"demo\">Hello</div>`, css: `.demo{ position:relative; background:#fff; padding:10px 14px; border:1px solid #e5e7eb; border-radius:8px } .demo:after{ content:''; position:absolute; left:12px; bottom:-8px; border:8px solid transparent; border-top-color:#e5e7eb } .demo:before{ content:''; position:absolute; left:12px; bottom:-7px; border:7px solid transparent; border-top-color:#fff }` },
];

const ALL_TIPS: RenderTip[] = [...PROPERTY_TIPS, ...HOWTO_TIPS];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const LoadingScreen: React.FC<{ title?: string } & React.HTMLAttributes<HTMLDivElement>> = ({
  title,
  className = "",
}) => {
  const tip = useMemo(() => pickRandom(ALL_TIPS), []);
  const srcDoc = useMemo(() => tipSrcDoc(tip), [tip]);
  return (
    <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="animate-pulse text-3xl font-extrabold mb-6">{title ?? "Loading..."}</div>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-lg shadow p-6 text-left">
          <div className="text-base text-gray-500 mb-2">CSS TIP</div>
          <div className="text-2xl font-bold">{tip.title}</div>
          <p className="text-gray-700 mt-2 text-lg">{tip.description}</p>
          <pre className="bg-gray-900 text-gray-100 text-base leading-relaxed p-4 rounded mt-4 whitespace-pre-wrap break-words overflow-visible"><code>{CODE_BLOCK("HTML", formatHtml(tip.html))}</code></pre>
          <pre className="bg-gray-900 text-gray-100 text-base leading-relaxed p-4 rounded mt-4 whitespace-pre-wrap break-words overflow-visible"><code>{CODE_BLOCK("CSS", formatCss(tip.css))}</code></pre>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <iframe title="Tip Preview" sandbox="allow-scripts" srcDoc={srcDoc} className="w-full h-96 border-0 rounded" />
        </div>
      </div>
      <p className="mt-6 text-gray-500 text-base">ヒントはランダムに表示されます</p>
    </div>
  );
};

export const LoadingGate: React.FC<{
  ready: boolean;
  minDurationMs?: number;
  title?: string;
  children: React.ReactNode;
}> = ({ ready, minDurationMs = 5000, title, children }) => {
  const [minElapsed, setMinElapsed] = useState(false);
  const started = useRef(false);

  if (!started.current) {
    started.current = true;
  }

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), minDurationMs);
    return () => clearTimeout(t);
  }, [minDurationMs]);

  const canShowChildren = ready && minElapsed;

  if (!canShowChildren) {
    return <LoadingScreen title={title} />;
  }
  return <>{children}</>;
};

export const TipRotator: React.FC<{
  intervalMs?: number;
  title?: string;
  className?: string;
  wide?: boolean;
}> = ({ intervalMs = 15000, title = "CSS TIP", className = "", wide = false }) => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * ALL_TIPS.length));
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ALL_TIPS.length), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  const tip = ALL_TIPS[index];
  const srcDoc = useMemo(() => tipSrcDoc(tip), [tip]);
  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className={`w-full ${wide ? "max-w-none" : "max-w-5xl"} grid grid-cols-1 lg:grid-cols-2 gap-6 items-start`}>
        <div className="bg-white rounded-lg shadow p-6 text-left">
          <div className="text-2xl font-bold">{tip.title}</div>
          <p className="text-gray-700 mt-2 text-lg">{tip.description}</p>
          <pre className="mt-4 bg-gray-900 text-gray-100 text-base leading-relaxed p-4 rounded whitespace-pre-wrap break-words overflow-visible"><code>{CODE_BLOCK("HTML", formatHtml(tip.html))}</code></pre>
          <pre className="mt-4 bg-gray-900 text-gray-100 text-base leading-relaxed p-4 rounded whitespace-pre-wrap break-words overflow-visible"><code>{CODE_BLOCK("CSS", formatCss(tip.css))}</code></pre>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <iframe title="Tip Preview" sandbox="allow-scripts" srcDoc={srcDoc} className="w-full h-96 border-0 rounded" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
