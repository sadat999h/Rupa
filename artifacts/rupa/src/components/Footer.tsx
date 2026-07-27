import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="font-serif text-3xl font-bold text-primary tracking-tight">Rupa</span>
              <span className="font-serif text-xl font-medium text-muted-foreground">রূপা</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              A digital bazaar celebrating Bangladeshi women's craft and cooking. Handmade beauty, home cooking, and sisterhood.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">The Bazaar</Link></li>
              <li><Link href="/recipes" className="text-muted-foreground hover:text-primary transition-colors">Home Kitchen</Link></li>
              <li><Link href="/sellers" className="text-muted-foreground hover:text-primary transition-colors">Our Artisans</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Account</h4>
            <ul className="space-y-4">
              <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Log In</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">Join as Artisan</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Rupa Marketplace. Empowering women entrepreneurs.</p>
          <div className="flex items-center gap-6">
            <span>Made with care in Dhaka</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
