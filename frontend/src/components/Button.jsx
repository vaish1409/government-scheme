import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-teal text-white',
  marigold: 'bg-marigold text-ink',
  outline: 'bg-white text-teal border-2 border-teal',
  ghost: 'bg-transparent text-teal',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  icon: Icon,
  fullWidth = true,
  type = 'button',
  disabled = false,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={`
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-2
        rounded-xl2 px-6 py-4 text-lg font-semibold font-display
        shadow-soft disabled:opacity-50 disabled:pointer-events-none
        transition-shadow
      `}
    >
      {Icon && <Icon size={22} strokeWidth={2.4} />}
      {children}
    </motion.button>
  );
}
