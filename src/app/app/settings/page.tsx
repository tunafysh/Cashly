import CurrencySelector from "@/components/elements/currency-selector";
import ExportCard from "@/components/elements/export-card";
import ImportCard from "@/components/elements/import-card";
import ThemeSelect from "@/components/elements/theme-selector";
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

export default function Settings() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="w-full grid grid-cols-2">
          <ImportCard />
          <ExportCard />
        </div>
        <Card className="@container/card mt-2">
          <CardHeader>
            <CardTitle className="font-bold text-lg">Settings</CardTitle>
            <CardDescription>
              Manage your application settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 gap-4 flex flex-col">
            <Item className="border border-border">
              <ItemContent>
                <ItemTitle>Theme</ItemTitle>
                <ItemDescription>
                  Choose between light and dark mode or system default.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ThemeSelect />
              </ItemActions>
            </Item>

            <Item className="border border-border">
              <ItemContent>
                <ItemTitle>Currency</ItemTitle>
                <ItemDescription>
                  Set your preferred currency for financial data display.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <CurrencySelector />
              </ItemActions>
            </Item>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
