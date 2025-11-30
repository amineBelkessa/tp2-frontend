interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  return (
    <div className="flex gap-3 justify-center mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1 border rounded disabled:bg-gray-300"
      >
        Précédent
      </button>

      <span className="px-3 py-1 bg-gray-100 rounded">
        Page {page + 1} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
        className="px-3 py-1 border rounded disabled:bg-gray-300"
      >
        Suivant
      </button>
    </div>
  );
};
