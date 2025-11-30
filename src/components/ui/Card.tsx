import React from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      {children}
    </div>
  );
};
