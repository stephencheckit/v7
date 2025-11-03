'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AIContent {
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
}

export default function AIContentEditor() {
    const router = useRouter();
    const [content, setContent] = useState<AIContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load current content
    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await fetch('/api/ai-content');
            if (response.ok) {
                const data = await response.json();
                setContent(data);
            } else {
                // Database not ready yet, use default content
                setContent({
                    brand_name: 'Checkit V7',
                    tagline: 'Stop wasting hours on checklists. Start with vision-based automation.',
                    description: 'Checkit V7 is an AI-powered operations management platform designed for food manufacturing, distribution centers, and quality control operations.',
                    target_industries: ['Food Manufacturing', 'Distribution Centers', 'QA/QC Operations'],
                    key_differentiators: ['AI-First Design', 'Operations-Focused', 'Compliance-Ready'],
                    pricing_model: 'Subscription',
                    pricing_amount: 499,
                    pricing_currency: 'USD',
                    pricing_includes: ['Unlimited forms', 'Unlimited users', 'AI vision & voice'],
                    keywords: ['AI form builder', 'operations management software'],
                    main_website: 'https://checkitv7.com',
                    parent_company_url: 'https://checkit.net',
                });
            }
        } catch (error) {
            console.error('Failed to fetch content:', error);
            // Use default content on error
            setContent({
                brand_name: 'Checkit V7',
                tagline: 'Stop wasting hours on checklists. Start with vision-based automation.',
                description: 'Checkit V7 is an AI-powered operations management platform designed for food manufacturing, distribution centers, and quality control operations.',
                target_industries: ['Food Manufacturing', 'Distribution Centers', 'QA/QC Operations'],
                key_differentiators: ['AI-First Design', 'Operations-Focused', 'Compliance-Ready'],
                pricing_model: 'Subscription',
                pricing_amount: 499,
                pricing_currency: 'USD',
                pricing_includes: ['Unlimited forms', 'Unlimited users', 'AI vision & voice'],
                keywords: ['AI form builder', 'operations management software'],
                main_website: 'https://checkitv7.com',
                parent_company_url: 'https://checkit.net',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!content) return;

        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/ai-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: '✅ Content saved successfully!' });
                setTimeout(() => {
                    router.push('/ai');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: '❌ Failed to save content' });
            }
        } catch (error) {
            console.error('Failed to save:', error);
            setMessage({ type: 'error', text: '❌ Error saving content' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof AIContent, value: any) => {
        if (!content) return;
        setContent({ ...content, [field]: value });
    };

    const addArrayItem = (field: keyof AIContent) => {
        if (!content) return;
        const currentArray = (content[field] as string[]) || [];
        updateField(field, [...currentArray, '']);
    };

    const removeArrayItem = (field: keyof AIContent, index: number) => {
        if (!content) return;
        const currentArray = (content[field] as string[]) || [];
        updateField(
            field,
            currentArray.filter((_, i) => i !== index)
        );
    };

    const updateArrayItem = (field: keyof AIContent, index: number, value: string) => {
        if (!content) return;
        const currentArray = [...(content[field] as string[])];
        currentArray[index] = value;
        updateField(field, currentArray);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-black">Loading editor...</p>
                </div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600">Failed to load content</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">
                    AI Content Editor
                </h1>
                <p className="text-black">
                    Edit your AI brand context - updates will be reflected on <code>/ai/</code> and <code>/ai/context.json</code>
                </p>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
                {/* Basic Info */}
                <section>
                    <h2 className="text-xl font-bold text-black mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Brand Name
                            </label>
                            <input
                                type="text"
                                value={content.brand_name}
                                onChange={(e) => updateField('brand_name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={content.tagline}
                                onChange={(e) => updateField('tagline', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Your value proposition in one sentence"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Description
                            </label>
                            <textarea
                                value={content.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="What is your product? Who is it for?"
                            />
                        </div>
                    </div>
                </section>

                {/* Target Industries */}
                <section>
                    <h2 className="text-xl font-bold text-black mb-4">Target Industries</h2>
                    <div className="space-y-2">
                        {content.target_industries.map((industry, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={industry}
                                    onChange={(e) => updateArrayItem('target_industries', index, e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Food Manufacturing"
                                />
                                <button
                                    onClick={() => removeArrayItem('target_industries', index)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('target_industries')}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            + Add Industry
                        </button>
                    </div>
                </section>

                {/* Key Differentiators */}
                <section>
                    <h2 className="text-xl font-bold text-black mb-4">Key Differentiators</h2>
                    <div className="space-y-2">
                        {content.key_differentiators.map((diff, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={diff}
                                    onChange={(e) => updateArrayItem('key_differentiators', index, e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="What makes you unique?"
                                />
                                <button
                                    onClick={() => removeArrayItem('key_differentiators', index)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('key_differentiators')}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            + Add Differentiator
                        </button>
                    </div>
                </section>

                {/* Pricing */}
                <section>
                    <h2 className="text-xl font-bold text-black mb-4">Pricing</h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Pricing Model
                            </label>
                            <input
                                type="text"
                                value={content.pricing_model}
                                onChange={(e) => updateField('pricing_model', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Subscription"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={content.pricing_amount}
                                onChange={(e) => updateField('pricing_amount', parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Currency
                            </label>
                            <input
                                type="text"
                                value={content.pricing_currency}
                                onChange={(e) => updateField('pricing_currency', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-2">
                            What's Included
                        </label>
                        <div className="space-y-2">
                            {content.pricing_includes.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateArrayItem('pricing_includes', index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Unlimited users"
                                    />
                                    <button
                                        onClick={() => removeArrayItem('pricing_includes', index)}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => addArrayItem('pricing_includes')}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                + Add Feature
                            </button>
                        </div>
                    </div>
                </section>

                {/* Keywords */}
                <section>
                    <h2 className="text-xl font-bold text-black mb-4">SEO Keywords</h2>
                    <div className="space-y-2">
                        {content.keywords.map((keyword, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => updateArrayItem('keywords', index, e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., AI form builder"
                                />
                                <button
                                    onClick={() => removeArrayItem('keywords', index)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('keywords')}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            + Add Keyword
                        </button>
                    </div>
                </section>

                {/* Links */}
                <section>
                    <h2 className="text-xl font-bold text-black mb-4">Important Links</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Main Website
                            </label>
                            <input
                                type="url"
                                value={content.main_website}
                                onChange={(e) => updateField('main_website', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Parent Company URL
                            </label>
                            <input
                                type="url"
                                value={content.parent_company_url}
                                onChange={(e) => updateField('parent_company_url', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 justify-between">
                <button
                    onClick={() => router.push('/ai')}
                    className="px-6 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/ai')}
                        className="px-6 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50"
                    >
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
}

