import * as babel from "@babel/standalone";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function Page() {
  // localStorage'dan değeri al, yoksa default'u kullan
  const getInitialJsx = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jsx-converter-input");
      if (saved) return saved;
    }
    return `
<div style={{ color: 'red', fontSize: 32 }}>
  <h1>Hello</h1>
  <p>World</p>
</div>
    `;
  };

  const [jsx, setJsx] = useState(getInitialJsx());
  const [output, setOutput] = useState("");

  // JSX değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jsx-converter-input", jsx);
    }
  }, [jsx]);

  const handleConvert = () => {
    try {
      // JSX'i React.createElement çağrılarına çevir
      const compiled = babel.transform(jsx, {
        plugins: [
          [
            "transform-react-jsx",
            {
              pragma: "React.createElement",
            },
          ],
        ],
      }).code;

      // createElement fonksiyonu - satori format
      const createElement = (type, props, ...children) => {
        const element = {
          type,
          props: {
            ...(props || {}),
            children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children,
          },
        };

        // Eğer children undefined ise props'tan kaldır
        if (element.props.children === undefined) {
          delete element.props.children;
        }

        return element;
      };

      // React objesi oluştur
      const React = { createElement };

      // Kodu çalıştır ve sonucu al
      const result = new Function("React", `return ${compiled}`)(React);

      setOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setOutput("Error: " + e.message);
    }
  };

  return (
    <main className='grid grid-cols-2 gap-4 p-4 min-h-screen bg-gray-50 h-screen max-h-screen overflow-hidden'>
      <div className='flex flex-col bg-white rounded-lg p-6 shadow-sm h-full overflow-hidden'>
        <h2 className='text-xl font-bold mb-4 text-gray-800'>JSX Input</h2>
        <div className='flex-1 relative min-h-0 h-full overflow-hidden border border-gray-300 rounded-lg'>
          <textarea
            className='w-full h-full p-4 font-mono text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none'
            value={jsx}
            onChange={(e) => setJsx(e.target.value)}
            spellCheck={false}
            placeholder='Paste your JSX code here...'
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              lineHeight: "1.6",
              tabSize: 2,
              minHeight: "400px",
            }}
          />
        </div>
        <button
          className='mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium'
          onClick={handleConvert}
        >
          Convert to Object
        </button>
      </div>

      <div className='flex flex-col bg-white rounded-lg p-6 shadow-sm h-full overflow-hidden'>
        <h2 className='text-xl font-bold mb-4 text-gray-800'>React Element JSON Output (Satori Compatible)</h2>
        <div className='flex-1 relative min-h-0 h-full overflow-auto border border-gray-300 rounded-lg'>
          <SyntaxHighlighter
            language='json5'
            className='w-full h-full p-4 font-mono text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none'
            customStyle={{
              margin: 0,
              height: "100%",
              maxHeight: "none",
              overflow: "auto",
              borderRadius: "8px",
              fontSize: "14px",
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              },
            }}
          >
            {output || 'Click "Convert" to see the output...'}
          </SyntaxHighlighter>
        </div>
        {output && (
          <button
            className='mt-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium'
            onClick={() => navigator.clipboard.writeText(output)}
          >
            📋 Copy to Clipboard
          </button>
        )}
      </div>
    </main>
  );
}
