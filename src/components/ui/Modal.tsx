import React from "react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div>{children}</div>

        <div className="mt-4 text-right">
          <Button className="bg-gray-500 hover:bg-gray-600" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};
