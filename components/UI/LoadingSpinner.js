import { FaSpinner } from "react-icons/fa";

const LoadingSpinner = ({ size = "md", className = "", color = "blue" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    blue: "text-blue-500",
    gray: "text-gray-500",
    white: "text-white",
    green: "text-green-500",
    red: "text-red-500",
  };

  return (
    <FaSpinner
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

export default LoadingSpinner;
