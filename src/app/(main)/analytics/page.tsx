import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><BarChart2 className="text-primary"/>Analytics</h1>
        <p className="text-muted-foreground">Discover insights about your wardrobe.</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardTitle>Coming Soon!</CardTitle>
          <CardDescription className="mt-2">
            We're working on bringing you powerful analytics.
            <br />
            Soon you'll see your most worn items, unused items, and more!
          </CardDescription>
        </Card>
    </div>
  );
}
