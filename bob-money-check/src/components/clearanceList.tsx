'use client';

interface ClearanceData {
    id: string;
    date: string;
}

interface ClearanceListProps {
    clearances: {
        success: boolean;
        message: string | ClearanceData[];
    };
}

export default function ClearanceList({ clearances }: ClearanceListProps) {
    if (!clearances.success) {
        const errorMessage = typeof clearances.message === 'string' ? clearances.message : 'An error occurred';
        return (
            <div className="w-full p-4 mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">{errorMessage}</p>
                </div>
            </div>
        );
    }

    const clearanceItems = clearances.message as ClearanceData[];

    if (!Array.isArray(clearanceItems) || clearanceItems.length === 0) {
        return (
            <div className="w-full p-4 mt-4 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">No clearances found</p>
                </div>
            </div>
        );
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="w-full mt-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-50">Your Clearances</h3>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700">
                {clearanceItems.map((item, index) => (
                    <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 ${index !== clearanceItems.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors dark:hover:bg-gray-900 duration-150`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">ID: {item.id}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-200">{formatDate(item.date)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 text-right">
                Total: {clearanceItems.length} clearance{clearanceItems.length !== 1 ? 's' : ''}
            </p>
        </div>
    );
}
