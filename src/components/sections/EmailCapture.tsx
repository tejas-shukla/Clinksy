export function EmailCapture() {
  return (
    <section className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow">Early access</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              Be the first
              <br />
              through the door.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              Clinkeys is in early access. Drop your email and we&apos;ll let
              you know the moment we open up — plus a few useful guides while
              you wait.
            </p>
          </div>

          <div className="md:col-span-7">
            <form
              action="/api/signup"
              method="POST"
              aria-label="Early access email signup"
              className="flex flex-col gap-3"
            >
              <input type="hidden" name="source" value="homepage" />
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="flex items-center gap-3 border-b border-ink/30 pb-2 focus-within:border-ink">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="flex-1 bg-transparent py-2 text-base text-ink placeholder:text-ink/35 focus:outline-none"
                />
                <button type="submit" className="btn-solid">
                  Get early access
                </button>
              </div>
              <p className="text-xs text-ink/45">
                No spam. Unsubscribe in one click.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
