import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type CssTip = {
  property: string;
  description: string;
  example?: string;
};

const CSS_TIPS: CssTip[] = [
  { property: "color", description: "テキストの色を指定します。", example: "p { color: #333; }" },
  { property: "background-color", description: "要素の背景色を指定します。", example: "div { background-color: #f5f5f5; }" },
  { property: "font-size", description: "フォントサイズを指定します。", example: "h1 { font-size: 2rem; }" },
  { property: "font-weight", description: "文字の太さを指定します。", example: "strong { font-weight: 700; }" },
  { property: "font-family", description: "フォントの種類を指定します。", example: "body { font-family: sans-serif; }" },
  { property: "line-height", description: "行の高さを指定します。", example: "p { line-height: 1.6; }" },
  { property: "letter-spacing", description: "文字間隔を調整します。", example: ".logo { letter-spacing: .05em; }" },
  { property: "text-align", description: "テキストの配置を指定します。", example: "h2 { text-align: center; }" },
  { property: "text-decoration", description: "下線などの装飾を指定します。", example: "a { text-decoration: none; }" },
  { property: "text-transform", description: "大文字・小文字の変換を指定します。", example: "h3 { text-transform: uppercase; }" },
  { property: "white-space", description: "空白や改行の扱いを指定します。", example: ".code { white-space: pre; }" },
  { property: "word-break", description: "単語の折り返し方法を指定します。", example: ".wrap { word-break: break-all; }" },
  { property: "overflow", description: "はみ出しコンテンツの表示方法を制御します。", example: ".box { overflow: hidden; }" },
  { property: "overflow-x", description: "横方向のはみ出しを制御します。" },
  { property: "overflow-y", description: "縦方向のはみ出しを制御します。" },
  { property: "display", description: "要素の表示形式を指定します。", example: ".flex { display: flex; }" },
  { property: "position", description: "配置方法を指定します(static, relative, absolute, fixed, sticky)。" },
  { property: "top/right/bottom/left", description: "位置指定プロパティ。positionと併用します。" },
  { property: "z-index", description: "要素の重なり順序を指定します(位置指定要素に有効)。" },
  { property: "float", description: "要素を左右に回り込ませます(レガシー)。" },
  { property: "clear", description: "回り込みを解除する位置を指定します。" },
  { property: "margin", description: "外側の余白を指定します。", example: ".card { margin: 16px; }" },
  { property: "padding", description: "内側の余白を指定します。", example: ".card { padding: 16px; }" },
  { property: "border", description: "境界線を一括指定します。", example: ".panel { border: 1px solid #ddd; }" },
  { property: "border-radius", description: "角を丸くします。", example: ".avatar { border-radius: 50%; }" },
  { property: "box-shadow", description: "要素に影を付けます。", example: ".modal { box-shadow: 0 10px 30px rgba(0,0,0,.2); }" },
  { property: "opacity", description: "不透明度を設定します(0〜1)。", example: ".dim { opacity: .6; }" },
  { property: "width", description: "要素の幅を指定します。", example: ".img { width: 200px; }" },
  { property: "min-width", description: "最小幅を指定します。" },
  { property: "max-width", description: "最大幅を指定します。" },
  { property: "height", description: "要素の高さを指定します。" },
  { property: "min-height", description: "最小高さを指定します。" },
  { property: "max-height", description: "最大高さを指定します。" },
  { property: "object-fit", description: "置換要素の内容の収まり方を制御します。", example: "img { object-fit: cover; }" },
  { property: "background-image", description: "背景画像を指定します。", example: "body { background-image: url(bg.png); }" },
  { property: "background-size", description: "背景画像のサイズを指定します。", example: "body { background-size: cover; }" },
  { property: "background-position", description: "背景画像の位置を指定します。" },
  { property: "background-repeat", description: "背景画像の繰り返しを制御します。" },
  { property: "list-style", description: "リストのマーカーを一括指定します。", example: "ul { list-style: square; }" },
  { property: "cursor", description: "ホバー中のカーソル形状を指定します。", example: ".btn { cursor: pointer; }" },
  { property: "transition", description: "プロパティの変化にアニメーションを加えます。", example: ".btn { transition: transform .2s; }" },
  { property: "transform", description: "要素を変形します(translate/scale/rotate等)。", example: ".box { transform: rotate(10deg); }" },
  { property: "filter", description: "ぼかしや色調などの視覚効果を適用します。", example: "img { filter: grayscale(100%); }" },
  { property: "mix-blend-mode", description: "背景との合成方法を指定します。" },
  { property: "isolation", description: "新しい積層コンテキストを作成します。" },
  { property: "flex", description: "flexアイテムの伸縮を一括指定します。", example: ".item { flex: 1; }" },
  { property: "flex-direction", description: "主軸方向(row/column)を指定します。" },
  { property: "justify-content", description: "主軸方向の揃え方を指定します。" },
  { property: "align-items", description: "交差軸方向の揃え方を指定します。" },
  { property: "gap", description: "Flex/Gridの要素間の間隔を指定します。" },
  { property: "grid-template-columns", description: "Gridの列定義を指定します。", example: ".g { grid-template-columns: repeat(3, 1fr); }" },
  { property: "grid-template-rows", description: "Gridの行定義を指定します。" },
  { property: "grid-column", description: "アイテムの列方向の配置を指定します。" },
  { property: "grid-row", description: "アイテムの行方向の配置を指定します。" },
  { property: "place-items", description: "align-itemsとjustify-itemsの一括指定。" },
  { property: "object-position", description: "置換要素の表示位置を指定します。" },
  { property: "visibility", description: "表示・非表示(レイアウト保持)を制御します。" },
  { property: "pointer-events", description: "ポインターの反応可否を制御します。" },
  { property: "aspect-ratio", description: "要素の縦横比を指定します。", example: ".thumb { aspect-ratio: 16 / 9; }" },
  { property: "content", description: "疑似要素の内容を指定します。", example: "::before { content: '★'; }" },
  { property: "outline", description: "アウトライン(重ならない枠)を指定します。" },
  { property: "backdrop-filter", description: "要素背後にフィルタ効果を適用します。" },
  { property: "clip-path", description: "要素の表示領域を切り抜きます。", example: ".badge { clip-path: circle(50%); }" },
  { property: "mask-image", description: "マスク画像で表示領域を制御します。" },
  { property: "object-view-box", description: "置換要素の表示領域(実験的)。" },
  { property: "scroll-behavior", description: "スクロール挙動をスムーズにします。", example: "html { scroll-behavior: smooth; }" },
  { property: "user-select", description: "テキスト選択の可否を制御します。" },
  { property: "writing-mode", description: "縦書き/横書きを指定します。" },
];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const LoadingScreen: React.FC<{ title?: string } & React.HTMLAttributes<HTMLDivElement>> = ({
  title,
  className = "",
}) => {
  const tip = useMemo(() => pickRandom(CSS_TIPS), []);
  return (
    <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="animate-pulse text-2xl font-bold mb-4">{title ?? "Loading..."}</div>
      <div className="max-w-xl bg-white rounded-lg shadow p-4 text-left">
        <div className="text-sm text-gray-500 mb-1">CSS TIP</div>
        <div className="text-lg font-semibold">{tip.property}</div>
        <p className="text-gray-700 mt-1">{tip.description}</p>
        {tip.example && (
          <pre className="bg-gray-900 text-gray-100 text-sm p-3 rounded mt-3 overflow-auto"><code>{tip.example}</code></pre>
        )}
      </div>
      <p className="mt-6 text-gray-500 text-sm">ヒントはランダムに表示されます</p>
    </div>
  );
};

export const LoadingGate: React.FC<{
  ready: boolean;
  minDurationMs?: number;
  title?: string;
  children: React.ReactNode;
}> = ({ ready, minDurationMs = 3000, title, children }) => {
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

export default LoadingScreen;

