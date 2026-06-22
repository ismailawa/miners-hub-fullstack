import React from 'react';

const Pagination: React.FC<{
    itemsPerPage: number;
    totalItems: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
}> = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Limit the number of page buttons shown
    const maxPageButtons = 5;
    let startPage: number, endPage: number;
    if (totalPages <= maxPageButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxPageButtons / 2);
        const maxPagesAfterCurrent = Math.ceil(maxPageButtons / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxPageButtons;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxPageButtons + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="mt-12 flex justify-center">
            <ul className="flex items-center space-x-1">
                <li>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 leading-tight text-text-secondary bg-secondary border border-border rounded-l-lg hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                </li>
                {startPage > 1 && (
                    <>
                        <li><button onClick={() => paginate(1)} className="px-4 py-2 leading-tight border border-border bg-secondary text-text-secondary hover:bg-border">1</button></li>
                        {startPage > 2 && <li className="px-4 py-2 leading-tight border border-border bg-secondary text-text-secondary">...</li>}
                    </>
                )}
                
                {pageNumbers.map(number => (
                    <li key={number}>
                        <button
                            onClick={() => paginate(number)}
                            className={`px-4 py-2 leading-tight border border-border ${
                                currentPage === number
                                    ? 'bg-accent text-accent-content'
                                    : 'bg-secondary text-text-secondary hover:bg-border'
                            }`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
                
                 {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <li className="px-4 py-2 leading-tight border border-border bg-secondary text-text-secondary">...</li>}
                        <li><button onClick={() => paginate(totalPages)} className="px-4 py-2 leading-tight border border-border bg-secondary text-text-secondary hover:bg-border">{totalPages}</button></li>
                    </>
                )}
                <li>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 leading-tight text-text-secondary bg-secondary border border-border rounded-r-lg hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;