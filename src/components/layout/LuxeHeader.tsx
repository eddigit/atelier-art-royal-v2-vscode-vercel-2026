import Link from 'next/link';
import Image from 'next/image';

export default function LuxeHeader() {
  return (
    <header className="header-luxe">
      <div className="header-luxe__inner">
        {/* Logo */}
        <Link href="/" className="header-luxe__brand">
          <Image
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691cd26ea8838a859856a6b6/b5c892460_logo-dark-web.png"
            alt="Atelier Art Royal"
            width={180}
            height={50}
            className="header-luxe__logo"
            priority
          />
        </Link>

        {/* Séparateur + Drapeau */}
        <div className="header-luxe__separator" />
        <span className="header-luxe__flag" role="img" aria-label="Drapeau français" />
        
        {/* Navigation */}
        <nav className="header-luxe__nav">
          <Link href="/maison" className="header-luxe__link">La Maison</Link>
          <Link href="/catalog" className="header-luxe__link">Collections</Link>
          <Link href="/sur-mesure" className="header-luxe__link">Sur Mesure</Link>
          <Link href="/savoir-faire" className="header-luxe__link">Savoir-Faire</Link>
          <Link href="/contact" className="header-luxe__link">Contact</Link>
        </nav>

        {/* Actions */}
        <div className="header-luxe__actions">
          <Link href="/contact" className="hidden lg:block">
            <button className="btn-luxe btn-luxe--outline">Rendez-vous</button>
          </Link>
          <Link href="/auth/login">
            <button className="btn-luxe btn-luxe--primary">Espace Client</button>
          </Link>
        </div>
      </div>
    </header>
  );
}
