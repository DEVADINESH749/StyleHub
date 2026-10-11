import { useState } from "react";

function Navbar({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ==================== LOGO ==================== */}
        <a
          href="#home"
          onClick={closeMenu}
          className="text-3xl font-bold tracking-tight text-gray-900"
        >
          STYLE<span className="text-indigo-600">HUB</span>
        </a>

        {/* ==================== DESKTOP NAVIGATION ==================== */}
        <nav className="hidden items-center gap-8 md:flex">

          {/* Home */}
          <a
            href="#home"
            className="text-base font-medium text-gray-700 transition hover:text-indigo-600"
          >
            Home
          </a>

          {/* Products */}
          <a
            href="#products"
            className="text-base font-medium text-gray-700 transition hover:text-indigo-600"
          >
            Products
          </a>

          {/* Categories */}
          <a
            href="#categories"
            className="text-base font-medium text-gray-700 transition hover:text-indigo-600"
          >
            Categories
          </a>

          {/* Orders */}
          <a
            href="#orders"
            className="text-base font-medium text-gray-700 transition hover:text-indigo-600"
          >
            Orders
          </a>

        </nav>

        {/* ==================== DESKTOP ACTIONS ==================== */}
        <div className="hidden items-center gap-4 md:flex">

          {/* ==================== SEARCH BUTTON ==================== */}
          <a
            href="#products"
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
            aria-label="Search products"
            title="Search Products"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </a>

          {/* ==================== CART BUTTON ==================== */}
          <a
            href="#cart"
            className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
            aria-label="Shopping Cart"
            title="Shopping Cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 4h13m-9 4a1 1 0 1 1-2 0m10 0a1 1 0 1 1-2 0"
              />
            </svg>

            {/* Cart Count */}
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </a>

          {/* ==================== PROFILE BUTTON ==================== */}
          <a
            href="#orders"
            className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
            aria-label="Profile"
            title="My Profile / Orders"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5-2v6m3-3h-6"
              />
            </svg>
          </a>

        </div>

        {/* ==================== MOBILE MENU BUTTON ==================== */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            /* X ICON */
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            /* MENU ICON */
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

      </div>

      {/* ==================== MOBILE NAVIGATION ==================== */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">

          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">

            {/* Mobile Home */}
            <a
              href="#home"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
            >
              Home
            </a>

            {/* Mobile Products */}
            <a
              href="#products"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
            >
              Products
            </a>

            {/* Mobile Categories */}
            <a
              href="#categories"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
            >
              Categories
            </a>

            {/* Mobile Orders */}
            <a
              href="#orders"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
            >
              Orders
            </a>

            {/* ==================== MOBILE ACTIONS ==================== */}
            <div className="mt-2 flex items-center gap-3 border-t border-gray-100 pt-3">

              {/* Mobile Cart */}
              <a
                href="#cart"
                onClick={closeMenu}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
              >
                <span>🛒</span>
                <span>Cart</span>

                {cartCount > 0 && (
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </a>

              {/* Mobile Profile */}
              <a
                href="#orders"
                onClick={closeMenu}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600"
              >
                <span>👤</span>
                <span>Profile</span>
              </a>

            </div>

          </nav>

        </div>
      )}
    </header>
  );
}

export default Navbar;