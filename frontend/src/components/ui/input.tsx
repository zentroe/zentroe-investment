export const Input = ({ className = '', ...props }) => (

  <input
    {...props}
    className={`w-full px-3 py-4 border flex items-center border-gray-400 rounded-sm focus:outline-none focus:ring-primary focus:border-primary text-sm ${className || ""}`}
  />
);
