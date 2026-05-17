import { BadgeCentIcon } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="w-full border-t border-primary-foreground/20 bg-primary backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center rounded-lg bg-primary-foreground/10 p-2">
                                <BadgeCentIcon className="size-5 text-primary-foreground" />
                            </div>
                            <p className="text-lg font-bold text-primary-foreground">Cashly</p>
                        </div>
                        <p className="text-xs text-primary-foreground/70">A modern ledger for organized finances</p>
                    </div>

                    {/* Product */}
                    <div>
                        <p className="font-semibold text-primary-foreground mb-3 text-sm">Product</p>
                        <ul className="space-y-2 text-xs text-primary-foreground/70">
                            <li><a href="#features" className="hover:text-primary-foreground transition-colors">Features</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Pricing</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Security</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Updates</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <p className="font-semibold text-primary-foreground mb-3 text-sm">Company</p>
                        <ul className="space-y-2 text-xs text-primary-foreground/70">
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">About</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Blog</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Careers</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <p className="font-semibold text-primary-foreground mb-3 text-sm">Legal</p>
                        <ul className="space-y-2 text-xs text-primary-foreground/70">
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Privacy</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Terms</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">License</a></li>
                            <li><a href="/#" className="hover:text-primary-foreground transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-primary-foreground/20 pt-8">
                    <p className="text-xs text-primary-foreground/70 text-center">
                        © {currentYear} Cashly. All rights reserved. Built with ❤️ for better finances.
                    </p>
                </div>
            </div>
        </footer>
    );
}
