import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-md font-medium 
        bg-blue-600 text-white hover:bg-blue-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition duration-200
        ${className}
      `}
    >
      {children}
    </button>
  );
};
