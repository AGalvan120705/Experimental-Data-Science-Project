import {Menu} from 'lucide-react'

const Header = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 p-4 flex items-center justify-start gap-3">
      <Menu className="w-6 h-6 text-gray-800" />
      <p className="font-bold text-black text-xl">SugarAware</p>
    </nav>
  );
};

export default Header;