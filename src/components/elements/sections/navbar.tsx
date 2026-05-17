"use client"
import { Button } from "@/components/ui/button";
import { BadgeCentIcon, Menu, X } from "lucide-react";
import { ModeToggle } from "../selectors/theme-selector";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return(
        <nav className="w-full border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
            <div className="flex items-center justify-between py-4 md:py-6 px-4 md:px-8">
                <a href="/" className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity">
                    <div className="flex items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 p-1.5 md:p-2">
                      <BadgeCentIcon className="size-4 md:size-5 text-primary-foreground" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">Cashly</div>
                </a>
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    <a href="#home" className="relative text-foreground/80 transition-colors duration-700 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:w-full after:origin-left after:scale-x-0 hover:text-foreground hover:after:scale-x-100 after:transition-transform after:duration-700 font-medium text-sm lg:text-base">Home</a>
                    <a href="#features" className="relative text-foreground/80 transition-colors duration-700 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:w-full after:origin-left after:scale-x-0 hover:text-foreground hover:after:scale-x-100 after:transition-transform after:duration-700 font-medium text-sm lg:text-base">Features</a>
                    <a href="#about" className="relative text-foreground/80 transition-colors duration-700 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:w-full after:origin-left after:scale-x-0 hover:text-foreground hover:after:scale-x-100 after:transition-transform after:duration-700 font-medium text-sm lg:text-base">About</a>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <ModeToggle />
                    <a href="/login" className="hidden sm:block">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm md:text-base">Login</Button>
                    </a>
                    <button 
                        onClick={toggleMenu}
                        className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm">
                    <div className="flex flex-col gap-4 px-4 py-4">
                        <a 
                            href="#home" 
                            onClick={closeMenu}
                            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
                        >
                            Home
                        </a>
                        <a 
                            href="#features" 
                            onClick={closeMenu}
                            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
                        >
                            Features
                        </a>
                        <a 
                            href="#about" 
                            onClick={closeMenu}
                            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
                        >
                            About
                        </a>
                        <a href="/login" className="sm:hidden">
                            <Button 
                                onClick={closeMenu}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full"
                            >
                                Login
                            </Button>
                        </a>
                    </div>
                </div>
    )}
        </nav>
    )}