export default function NavItem({ icon: Icon, label, href = "#", onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700/60 rounded-md transition-colors"
    >
      {Icon ? <Icon /> : null}
      {label}
    </a>
  );
}