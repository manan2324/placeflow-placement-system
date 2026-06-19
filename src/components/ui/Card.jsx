// components/ui/Card.jsx
export default function Card({ children, className = "", title, subtitle, ...props }) {
  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
