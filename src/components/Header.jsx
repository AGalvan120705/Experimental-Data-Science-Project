const Header = ({navbarWidth}) => {
  return (
    <header className="fixed top-0 right-0 z-40 bg-white shadow-sm backdrop-blur transition-all duration-300 px-6 flex items-center gap-4 h-20 border-b border-slate-200 " style={{ left: `${navbarWidth}px` }}>
      <div>      
        <p className="font-bold text-black text-xl">SugarAware</p>
        <p className="text-gray-500 text-sm">Type 2 Diabetes Awareness Platform</p>
      </div>
    </header>
  );
};

export default Header;