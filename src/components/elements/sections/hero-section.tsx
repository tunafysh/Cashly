"use client"
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const dark = document.documentElement.classList.contains('dark');
        setIsDark(dark);

        const observer = new MutationObserver(() => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return(
        <div className="min-h-screen bg-linear-to-b from-primary/15 rounded-lg via-primary-15 to-background flex flex-col items-center justify-center px-4 md:px-8 py-12 pt-5 md:py-20" id="home">
            <div className="flex items-center gap-2 mb-4 md:mb-6 animate-pulse">
                <Sparkles className="size-4 md:size-5 text-primary" />
                <span className="text-xs md:text-sm font-semibold text-primary">Welcome to Cashly</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 md:mb-6 max-w-3xl bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
                A modern ledger for organized finances
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground text-center mb-8 md:mb-12 max-w-2xl px-2">
                Manage your finances with ease and precision. Track expenses, set budgets, and achieve your financial goals with a beautiful, intuitive interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-16 md:mb-20 w-full sm:w-auto">
                <a href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 md:px-8 w-full">
                        Get Started
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                </a>
                <a href="#features" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="font-semibold px-6 md:px-8 w-full">
                        Learn More
                    </Button>
                </a>
            </div>

            <div className="w-full max-w-6xl mt-12 md:mt-20 p-8 bg-primary rounded-lg">
                <div className="rounded-lg overflow-hidden border border-border/40 shadow-lg">
                    <Image 
                        src={isDark ? "/dashboard-dark.png" : "/dashboard-light.png"} 
                        alt="Dashboard" 
                        width={1200} 
                        height={600}
                        className="w-full h-auto"
                    />
                </div>
            </div>

            
        </div>
    )
}