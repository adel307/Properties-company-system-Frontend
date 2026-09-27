'use client';

interface EntityTablePaginationProps {
    startIndex: number;
    pageSize: number;
    totalRows: number;
    currentPage: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
}

export function EntityTablePagination({
    startIndex,
    pageSize,
    totalRows,
    currentPage,
    totalPages,
    onPrevPage,
    onNextPage,
}: EntityTablePaginationProps) {
    if (totalRows <= pageSize) return null;

    return (
        <div className="py-3 px-6 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/40 text-xs">
            <span className="text-slate-400 font-mono">
                {startIndex + 1}-{Math.min(startIndex + pageSize, totalRows)} of {totalRows}
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                    title="Previous Page"
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-teal-400 hover:bg-slate-700 hover:text-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                </button>

                <button
                    type="button"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    title="Next Page"
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-teal-400 hover:bg-slate-700 hover:text-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}