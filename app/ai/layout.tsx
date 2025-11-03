export default function AILayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner for human visitors */}
            <div className="bg-blue-600 text-white p-4 text-center">
                <p className="text-sm sm:text-base">
                    📖 This content is optimized for AI model consumption. Looking for our main site?{' '}
                    <a
                        href="https://checkitv7.com"
                        className="underline font-semibold hover:text-blue-100"
                    >
                        Visit checkitv7.com
                    </a>
                </p>
            </div>
            {children}
        </div>
    );
}

