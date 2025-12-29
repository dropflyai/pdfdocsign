import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">PDF Doc Sign</span>
            </Link>
            <p className="text-zinc-500 max-w-sm">
              Sign PDFs in seconds. Your documents stay private - they never leave your browser.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Start free trial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} PDF Doc Sign
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              className="text-zinc-600 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
