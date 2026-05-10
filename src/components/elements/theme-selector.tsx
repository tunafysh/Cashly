"use client";

import { ComputerIcon, SunIcon, MoonIcon } from "lucide-react";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "../ui/select";
import { useTheme } from "next-themes";

type Theme = "light" | "dark" | "system";

const themes = {
  light: { label: "Light", icon: SunIcon },
  dark: { label: "Dark", icon: MoonIcon },
  system: { label: "System", icon: ComputerIcon },
};

export default function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const stringtheme = theme as Theme;
  const SelectedIcon = themes[stringtheme]?.icon ?? ComputerIcon;

  return (
    <Select value={stringtheme} onValueChange={setTheme}>
      <SelectTrigger className="w-45">
        <div className="flex items-center gap-2">
          <SelectValue />
        </div>
      </SelectTrigger>

      <SelectContent className="rounded-xl">
        {Object.entries(themes).map(([value, { label, icon: Icon }]) => (
          <SelectItem
            key={value}
            value={value}
            className="rounded-lg flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
