import { Clock, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const info = [
  { icon: MapPin, label: "Location", value: "Lisbon Project Center" },
  { icon: Clock, label: "Open Hours", value: "Mon-Fri, 10:00-17:30" },
  { icon: Phone, label: "Contact", value: "+351 964 809 959" },
];

export function VisitUs() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <MapPin className="size-3.5 text-primary" />
            Lisbon Project · Admin Hub
          </Badge>
        </div>

        <h2 className="mt-5 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Visit us anytime during opening hours
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          Administrative and emotional support available in person. Simply show
          up anytime we're open — no appointment necessary.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {info.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center"
              >
                <div className="grid size-14 place-items-center rounded-full bg-accent text-primary">
                  <Icon className="size-6" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
