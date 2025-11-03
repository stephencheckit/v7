import { readFileSync } from 'fs';
import path from 'path';

export default function AIContextPage() {
    // Read the markdown file
    const markdownPath = path.join(process.cwd(), 'public', 'ai', 'index.md');
    const markdownContent = readFileSync(markdownPath, 'utf-8');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm rounded-lg p-8">
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h1:text-3xl prose-h1:mb-4 prose-h1:text-gray-900
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-gray-900
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800
            prose-p:text-gray-900 prose-p:leading-relaxed
            prose-ul:list-disc prose-ul:ml-6
            prose-ol:list-decimal prose-ol:ml-6
            prose-li:text-gray-900
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
            prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-900"
          style={{ color: '#111827' }}
        >
          <pre className="whitespace-pre-wrap font-sans text-gray-900" style={{ color: '#111827' }}>{markdownContent}</pre>
        </div>
      </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    Last Updated: November 3, 2025 | Version 1.0
                </p>
                <p className="mt-2">
                    <a
                        href="https://checkitv7.com"
                        className="text-blue-600 hover:underline"
                    >
                        Return to Main Site
                    </a>
                    {' | '}
                    <a
                        href="/ai/context.json"
                        className="text-blue-600 hover:underline"
                    >
                        View as JSON
                    </a>
                </p>
            </div>
        </div>
    );
}

