function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-950 text-white">
      <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">

        {/* Left Content */}
        <div className="max-w-xl">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
            New Collection 2026
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find Your
            <span className="block text-indigo-400">
              Perfect Style
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-300 sm:text-lg">
            Discover modern fashion pieces designed to make every
            day look better. Explore our latest collection and find
            something made for you.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <a
              href="#products"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
            >
              Shop Collection
            </a>

            <a
              href="#categories"
              className="rounded-xl border border-gray-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-gray-400 hover:bg-white/5"
            >
              Explore Categories
            </a>

          </div>

        </div>

        {/* Right Fashion Visual */}
        <div className="relative mx-auto w-full max-w-md md:max-w-none">

          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-600/30 blur-3xl" />

          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />

          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">

            <div className="text-center">

              <div className="text-8xl sm:text-9xl">
                👗
              </div>

              <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-gray-300">
                StyleHub
              </p>

              <p className="mt-2 text-2xl font-bold">
                New Season
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;