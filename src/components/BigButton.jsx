// src/components/BigButton.jsx — v8.4.0 (forwards className safely)
export default function BigButton({ children, className = '', ...props }) {
  return (
    <button
      className={`big-button ${className}`.trim()}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
