import { memo } from 'react'
import { FaGithub, FaTelegram } from 'react-icons/fa'

function FooterBase() {
  return (
    <footer className="mt-12 border border-black/10 bg-white/70 text-black shadow-[0_-2px_12px_rgba(0,0,0,0.12)] backdrop-blur-md transition-colors duration-300 supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-100 dark:supports-[backdrop-filter]:bg-neutral-900/50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-extrabold uppercase tracking-wide mb-4">
              About Project
            </h3>
            <p className="leading-relaxed text-lg">
            This small web page was created by ME using React.js. It provides real-time currency conversion rates fetched from a public API.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-extrabold uppercase tracking-wide mb-4">
              Created using
            </h3>
            <ul className="space-y-3 text-lg">
              <li>React.js</li>
              <li>Tailwind</li>
              <li>CSS</li>
              <li>Figma (for UI/UX)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-extrabold uppercase tracking-wide mb-4">
              Info
            </h3>
            <ul className="space-y-3 text-lg">
              <li>made on ~ 11.2025</li>
              <li>create for university</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-extrabold uppercase tracking-wide mb-4">
              Contacts
            </h3>
            <nav className="space-y-4">
              <a
                href="https://github.com/useasm"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-lg font-medium hover:opacity-90"
              >
                <FaGithub className="h-6 w-6 text-black dark:text-neutral-200" />
                <span>GitHub</span>
              </a>
              <a
                href="https://t.me/useasm"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-lg font-medium hover:opacity-90"
              >
                <FaTelegram className="h-6 w-6 text-[#229ED9]" />
                <span className="text-[#229ED9] dark:text-[#3ab4e8]">Telegram</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

const Footer = memo(FooterBase)
export default Footer
