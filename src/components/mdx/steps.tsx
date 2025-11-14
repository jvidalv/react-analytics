"use client";

interface StepsProps {
  children: React.ReactNode;
}

export default function Steps({ children }: StepsProps) {
  return (
    <div className="steps-container relative space-y-6 border-l pl-6">
      {children}
    </div>
  );
}
