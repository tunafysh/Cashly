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

export default function ThemeSelector() {
  const { setTheme } = useTheme();
  return (
    <Select onValueChange={setTheme}>
      <SelectTrigger>
        <SelectValue>
          <ComputerIcon className="mr-2" />
          System
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="light" className="rounded-lg">
          <SunIcon className="mr-2" />
          Light
        </SelectItem>
        <SelectItem value="dark" className="rounded-lg">
          <MoonIcon className="mr-2 rotate-180" />
          Dark
        </SelectItem>
        <SelectItem value="system" className="rounded-lg">
          <ComputerIcon className="mr-2" />
          System
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
