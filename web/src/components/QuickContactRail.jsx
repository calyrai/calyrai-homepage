import React, { useState } from 'react'
import '../styles/quick-contact.css'

const CONTACT_LINKS = [
  {
    id: 'mail',
    label: 'Mail',
    icon: '✉',
    href: 'mailto:rupert.tscheliessnig@calyr.ai',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'WA',
    href: 'https://wa.me/?text=Hello%20Calyr.a%C3%AD',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
    href: 'https://www.linkedin.com',
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    icon: 'B',
    href: 'https://bsky.app',
  },
  {
    id: 'x',
    label: 'Twixxer',
    icon: 'X',
    href: 'https://x.com',
  },
]

export default function QuickContactRail() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <aside className={`quick-contact-rail ${isOpen ? 'open' : ''}`} aria-label="Quick contact links">
      <button
        className="quick-contact-tab"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="quick-contact-links"
      >
        Contact
      </button>

      <div className="quick-contact-links" id="quick-contact-links">
        {CONTACT_LINKS.map((item) => (
          <a
            key={item.id}
            className="quick-contact-link"
            href={item.href}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            title={item.label}
          >
            <span className="quick-contact-icon" aria-hidden="true">{item.icon}</span>
            <span className="quick-contact-label">{item.label}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}
