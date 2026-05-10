import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function BudgetBar() {
  const [budget, setBudget] = useState();

  // useEffect(() => {
  //     async () => {
  //         await fetch("")
  //     }
  // })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6"></CardContent>
    </Card>
  );
}
