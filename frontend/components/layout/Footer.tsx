import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    league: [
      { name: 'About Us', href: '/about' },
      { name: 'Teams', href: '/teams' },
      { name: 'Fixtures', href: '/matches' },
      { name: 'Standings', href: '/tables' },
      { name: 'Statistics', href: '/statistics' },
    ],
    community: [
      { name: 'News', href: '/news' },
      { name: 'Forums', href: '/forums' },
      { name: 'Predictions', href: '/predictions' },
      { name: 'Polls', href: '/polls' },
      { name: 'Gallery', href: '/media' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Sitemap', href: '/sitemap' },
    ],
  };

  return (
    <footer className="bg-background-dark text-text-inverse">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-2xl">
                ⚽
              </div>
              <div>
                <h3 className="font-bold text-lg">Sissala Sports Online</h3>
                <p className="text-sm text-text-tertiary">Upper West Region</p>
              </div>
            </div>
            <p className="text-sm text-text-tertiary mb-4">
              The premier football league bringing together the best teams from Sissala and surrounding communities.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-dark hover:bg-primary-green transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-dark hover:bg-accent-blue transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-dark hover:bg-accent-orange transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-dark hover:bg-status-error transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* League Links */}
          <div>
            <h4 className="font-bold mb-4">League</h4>
            <ul className="space-y-2">
              {footerLinks.league.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-primary-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="font-bold mb-4">Community</h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-primary-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-2 text-sm text-text-tertiary">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Tumu, Upper West Region<br />Ghana</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-tertiary">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+233123456789" className="hover:text-primary-yellow">
                  +233 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-tertiary">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:info@sissalaleague.com" className="hover:text-primary-yellow">
                  info@sissalaleague.com
                </a>
              </li>
            </ul>
            <h5 className="font-semibold text-sm mb-2">Support</h5>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-primary-yellow transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-dark">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-tertiary">
            <p>
              © {currentYear} Sissala Sports Online. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span>Made with ❤️ for Sissala</span>
              <Link href="/privacy" className="hover:text-primary-yellow">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary-yellow">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors Section (Optional) */}
      <div className="border-t border-surface-dark bg-surface-dark/50">
        <div className="container-custom py-6">
          <p className="text-xs text-center text-text-tertiary mb-4">Official Partners</p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-50">
            <div className="h-12 w-24 bg-text-tertiary/20 rounded"></div>
            <div className="h-12 w-24 bg-text-tertiary/20 rounded"></div>
            <div className="h-12 w-24 bg-text-tertiary/20 rounded"></div>
            <div className="h-12 w-24 bg-text-tertiary/20 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
