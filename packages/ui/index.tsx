import React from 'react';

export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className="px-4 py-2 rounded bg-blue-600 text-white" {...props}>{children}</button>
);

// Add more shared UI components here
