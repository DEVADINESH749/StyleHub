function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold">
            STYLE<span className="text-indigo-400">HUB</span>
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
            Discover modern fashion and everyday styles designed
            for your lifestyle.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Shop
          </h3>

          <div className="mt-4 space-y-3 text-sm text-gray-400">
            <a href="#products" className="block hover:text-white">
              All Products
            </a>

            <a href="#categories" className="block hover:text-white">
              Men
            </a>

            <a href="#categories" className="block hover:text-white">
              Women
            </a>

            <a href="#categories" className="block hover:text-white">
              Accessories
            </a>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Support
          </h3>

          <div className="mt-4 space-y-3 text-sm text-gray-400">
            <a href="#" className="block hover:text-white">
              Contact Us
            </a>

            <a href="#" className="block hover:text-white">
              Shipping
            </a>

            <a href="#" className="block hover:text-white">
              Returns
            </a>

            <a href="#" className="block hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Stay Updated
          </h3>

          <p className="mt-4 text-sm leading-6 text-gray-400">
            Get updates about new collections and offers.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <input
              type="email"
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
            />

            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-500"
            >
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-center text-xs text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">

          <p>
            © 2026 StyleHub. All rights reserved.
          </p>

          <p>
            Built with React + FastAPI
          </p>

        </div>
      </div>
    </footer>
  );
}

export default Footer;