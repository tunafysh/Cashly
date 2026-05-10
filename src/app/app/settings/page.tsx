import ExportCard from "@/components/elements/export-card";
import ImportCard from "@/components/elements/import-card";
import ThemeSelector from "@/components/elements/theme-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComputerIcon, MoonIcon, Sun, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { setTheme } = useTheme();
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
        <div className="w-full grid grid-cols-2">
          <ImportCard />
          <ExportCard />
        </div>
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your application settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <Item>
              <ItemContent>
                <ItemTitle>Theme</ItemTitle>
                <ItemDescription>
                  Choose between light and dark mode or system default.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ThemeSelector />
              </ItemActions>
            </Item>

            <Item>
              <ItemContent>
                <ItemTitle>Currency</ItemTitle>
                <ItemDescription>
                  Set your preferred currency for financial data display.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Select
                  onValueChange={(value) =>
                    console.log("Selected currency:", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue>USD</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="USD" className="rounded-lg">
                      USD - US Dollar
                    </SelectItem>
                    <SelectItem value="EUR" className="rounded-lg">
                      EUR - Euro
                    </SelectItem>
                    <SelectItem value="GBP" className="rounded-lg">
                      GBP - British Pound
                    </SelectItem>
                    <SelectItem value="JPY" className="rounded-lg">
                      JPY - Japanese Yen
                    </SelectItem>
                  </SelectContent>
                </Select>
              </ItemActions>
            </Item>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
