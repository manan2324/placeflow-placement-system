// components/ui/Button.jsx
export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
