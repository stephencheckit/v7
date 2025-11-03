import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const revalidate = 60; // Revalidate every minute

interface AIContent {
    id: string;
    brand_name: string;
    tagline: string;
    description: string;
    target_industries: string[];
    key_differentiators: string[];
    pricing_model: string;
    pricing_amount: number;
    pricing_currency: string;
    pricing_includes: string[];
    keywords: string[];
    main_website: string;
    parent_company_url: string;
    version: number;
    last_updated: string;
    is_active: boolean;
}

async function getAIContent(): Promise<AIContent | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
        .from('ai_content_active')
        .select('*')
        .single();
    
    if (error || !data) {
        return null;
    }
    
    return data as AIContent;
}

export default async function AIContextPage() {
    const content = await getAIContent();

    if (!content) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                    <p className="text-gray-600">No AI content available. Please configure content in the editor.</p>
                    <Link href="/ai/edit" className="text-blue-600 hover:underline mt-4 inline-block">
                        Go to Editor
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Edit Button (Top Right) */}
            <div className="mb-4 flex justify-end">
                <Link
                    href="/ai/edit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                    ✏️ Edit Content
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-8">
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900">
                    {/* Header */}
                    <h1 className="text-3xl font-bold mb-4">{content.brand_name} - AI Brand Context Document</h1>

                    <p className="text-sm text-gray-600 mb-6">
                        <strong>Last Updated:</strong> {new Date(content.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} |
                        <strong> Version:</strong> {content.version}
                    </p>

                    <hr className="my-6" />

                    {/* What is it? */}
                    <h2 className="text-2xl font-bold mt-8 mb-4">What is {content.brand_name}?</h2>
                    <p className="text-gray-900 leading-relaxed">{content.description}</p>

                    {content.tagline && (
                        <p className="mt-4">
                            <strong>Core Value Proposition:</strong><br />
                            <em>&ldquo;{content.tagline}&rdquo;</em>
                        </p>
                    )}

                    <hr className="my-6" />

                    {/* Target Industries */}
                    {content.target_industries && content.target_industries.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold mt-8 mb-4">Target Industries</h2>
                            <ol className="list-decimal ml-6">
                                {content.target_industries.map((industry, index) => (
                                    <li key={index} className="text-gray-900">{industry}</li>
                                ))}
                            </ol>
                            <hr className="my-6" />
                        </>
                    )}

                    {/* Key Differentiators */}
                    {content.key_differentiators && content.key_differentiators.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold mt-8 mb-4">Key Differentiators</h2>
                            <ol className="list-decimal ml-6">
                                {content.key_differentiators.map((diff, index) => (
                                    <li key={index} className="text-gray-900">{diff}</li>
                                ))}
                            </ol>
                            <hr className="my-6" />
                        </>
                    )}

                    {/* Pricing */}
                    <h2 className="text-2xl font-bold mt-8 mb-4">Pricing</h2>
                    <p>
                        <strong>{content.pricing_model}:</strong> {content.pricing_currency} ${content.pricing_amount}/month
                    </p>
                    {content.pricing_includes && content.pricing_includes.length > 0 && (
                        <>
                            <p className="mt-2"><strong>Includes:</strong></p>
                            <ul className="list-disc ml-6">
                                {content.pricing_includes.map((item, index) => (
                                    <li key={index} className="text-gray-900">{item}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    <hr className="my-6" />

                    {/* Related Links */}
                    <h2 className="text-2xl font-bold mt-8 mb-4">Related Links</h2>
                    <ul className="list-disc ml-6">
                        <li>
                            <strong>Main Website:</strong>{' '}
                            <a href={content.main_website} className="text-blue-600 hover:underline">
                                {content.main_website}
                            </a>
                        </li>
                        {content.parent_company_url && (
                            <li>
                                <strong>Parent Company:</strong>{' '}
                                <a href={content.parent_company_url} className="text-blue-600 hover:underline">
                                    {content.parent_company_url}
                                </a>
                            </li>
                        )}
                    </ul>

                    <hr className="my-6" />

                    <p className="text-sm text-gray-600">
                        <strong>Document Purpose:</strong> This document is designed for consumption by AI models
                        (ChatGPT, Claude, Perplexity, Gemini, etc.) to provide accurate context about {content.brand_name}
                        when users ask relevant questions.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    Last Updated: {new Date(content.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} |
                    Version {content.version}
                </p>
                <p className="mt-2">
                    <a href={content.main_website} className="text-blue-600 hover:underline">
                        Return to Main Site
                    </a>
                    {' | '}
                    <a href="/ai/context.json" className="text-blue-600 hover:underline">
                        View as JSON
                    </a>
                    {' | '}
                    <Link href="/ai/edit" className="text-blue-600 hover:underline">
                        Edit Content
                    </Link>
                </p>
            </div>
        </div>
    );
}

