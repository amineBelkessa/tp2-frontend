export const ErrorBanner = ({ message }: { message: string }) => {
  if (!message) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">
      {message}
    </div>
  );
};
