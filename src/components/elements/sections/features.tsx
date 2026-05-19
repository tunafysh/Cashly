import { TrendingUp, Lock, Zap, BarChart3, PieChart, Bell } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: TrendingUp,
      title: "100% Free & Open",
      description: "No hidden fees or premium locks",
      details:
        "Completely transparent and open-source. Customize it for your needs.",
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instant updates across all devices",
      details:
        "Your data syncs instantly. Check your finances anywhere, anytime.",
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "Your data protected with encryption",
      details:
        "Military-grade encryption ensures your financial data stays private.",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Deep insights into your spending",
      details:
        "Visualize trends and patterns to make smarter financial decisions.",
    },
    {
      icon: PieChart,
      title: "Budget Planning",
      description: "Set and track your financial goals",
      details: "Create budgets by category and track progress in real-time.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified of important transactions",
      details:
        "Stay informed with customizable notifications when limits are reached.",
    },
  ];

  return (
    <>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 md:mb-6 max-w-3xl bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
        Features
      </h1>
      <p className="text-center text-muted-foreground mb-12 md:mb-16 max-w-2xl mx-auto px-4">
        Everything you need to manage your finances beautifully
      </p>
      <div className="w-full max-w-6xl rounded-xl border border-border/30 bg-linear-to-br from-primary/3 via-background to-background p-6 md:p-12 lg:p-16 shadow-2xl shadow-primary/5 mx-4 md:mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = [
              "from-emerald-500/15 to-emerald-500/5",
              "from-yellow-500/15 to-yellow-500/5",
              "from-blue-500/15 to-blue-500/5",
              "from-purple-500/15 to-purple-500/5",
              "from-pink-500/15 to-pink-500/5",
              "from-orange-500/15 to-orange-500/5",
            ];
            return (
              <div
                key={index}
                className={`group relative flex flex-col items-center text-center p-8 rounded-xl border border-border/40 bg-linear-to-br ${colors[index]} hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 overflow-hidden`}
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

                {/* Icon container */}
                <div className="mb-6 p-4 rounded-xl bg-linear-to-br from-primary/25 to-primary/10 group-hover:from-primary/35 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 relative z-10 shadow-lg shadow-primary/10">
                  <Icon className="size-8 md:size-10 text-primary" />
                </div>

                {/* Title */}
                <p className="text-xl md:text-lg font-bold text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">
                  {feature.title}
                </p>

                {/* Main description */}
                <p className="text-sm md:text-base text-muted-foreground mb-4 font-semibold relative z-10">
                  {feature.description}
                </p>

                {/* Detailed description */}
                <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed relative z-10 group-hover:text-muted-foreground transition-colors">
                  {feature.details}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-primary to-primary/50 w-0 group-hover:w-full transition-all duration-500 rounded-full" />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
