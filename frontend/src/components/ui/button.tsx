import { ButtonHTMLAttributes, ReactNode, useState } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export const Button = ({
  children,
  className = "",
  variant = "default",
  ...props
}: ButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const base = "px-4 py-3 rounded-sm font-medium transition-all duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-primary text-white hover:bg-[#8c391e]",
    outline: "border border-gray-400 text-darkPrimary bg-transparent",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) props.onClick(e);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150); // reset after animation
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`${base} ${variants[variant]} ${isClicked ? "scale-95" : "scale-100"} ${className}`}
    >
      {children}
    </button>
  );
};
