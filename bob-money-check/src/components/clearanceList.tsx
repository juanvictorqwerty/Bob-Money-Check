'use client';

interface ClearanceListProps {
    clearances: {
        success: boolean;
        message: string | { clearanceId: unknown }[];
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

    const clearanceItems = clearances.message as { clearanceId: unknown }[];

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

    // Extract all clearance IDs and split by comma to create individual items
    const allClearanceIds: string[] = [];
    clearanceItems.forEach((item) => {
        const idString = String(item.clearanceId);
        const ids = idString.split(',').map(id => id.trim()).filter(id => id);
        allClearanceIds.push(...ids);
    });

    if (allClearanceIds.length === 0) {
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

    return (
        <div className="w-full mt-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-50">Your Clearances</h3>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-600 dark:border-gray-500">
                {allClearanceIds.map((clearanceId, index) => (
                    <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 ${index !== allClearanceIds.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-800`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Clearance</p>
                                <p className="text-xs text-gray-500 dark:text-gray-100">ID: {clearanceId}</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 text-right dark:text-amber-100">
                Total: {allClearanceIds.length} clearance{allClearanceIds.length !== 1 ? 's' : ''}
            </p>
        </div>
    );
}
