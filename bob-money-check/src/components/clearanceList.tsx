'use client';

interface ClearanceItem {
    clearanceId: unknown;
}

interface ClearanceListProps {
    clearances: {
        success: boolean;
        message: string | ClearanceItem[];
    };
}

export default function ClearanceList({ clearances }: ClearanceListProps) {
    if (!clearances.success) {
        const errorMessage = typeof clearances.message === 'string' ? clearances.message : 'An error occurred';
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                <p>{errorMessage}</p>
            </div>
        );
    }

    const clearanceItems = clearances.message as ClearanceItem[];

    if (!Array.isArray(clearanceItems) || clearanceItems.length === 0) {
        return (
            <div className="p-4 text-gray-500 bg-gray-50 rounded-lg">
                <p>No clearances found</p>
            </div>
        );
    }

    return (
        <div className="clearance-list">
            {clearanceItems.map((item, index) => (
                <div key={index} className="clearance-item p-2 border-b">
                    <span>Clearance ID: {String(item.clearanceId)}</span>
                </div>
            ))}
        </div>
    );
}
