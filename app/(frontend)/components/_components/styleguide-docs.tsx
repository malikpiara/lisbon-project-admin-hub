import type { ReactNode } from "react";
import { Check, ChevronRight, Clock, Info, Plus, Search } from "lucide-react";

import { IconGallery } from "./icon-gallery";
import { ColorGrid } from "./color-grid";
import { defaultAdminData } from "@/lib/admin-default-data";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSchedule,
  CardService,
  CardShortcut,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Checkbox } from "@/components/ui/checkbox";
import { AgendaDemo } from "./agenda-demo";
import { CalendarDemo } from "./calendar-demo";
import { Icon } from "@/components/ui/icon";
import { Infobox } from "@/components/ui/infobox";
import { Input, InputPassword, InputSearch } from "@/components/ui/input";
import {
  ListItem,
  ListItemHeader,
  ListItemIcon,
  ListItemSubtitle,
  ListItemValue,
} from "@/components/ui/list-item";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectDemo } from "./select-demo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextBlock } from "@/components/ui/text-block";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AllContacts } from "@/components/home/all-contacts";
import { TopicsViewedChart } from "@/components/analytics/topics-viewed-chart";
import { Hero } from "@/components/home/hero";
import { MapVisit } from "@/components/home/map-visit";
import { QuickAccess } from "@/components/home/quick-access";
import { ServicesGrid } from "@/components/home/services-grid";
import { ArticleView } from "@/components/services/article-view";
import { KeyLinks } from "@/components/services/key-links";
import { ServiceHero } from "@/components/services/service-hero";
import { TopicsGrid } from "@/components/services/topics-grid";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

type Example = {
  title: string;
  description?: string;
  preview: ReactNode;
  code?: string;
  // Block-level examples (tables, lists) read wrong centered — use "start".
  align?: "center" | "start";
};

type ApiRow = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
};

// One API table per exported part (shadcn-style), e.g. Card / CardService.
type ApiSection = {
  title: string;
  description?: string;
  rows: ApiRow[];
};

// Astryx-style guidance rows: green Do / red Don't with a one-line practice.
type BestPractice = {
  kind: "do" | "dont";
  text: string;
};

type DocSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export type ComponentDoc = {
  slug: string;
  title: string;
  category: string;
  description: string;
  status?: string;
  preview: ReactNode;
  fullWidthPreview?: boolean;
  // Iframe height for full-width previews — size the window to the content:
  // short blocks small, tall pages large. Defaults to 640.
  previewHeight?: number;
  installation: string;
  importCode?: string;
  usage: string;
  usageCode?: string;
  composition: string[];
  // Optional ASCII part tree rendered as a code block above the bullets.
  compositionCode?: string;
  examples: Example[];
  api: ApiRow[];
  // When present, replaces the flat `api` table with one table per part.
  apiSections?: ApiSection[];
  // External references (e.g. the Base UI primitive a component wraps).
  links?: { label: string; href: string }[];
  // Where the component lives in the repo, shown under the title.
  source?: string;
  // Do/Don't guidance rendered as the Best practices table.
  bestPractices?: BestPractice[];
  // Foundation docs only: anchors into the preview (e.g. palette groups) for the
  // right rail, and prose guide sections that replace the component scaffolding.
  previewSections?: { id: string; label: string }[];
  guide?: DocSection[];
};

const familyService =
  defaultAdminData.services.find((service) => service.slug === "family-child-support") ??
  defaultAdminData.services[0];

const radii = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
] as const;

const buttonVariants = ["default", "secondary", "outline", "ghost", "menu", "destructive", "link"] as const;

// Every DS type level with its class recipe, as used on the real pages.
const TYPE_LEVELS = [
  { classes: "font-heading text-ds-xxxxl font-bold text-primary", sample: "Admin Hub", usage: "Page hero titles (home hero, article title)" },
  { classes: "font-heading text-ds-xxxl font-bold text-brand-dark", sample: "Services and Information", usage: "Section headings (article sections, home sections)" },
  { classes: "font-heading text-ds-xxl font-bold text-foreground", sample: "Frequently asked questions", usage: "Sub-page and doc headings" },
  { classes: "font-heading text-ds-xl font-bold text-foreground", sample: "Community Tips and Learning", usage: "Sub-section headings, admin editor titles" },
  { classes: "text-ds-l font-bold text-foreground", sample: "Connecting community members to external services.", usage: "Card titles, page descriptions" },
  { classes: "text-ds-m font-bold text-primary", sample: "Access to this service helps community members navigate with confidence.", usage: "Section leads, accordion titles" },
  { classes: "text-ds-s font-medium text-foreground", sample: "Information platform summarizing administrative processes, sharing tips and mapping services.", usage: "Body copy, button labels (bold)" },
  { classes: "text-ds-xs font-medium text-foreground", sample: "Requirements vary by organization, so confirm the list before your visit.", usage: "Article body copy, inputs (bold), table cells" },
  { classes: "text-ds-xxs font-medium text-foreground", sample: "Registered Charity Number: PT514543575", usage: "Tags, breadcrumbs, tooltips, captions" },
  { classes: "font-mono text-ds-xs text-muted-foreground", sample: "/services/family-child-support", usage: "Slugs, token labels, ids" },
] as const;

function TypographySpec() {
  return (
    <div className="space-y-8">
      {TYPE_LEVELS.map((level) => (
        <div key={level.classes} className="space-y-1.5">
          <p className={level.classes}>{level.sample}</p>
          <p className="font-mono text-ds-xxs text-muted-foreground">{level.classes}</p>
        </div>
      ))}
    </div>
  );
}

// px values straight from the --ds-text-*/--ds-leading-* tokens in
// app/globals.css (size/line-height at each breakpoint). Keep in sync.
const TYPE_SCALE = [
  { token: "text-ds-xxxxl", base: "30/30", md: "43/47", xl: "59/61", xxl: "60/62" },
  { token: "text-ds-xxxl", base: "25/30", md: "33/36", xl: "42/46", xxl: "42/47" },
  { token: "text-ds-xxl", base: "24/26", md: "31/38", xl: "40/44", xxl: "40/48" },
  { token: "text-ds-xl", base: "22/24", md: "28/32", xl: "28/36", xxl: "28/36" },
  { token: "text-ds-l", base: "19/23", md: "20/25", xl: "22/26", xxl: "22/26" },
  { token: "text-ds-m", base: "17/22", md: "17/22", xl: "18/23", xxl: "18/25" },
  { token: "text-ds-s", base: "16/24", md: "16/24", xl: "16/23", xxl: "16/23" },
  { token: "text-ds-xs", base: "15/20", md: "15/20", xl: "15/22", xxl: "15/22" },
  { token: "text-ds-xxs", base: "13/18", md: "13/18", xl: "13/18", xxl: "13/18" },
] as const;

function TypeScaleTable() {
  return (
    <div className="overflow-x-auto rounded-lg ring-2 ring-border">
      <table className="w-full min-w-[720px] text-left text-ds-xs">
        <thead className="border-b-2 border-border text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-bold">Token</th>
            <th className="px-4 py-3 font-bold">Mobile</th>
            <th className="px-4 py-3 font-bold">≥768</th>
            <th className="px-4 py-3 font-bold">≥1280</th>
            <th className="px-4 py-3 font-bold">≥1680</th>
            <th className="px-4 py-3 font-bold">Used for</th>
          </tr>
        </thead>
        <tbody>
          {TYPE_SCALE.map((row, i) => (
            <tr key={row.token} className="border-b-2 border-border last:border-b-0">
              <td className="px-4 py-3 font-mono text-ds-xxs font-bold text-foreground">{row.token}</td>
              <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">{row.base}</td>
              <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">{row.md}</td>
              <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">{row.xl}</td>
              <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">{row.xxl}</td>
              <td className="px-4 py-3 font-medium text-foreground">{TYPE_LEVELS[i]?.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RadiiSpec() {
  return (
    <div className="flex flex-wrap items-end gap-5">
      {radii.map((radius) => (
        <div key={radius} className="space-y-2 text-center">
          <div className={cn("size-20 bg-secondary ring-2 ring-border", radius)} />
          <p className="font-mono text-ds-xxs text-muted-foreground">{radius}</p>
        </div>
      ))}
    </div>
  );
}

function ButtonMatrix() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button>default</Button>
        <Button size="lg">lg</Button>
        <Button size="icon" aria-label="Add">
          <Plus />
        </Button>
        <Button size="icon" variant="secondary" aria-label="Search">
          <Search />
        </Button>
        <Button disabled>disabled</Button>
      </div>
    </div>
  );
}

function TagRow() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tag>Family Support</Tag>
      <Tag>Childcare</Tag>
      <Tag>Healthcare</Tag>
    </div>
  );
}

function CardExamples() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <p className="text-ds-xs font-bold text-muted-foreground">card-service</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CardService
            icon={<Icon name="users-group" />}
            title="Family Support"
            description="Tenancy, rights, and finding a place to live"
          />
          <CardService
            icon={<Icon name="briefcase-search" />}
            title="Employment"
            description="Job search, CV help, and training"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-ds-xs font-bold text-muted-foreground">card-shortcut</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardShortcut
            icon={<Icon name="notes" className="size-12" />}
            title="Read the guide"
            description="Step-by-step help for new arrivals."
            action={
              <Button size="sm">
                More info <ChevronRight />
              </Button>
            }
          />
          <CardShortcut
            icon={<Icon name="clock" className="size-12" />}
            title="Book a visit"
            description="See opening hours and plan ahead."
            action={
              <Button size="sm">
                More info <ChevronRight />
              </Button>
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-ds-xs font-bold text-muted-foreground">card-schedule</p>
        <CardSchedule
          icon={<Clock strokeWidth={1.9} />}
          title="Bridge Team Hours"
          className="max-w-sm"
          footer={
            <Infobox
              title="Outside these hours?"
              description="Message us on WhatsApp to arrange a time."
              action={
                <Button size="icon-sm" variant="secondary" aria-label="Open">
                  <ChevronRight />
                </Button>
              }
            />
          }
        >
          <ListItem>
            <ListItemIcon>
              <Check />
            </ListItemIcon>
            <ListItemSubtitle>Mon–Thu</ListItemSubtitle>
            <ListItemValue>10:00–12:30 / 14:00–17:30</ListItemValue>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Check />
            </ListItemIcon>
            <ListItemSubtitle>Friday</ListItemSubtitle>
            <ListItemValue>Until 19:30</ListItemValue>
          </ListItem>
          <ListItem className="border-b-0">
            <ListItemIcon>
              <Check />
            </ListItemIcon>
            <ListItemSubtitle>Saturday</ListItemSubtitle>
            <ListItemValue>Until 18:30</ListItemValue>
          </ListItem>
        </CardSchedule>
      </div>

      <div className="space-y-3">
        <p className="text-ds-xs font-bold text-muted-foreground">base card</p>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Generic surface</CardTitle>
            <CardDescription>
              The base bounded surface — compose headers, content, and footers.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-ds-xs font-medium text-foreground">
            Use CardService and CardShortcut for the DS patterns; the base Card
            for everything else.
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="secondary">
              Open
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function FormExamples() {
  return (
    <div className="grid max-w-xl gap-4">
      <Input placeholder="Search by organization, service, or email..." />
      <Input placeholder="Disabled input" disabled />
      <Input placeholder="Invalid value" aria-invalid />
      <Textarea placeholder="Write a message..." />
    </div>
  );
}

function TableExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Housing</TableCell>
          <TableCell>Ana Silva</TableCell>
          <TableCell><Tag>Active</Tag></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Legal aid</TableCell>
          <TableCell>Joao Pereira</TableCell>
          <TableCell><Tag>Pending</Tag></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// Two-column reference layout: a label/category column paired with a bulleted
// content column. Adapted from the "Documents Required" (Article 98) layout —
// the kind of dense reference content that doesn't fit a flat data grid.
function ReferenceTableExample() {
  return (
    <Table className="min-w-[680px]">
      <TableHeader>
        <TableRow>
          <TableHead
            colSpan={2}
            className="h-auto whitespace-normal bg-secondary/50 py-3 text-center text-ds-s font-bold uppercase tracking-wide text-primary"
          >
            Documents Required
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="w-1/4 border-r-2 border-border px-3 py-4 align-top font-bold whitespace-normal text-foreground">
            Article 98 n.1 — family outside national territory
          </TableCell>
          <TableCell className="px-3 py-4 align-top whitespace-normal text-brand-deep">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Residence permit of the individual residing in Portugal.</li>
              <li>Authenticated copy of the passport of the family member to be reunited.</li>
              <li>Properly authenticated evidence of the claimed family ties.</li>
              <li>Proof of means of subsistence.</li>
              <li>Criminal record from the country of nationality, duly authenticated.</li>
            </ul>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="w-1/4 border-r-2 border-border px-3 py-4 align-top font-bold whitespace-normal text-foreground">
            Article 98 n.2 — family in national territory
          </TableCell>
          <TableCell className="px-3 py-4 align-top whitespace-normal text-brand-deep">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Residence permit of the individual residing in national territory.</li>
              <li>Valid passport or another valid travel document.</li>
              <li>Proof of legal entry into Portugal.</li>
              <li>
                Declaration of the residential address. The form can be found{" "}
                <a href="#" className="font-bold text-primary underline">
                  here
                </a>
                .
                <ul className="mt-1.5 list-[circle] space-y-1.5 pl-5">
                  <li>If you are the owner, provide a land registry certificate.</li>
                  <li>If you are a tenant, a declaration from the landlord or hosting entity.</li>
                </ul>
              </li>
              <li>Proof of means of subsistence.</li>
            </ul>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

const sharedFoundationApi = [
  { name: "source", type: "CSS custom property", defaultValue: ":root", description: "Defined in app/globals.css and exposed through Tailwind theme aliases." },
  { name: "dark", type: "variant", defaultValue: "class scoped", description: "Dark mode variables are available through the local .dark scope." },
];

// DS: a selected checkbox/radio turns its label brand-600 + bold (text/selected token).
const selectionLabel =
  "text-ds-s font-medium text-foreground peer-data-[checked]:font-bold peer-data-[checked]:text-brand-link";

function CheckboxDemo() {
  return (
    <div className="space-y-3">
      <p className="text-ds-xxs font-medium text-muted-foreground">Primary</p>
      <label className="flex items-center gap-2">
        <Checkbox defaultChecked className="peer" />
        <span className={selectionLabel}>Email updates</span>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox className="peer" />
        <span className={selectionLabel}>SMS reminders</span>
      </label>
      <p className="pt-1 text-ds-xxs font-medium text-muted-foreground">Secondary</p>
      <label className="flex items-center gap-2">
        <Checkbox variant="secondary" defaultChecked className="peer" />
        <span className={selectionLabel}>Email updates</span>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox variant="secondary" className="peer" />
        <span className={selectionLabel}>SMS reminders</span>
      </label>
      <p className="pt-1 text-ds-xxs font-medium text-muted-foreground">States</p>
      <label className="flex items-center gap-2">
        <Checkbox disabled className="peer" />
        <span className={cn(selectionLabel, "peer-disabled:opacity-50")}>
          Disabled option
        </span>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox aria-invalid="true" className="peer" />
        <span className="text-ds-s font-medium text-destructive">
          Required (error)
        </span>
      </label>
    </div>
  );
}

function RadioDemo() {
  return (
    <RadioGroup defaultValue="weekly" className="gap-3">
      <label className="flex items-center gap-2">
        <RadioGroupItem value="weekly" className="peer" />
        <span className={selectionLabel}>Weekly digest</span>
      </label>
      <label className="flex items-center gap-2">
        <RadioGroupItem value="monthly" className="peer" />
        <span className={selectionLabel}>Monthly digest</span>
      </label>
      <label className="flex items-center gap-2">
        <RadioGroupItem value="never" disabled className="peer" />
        <span className={cn(selectionLabel, "peer-disabled:opacity-50")}>
          Never (disabled)
        </span>
      </label>
    </RadioGroup>
  );
}

function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Services</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Family &amp; Child Support</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function ListItemDemo() {
  const rows = [
    { label: "Family & Child Support", value: "Mon–Fri" },
    { label: "Housing Assistance", value: "By appointment" },
    { label: "Employment Services", value: "Tue, Thu" },
  ];
  return (
    <div className="max-w-md">
      <ListItemHeader>Opening hours</ListItemHeader>
      {rows.map((r) => (
        <ListItem key={r.label}>
          <ListItemIcon>
            <Check />
          </ListItemIcon>
          <ListItemSubtitle>{r.label}</ListItemSubtitle>
          <ListItemValue>{r.value}</ListItemValue>
        </ListItem>
      ))}
    </div>
  );
}

function InfoboxDemo() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Infobox
        title="Opening hours may vary"
        description="Check the calendar before visiting in person."
      />
      <Infobox
        title="New service available"
        description="Housing assistance applications are now open."
        action={
          <Button size="icon-sm" variant="secondary" aria-label="Open">
            <ChevronRight />
          </Button>
        }
      />
    </div>
  );
}

function TextBlockDemo() {
  return (
    <TextBlock
      category="Information"
      categoryIcon={<Info className="size-4" strokeWidth={2} />}
      title="Family & Child Support"
      lead="Guidance for parents and guardians navigating local services."
    >
      <p>
        The Lisbon Project connects families with trusted external services and
        internal resources across the city.
      </p>
      <p>
        Our team can help you understand processes, prepare documents, and find
        the right contacts for your situation.
      </p>
    </TextBlock>
  );
}

function InputAffixesDemo() {
  return (
    <div className="flex max-w-md flex-col gap-5">
      <div className="space-y-1.5">
        <label className="text-ds-xs font-medium text-foreground">Search</label>
        <InputSearch placeholder="Search services..." />
      </div>
      <div className="space-y-1.5">
        <label className="text-ds-xs font-medium text-foreground">Password</label>
        <InputPassword placeholder="Enter password" defaultValue="secret123" />
      </div>
    </div>
  );
}

const galleryPhoto = (color: string, label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='800' height='450' fill='${color}'/><text x='400' y='240' font-family='sans-serif' font-size='32' fill='white' text-anchor='middle' opacity='0.85'>${label}</text></svg>`
  );

function PhotoGalleryDemo() {
  const images = [
    { src: galleryPhoto("#1F8E87", "Photo 1"), alt: "Photo 1" },
    { src: galleryPhoto("#006DBD", "Photo 2"), alt: "Photo 2" },
    { src: galleryPhoto("#443FD9", "Photo 3"), alt: "Photo 3" },
  ];
  return <PhotoGallery images={images} className="max-w-2xl" />;
}

function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-4">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="secondary">Hover me</Button>}
          />
          <TooltipContent>Copies the hex value</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="icon" variant="ghost" aria-label="More info">
                <Info />
              </Button>
            }
          />
          <TooltipContent side="right">Shown to the right</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

function AccordionDemo() {
  const items = [
    { n: "01", title: "How do I register?", tag: "Getting started", body: "Visit the front desk with a photo ID. Our team will set up your account and walk you through the services available to you." },
    { n: "02", title: "What documents should I bring?", tag: "Documents", body: "Bring your passport or residence permit, plus any letters from services you are already working with." },
    { n: "03", title: "Where is the office?", tag: "Visit", body: "We are on Rua de São Bento, a short walk from the Rato metro. Opening hours are listed on the agenda." },
  ];
  return (
    <Accordion defaultValue={["01"]} className="max-w-2xl">
      {items.map((it) => (
        <AccordionItem key={it.n} value={it.n}>
          <AccordionTrigger number={it.n} tag={it.tag}>
            {it.title}
          </AccordionTrigger>
          <AccordionContent>{it.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    slug: "colors",
    title: "Colors",
    category: "Foundations",
    description: "The brand palette, plus the surface, text, border, and control tokens built from it.",
    preview: <ColorGrid />,
    installation: "Color tokens are global foundations. They do not need a component import.",
    usage: "Use semantic tokens first: primary, secondary, border, input, bg-page, bg-mint, brand-dark, and foreground.",
    composition: [
      "Use bg-page for full-page surfaces.",
      "Use card for contained surfaces and repeated items.",
      "Use border and input separately: border is the mint DS divider, input is the neutral field border.",
    ],
    previewSections: [
      { id: "brand", label: "Brand" },
      { id: "neutral", label: "Neutral" },
      { id: "project-areas", label: "Project areas" },
      { id: "status", label: "Status" },
      { id: "semantic", label: "Semantic" },
      { id: "component-tokens", label: "Component tokens" },
    ],
    guide: [
      {
        id: "how-to-use",
        title: "How to use",
        body: (
          <div className="max-w-3xl space-y-4 text-ds-s font-medium text-foreground">
            <p>
              The palette is layered. Reach for the most specific layer that
              fits, in this order:
            </p>
            <ol className="grid gap-3">
              <li className="rounded-lg bg-muted px-4 py-3">
                <span className="font-bold">Semantic roles first</span> —{" "}
                <span className="font-mono text-ds-xs">background/*</span>,{" "}
                <span className="font-mono text-ds-xs">text/*</span>,{" "}
                <span className="font-mono text-ds-xs">brand/*</span>, and{" "}
                <span className="font-mono text-ds-xs">positive</span>/
                <span className="font-mono text-ds-xs">negative</span>. They carry
                meaning and flip between light and dark on their own.
              </li>
              <li className="rounded-lg bg-muted px-4 py-3">
                <span className="font-bold">Primitives as a fallback</span> —{" "}
                <span className="font-mono text-ds-xs">brand-500</span>,{" "}
                <span className="font-mono text-ds-xs">neutral-700</span>, and the
                rest of the ramps. Use a raw stop only when no role fits.
              </li>
              <li className="rounded-lg bg-muted px-4 py-3">
                <span className="font-bold">Component tokens to fine-tune</span> —
                the per-component entries (button, input, card…) when you are
                styling that specific component.
              </li>
            </ol>
            <p>
              Click any swatch to copy its hex;{" "}
              <span className="font-mono text-ds-xs">⌥</span>-click (Alt) to copy
              its CSS variable instead. Hover a swatch for its variable and best
              text contrast. Build with tokens, never a pasted hex — that is what
              keeps light and dark in sync.
            </p>
          </div>
        ),
      },
      {
        id: "accessibility",
        title: "Accessibility",
        body: (
          <div className="max-w-3xl space-y-4 text-ds-s font-medium text-foreground">
            <p>
              Text contrast is measured against WCAG:{" "}
              <span className="font-bold">AAA</span> is 7:1 or better,{" "}
              <span className="font-bold">AA</span> is 4.5:1 for body text, and{" "}
              <span className="font-bold">AA Large</span> is 3:1 for text 18px and
              up or bold.
            </p>
            <p>
              Every colour can carry either dark or light text at AA or better, so
              a single swatch is never the whole story. Hover one to see which text
              colour works on it and the exact ratio.
            </p>
            <p>
              What matters is the pair you ship: verify the real background with
              the real text colour rather than trusting one swatch. And never lean
              on colour alone — pair project-area and status colours with a label
              or icon so the meaning survives for colour-blind readers.
            </p>
          </div>
        ),
      },
    ],
    examples: [],
    api: sharedFoundationApi,
  },
  {
    slug: "typography",
    title: "Typography",
    category: "Foundations",
    description: "Responsive Quicksand type scale for product UI, service pages, and content-heavy sections. Each level below shows its exact class recipe.",
    preview: <TypographySpec />,
    installation: "Typography is configured globally: Quicksand and JetBrains Mono load via next/font in the root layout, and the scale lives as --ds-text-*/--ds-leading-* tokens in app/globals.css.",
    usage: "Always size text with a text-ds-* token — never a raw Tailwind size (pnpm parity flags those). The tokens re-size themselves at 768 / 1280 / 1680px, so one class follows the Figma breakpoint scale.",
    composition: [],
    guide: [
      {
        id: "scale",
        title: "The scale",
        body: (
          <div className="max-w-4xl space-y-4">
            <p className="max-w-3xl text-ds-s font-medium text-foreground">
              Nine sizes, defined as size/line-height pairs (px) that step at
              three breakpoints. The values come from the DS token collection
              and are declared once in{" "}
              <span className="font-mono text-ds-xs">app/globals.css</span>.
            </p>
            <TypeScaleTable />
          </div>
        ),
      },
      {
        id: "families-weights",
        title: "Families & weights",
        body: (
          <div className="max-w-3xl space-y-4 text-ds-s font-medium text-foreground">
            <p>
              The DS uses a single family:{" "}
              <span className="font-bold">Quicksand</span>. It is both{" "}
              <span className="font-mono text-ds-xs">font-sans</span> (the
              default) and{" "}
              <span className="font-mono text-ds-xs">font-heading</span> — the
              alias exists so a display face could be swapped in later without
              touching components. <span className="font-bold">JetBrains
              Mono</span> (<span className="font-mono text-ds-xs">font-mono</span>)
              is for slugs, tokens, and ids.
            </p>
            <p>
              Two weights carry the whole system:{" "}
              <span className="font-bold">bold</span> for headings, titles,
              leads, buttons, and field text;{" "}
              <span className="font-medium">medium</span> for body and
              supporting copy. Do not introduce other weights.
            </p>
          </div>
        ),
      },
      {
        id: "how-to-choose",
        title: "How to choose a level",
        body: (
          <div className="max-w-3xl space-y-4 text-ds-s font-medium text-foreground">
            <p>
              Match the role, not the size: one{" "}
              <span className="font-mono text-ds-xs">text-ds-xxxxl</span> hero
              per page; <span className="font-mono text-ds-xs">text-ds-xxxl</span>{" "}
              for its sections; <span className="font-mono text-ds-xs">text-ds-m</span>{" "}
              bold teal for the lead line under a section heading;{" "}
              <span className="font-mono text-ds-xs">text-ds-xs</span> medium
              for article body; <span className="font-mono text-ds-xs">text-ds-xxs</span>{" "}
              for chrome (tags, breadcrumbs, tooltips, captions).
            </p>
            <p>
              Controls have fixed pairings — Button labels are{" "}
              <span className="font-mono text-ds-xs">text-ds-s font-bold</span>,
              Input/Select text is{" "}
              <span className="font-mono text-ds-xs">text-ds-xs font-bold</span>{" "}
              — the primitives apply these for you.
            </p>
          </div>
        ),
      },
    ],
    examples: [],
    api: [
      { name: "text-ds-*", type: "class", defaultValue: "responsive", description: "Breakpoint-driven DS size aliases (size + line-height together)." },
      { name: "font-heading", type: "class", defaultValue: "Quicksand", description: "Heading alias — same family as font-sans today, swappable later." },
      { name: "font-mono", type: "class", defaultValue: "JetBrains Mono", description: "Code, slugs, token labels, ids." },
    ],
  },
  {
    slug: "radii",
    title: "Radii",
    category: "Foundations",
    description: "Shared corner system for inputs, buttons, cards, and large page sections.",
    preview: <RadiiSpec />,
    installation: "Radius tokens are defined globally in app/globals.css.",
    usage: "Use 16px for controls and cards, 32px for hero icon tiles, and 56px for section panels.",
    composition: [
      "Controls (button, input, tag): rounded-lg (16px).",
      "Cards: rounded-lg (16px).",
      "Section panels: rounded-none below laptop → rounded-[3.5rem] (56px) at xl+.",
    ],
    examples: [],
    api: sharedFoundationApi,
  },
  {
    slug: "icons",
    title: "Iconography",
    category: "Foundations",
    source: "components/ui/icon.tsx · public/icons/ · lib/ds-icons-data.ts",
    description: "The Lisbon Project DS icon set — 82 filled icons exported from Figma, normalized to currentColor.",
    preview: <IconGallery />,
    installation: "Import the Icon component; icons live in public/icons and lib/ds-icons-data.ts. After changing SVGs in public/icons, regenerate the data file with: node scripts/gen-ds-icons-data.mjs",
    importCode: `import { Icon } from "@/components/ui/icon"`,
    usage: `Use <Icon name="call-solo" /> wherever a DS glyph is needed; it inherits text color and scales via className. Unknown names render nothing.`,
    composition: [
      "Each icon is an inline SVG normalized to currentColor, exported from the Figma DS iconography page.",
      "Color with text-* utilities; size with size-* on the Icon (defaults to 24px).",
      "Names mirror the Figma set (e.g. call-solo, briefcase-search, ui-arrow-right).",
      "tip, heart-open, user-plus, and internal-link only exist at 56px in the DS — their gallery copies carry a locally normalized stroke so they match the 24px set at equal render size.",
    ],
    examples: [],
    api: sharedFoundationApi,
  },
  {
    slug: "button",
    title: "Button",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Reserve the default (primary) variant for the single most important action in a view — secondary and ghost carry the rest." },
      { kind: "do", text: "Label with the action itself (“Donate”, “Save changes”), never “Click here”." },
      { kind: "do", text: "Give icon-only buttons an aria-label." },
      { kind: "dont", text: "Use a Button for navigation — use a Link, styled with buttonVariants when it must look like a button." },
      { kind: "dont", text: "Rely on the destructive variant alone for irreversible actions — pair it with a confirmation step, as the admin delete flows do." },
    ],
    source: "components/ui/button.tsx",
    description: "The main control for triggering an action — DS priorities (primary, secondary, tertiary, menu), optional icons, and four heights.",
    links: [
      { label: "Base UI Button", href: "https://base-ui.com/react/components/button" },
    ],
    preview: <ButtonMatrix />,
    installation: "Import Button from the local UI primitive. It wraps the Base UI Button and styles it with the DS button variants.",
    importCode: `import { Button } from "@/components/ui/button"`,
    usage: "Use Button for commands — things that do something. For navigation, use a Link; when a link must look like a button (e.g. the Donate CTA in the header), style it with buttonVariants instead of nesting a button in a link.",
    usageCode: `<Button>Donate</Button>\n\n// A link styled as a button (the pattern used by the site header):\nimport { buttonVariants } from "@/components/ui/button"\n\n<Link href="/donate" className={buttonVariants({ size: "lg" })}>\n  Donate\n</Link>`,
    composition: [
      "default, lg, and icon buttons are 44px high with 16px radius; sm is 40px, xs is 32px.",
      "Variants map to the DS button set: default = button-primary, secondary = button-secondary (white, brand-300 border), ghost = button-tertiary (text-only), menu = button-menu (nav item), plus outline, destructive, and link.",
      "SVG children are auto-sized (16px at default size) — no size classes needed on icons.",
      "All other props (type, onClick, aria-*, render, …) forward to the Base UI Button.",
    ],
    examples: [
      {
        title: "Sizes",
        description: "Use xs (32px) and sm (40px) in dense admin toolbars; default and lg are both 44px — lg only adjusts padding when an icon is marked data-icon.",
        preview: (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
          </div>
        ),
        code: `<Button size="xs">Extra small</Button>\n<Button size="sm">Small</Button>\n<Button>Default</Button>`,
      },
      {
        title: "Secondary & ghost",
        description: "Use variant=\"secondary\" (DS button-secondary) and variant=\"ghost\" (DS button-tertiary) for lower-priority actions.",
        preview: (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary">Reset</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        ),
        code: `<Button variant="secondary">Reset</Button>\n<Button variant="ghost">Cancel</Button>`,
      },
      {
        title: "Menu",
        description: "variant=\"menu\" is the DS nav item: teal label, mint fill on hover/press. Add data-selected for the selected state (white fill, brand-400 border).",
        preview: (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="menu">Services</Button>
            <Button variant="menu" data-selected="">
              Topics
            </Button>
          </div>
        ),
        code: `<Button variant="menu">Services</Button>\n<Button variant="menu" data-selected="">Topics</Button>`,
      },
      {
        title: "With icon",
        description: "Drop an SVG next to the label — it is auto-sized to 16px and gets a 8px gap at the default size.",
        preview: (
          <Button>
            Read article
            <ChevronRight />
          </Button>
        ),
        code: `<Button>\n  Read article\n  <ChevronRight />\n</Button>`,
      },
      {
        title: "Icon only",
        description: "size=\"icon\" keeps the 44px square hit area (icon-sm 40px, icon-xs 32px) — always pass an aria-label.",
        preview: (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
            <Button size="icon-sm" variant="secondary" aria-label="Search">
              <Search />
            </Button>
          </div>
        ),
        code: `<Button size="icon" aria-label="Add">\n  <Plus />\n</Button>\n<Button size="icon-sm" variant="secondary" aria-label="Search">\n  <Search />\n</Button>`,
      },
      {
        title: "Disabled",
        description: "Disabled buttons keep DS-specific fills per variant (e.g. brand-100 for primary) instead of a generic opacity fade.",
        preview: <Button disabled>Disabled</Button>,
        code: `<Button disabled>Disabled</Button>`,
      },
    ],
    api: [],
    apiSections: [
      {
        title: "Button",
        description: "Wraps the Base UI Button — all native button props and Base UI props (e.g. render) are forwarded.",
        rows: [
          { name: "variant", type: "default | secondary | outline | ghost | menu | destructive | link", defaultValue: "default", description: "Visual treatment, mapping to the DS button set." },
          { name: "size", type: "default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg", defaultValue: "default", description: "Height and padding: xs 32px, sm 40px, default/lg/icon 44px; icon-* are square." },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "Locks interaction; per-variant disabled fills." },
          { name: "className", type: "string", defaultValue: "-", description: "Merged after the variant classes via cn()." },
        ],
      },
      {
        title: "buttonVariants",
        description: "The cva() class builder, exported for styling non-button elements (links) as buttons.",
        rows: [
          { name: "buttonVariants({ variant, size, className })", type: "(options) => string", defaultValue: "-", description: "Returns the class string for the given variant/size — use on <Link> or <a>." },
        ],
      },
    ],
  },
  {
    slug: "tag",
    title: "Tag",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Keep the label to one or two words." },
      { kind: "dont", text: "Invent colour or size variants — the DS ships exactly one Tag style, by design." },
    ],
    source: "components/ui/tag.tsx",
    description: "A small pill that labels a category or piece of metadata. One variant, by design.",
    preview: <TagRow />,
    installation: "Import Tag from the local UI primitive.",
    importCode: `import { Tag } from "@/components/ui/tag"`,
    usage: "Use a Tag for a short category or status inside tables, cards, and metadata rows.",
    usageCode: `<Tag>Family Support</Tag>`,
    composition: [
      "32px minimum height, fully-rounded pill.",
      "2px brand-200 border with brand-800 bold 13px text — one consistent style, by design (the DS has no colour or size variants for Tag).",
      "An SVG child is auto-sized to 12px with a 4px gap — for a small leading icon.",
      "Keep the label to one or two words.",
    ],
    examples: [
      {
        title: "With icon",
        description: "Any SVG child is sized to 12px automatically.",
        preview: (
          <Tag>
            <Clock />
            Opening hours
          </Tag>
        ),
        code: `<Tag>\n  <Clock />\n  Opening hours\n</Tag>`,
      },
    ],
    api: [
      { name: "className", type: "string", defaultValue: "-", description: "Compose extra layout/spacing on the tag." },
      { name: "…span props", type: "React.ComponentProps<\"span\">", defaultValue: "-", description: "Tag renders a plain <span>; all span props are forwarded." },
    ],
  },
  {
    slug: "card",
    title: "Card",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Reach for the DS presets (CardService, CardShortcut, CardSchedule) before hand-building their patterns." },
      { kind: "dont", text: "Nest cards inside cards." },
      { kind: "dont", text: "Round cards with rounded-2xl or rounded-3xl — cards are 16px (rounded-lg); the 56px radius belongs to section panels." },
    ],
    source: "components/ui/card.tsx",
    description: "Bounded surface for repeated content — the generic slotted Card plus three DS presets: service row, shortcut, and schedule.",
    preview: <CardExamples />,
    installation: "Import card parts from the local UI primitive.",
    importCode: `import {\n  Card,\n  CardHeader,\n  CardTitle,\n  CardDescription,\n  CardAction,\n  CardContent,\n  CardFooter,\n  CardService,\n  CardShortcut,\n  CardSchedule,\n} from "@/components/ui/card"`,
    usageCode: `<Card>\n  <CardHeader>\n    <CardTitle>Emergency contacts</CardTitle>\n    <CardDescription>Help · 112</CardDescription>\n  </CardHeader>\n  <CardContent>…</CardContent>\n</Card>`,
    usage: "Use the slotted Card for custom layouts, and the DS presets for their patterns: CardService for icon-row links (home services grid), CardShortcut for the quick-access tiles, CardSchedule for opening-hours panels. Avoid nesting cards inside cards.",
    compositionCode: `Card\n├── CardHeader\n│   ├── CardTitle\n│   ├── CardDescription\n│   └── CardAction\n├── CardContent\n└── CardFooter\n\n// DS presets (self-contained, take props instead of children slots):\nCardService · CardShortcut · CardSchedule`,
    composition: [
      "Cards use a 16px radius (rounded-lg) and 2px mint border — never rounded-2xl/3xl.",
      "CardHeader, CardContent, and CardFooter share the same horizontal padding (16px, 24px at xl).",
      "Use size=\"sm\" on Card for denser admin lists — it tightens padding and drops CardTitle a step.",
      "A full-bleed <img> as first child is automatically rounded to the card's top corners.",
    ],
    examples: [],
    api: [],
    apiSections: [
      {
        title: "Card",
        description: "The generic container. CardHeader/CardTitle/CardDescription/CardAction/CardContent/CardFooter are slot divs that only take className.",
        rows: [
          { name: "size", type: "default | sm", defaultValue: "default", description: "sm tightens padding/gaps and shrinks CardTitle — for dense admin lists." },
          { name: "className", type: "string", defaultValue: "-", description: "All parts merge className via cn()." },
        ],
      },
      {
        title: "CardService",
        description: "DS card-service: horizontal row with a mint icon tile, title/description, and a trailing chevron.",
        rows: [
          { name: "icon", type: "ReactNode", defaultValue: "-", description: "Rendered in a 64px brand-100 tile; SVG auto-sized to 24px." },
          { name: "title", type: "ReactNode", defaultValue: "-", description: "Bold 19px row title." },
          { name: "description", type: "ReactNode", defaultValue: "-", description: "Medium 17px supporting line." },
          { name: "showChevron", type: "boolean", defaultValue: "true", description: "Trailing arrow; hide for non-navigational rows." },
        ],
      },
      {
        title: "CardShortcut",
        description: "DS card-shortcut: vertical tile with a large mint icon, title/description, and a primary action.",
        rows: [
          { name: "icon", type: "ReactNode", defaultValue: "-", description: "Large glyph, painted text-bg-mint; SVG auto-sized to 56px." },
          { name: "title", type: "ReactNode", defaultValue: "-", description: "Bold 19px tile title." },
          { name: "description", type: "ReactNode", defaultValue: "-", description: "Medium 17px supporting line." },
          { name: "action", type: "ReactNode", defaultValue: "-", description: "Bottom slot — typically a primary <Button>." },
        ],
      },
      {
        title: "CardSchedule",
        description: "DS card-schedule: icon + teal title header over schedule rows (pass ListItem rows as children), with an optional footer.",
        rows: [
          { name: "icon", type: "ReactNode", defaultValue: "-", description: "Header glyph (e.g. a clock); SVG auto-sized to 20px." },
          { name: "title", type: "ReactNode", defaultValue: "-", description: "Teal bold header title." },
          { name: "footer", type: "ReactNode", defaultValue: "-", description: "Bottom slot — typically an <Infobox>." },
          { name: "children", type: "ReactNode", defaultValue: "-", description: "The schedule rows (ListItem / ListItemHeader)." },
        ],
      },
    ],
  },
  {
    slug: "form-fields",
    title: "Form Fields",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Pair every field with a visible label; mark required fields with the teal asterisk." },
      { kind: "do", text: "Set aria-invalid on validation errors to trigger the destructive treatment." },
      { kind: "dont", text: "Rely on placeholder text as the only label — it disappears as soon as the user types." },
    ],
    source: "components/ui/input.tsx · components/ui/textarea.tsx",
    description: "Single-line inputs and multi-line textareas, with disabled and invalid states built in.",
    preview: <FormExamples />,
    installation: "Import Input and Textarea from local UI primitives.",
    importCode: `import { Input } from "@/components/ui/input"\nimport { Textarea } from "@/components/ui/textarea"`,
    usageCode: `<Input placeholder="Email address" />\n<Textarea placeholder="Message" />`,
    usage: "Use these controls for search, newsletter forms, admin editing, and filters.",
    composition: [
      "Input is 44px high with 16px radius and 2px neutral border; it wraps the Base UI Input.",
      "Textarea follows the same border/radius language, starts at 80px, and auto-grows with content (field-sizing-content).",
      "Both expose hover (darker border), focus (ring border), disabled (neutral-200 fill), and aria-invalid (destructive border) states.",
    ],
    examples: [
      {
        title: "With label",
        description: "There is no Field primitive — pair the control with a label block, marking required fields with a teal asterisk (the newsletter form's pattern).",
        preview: (
          <label className="block max-w-sm">
            <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
              Email <span className="text-primary">*</span>
            </span>
            <Input type="email" placeholder="Your Email" />
          </label>
        ),
        code: `<label className="block">\n  <span className="mb-1.5 block text-ds-xs font-medium text-foreground">\n    Email <span className="text-primary">*</span>\n  </span>\n  <Input type="email" placeholder="Your Email" />\n</label>`,
      },
      {
        title: "File",
        description: "type=\"file\" is styled out of the box.",
        preview: <Input type="file" className="max-w-sm" />,
        code: `<Input type="file" />`,
      },
      {
        title: "Disabled",
        preview: (
          <Input disabled placeholder="Disabled field" className="max-w-sm" />
        ),
        code: `<Input disabled placeholder="Disabled field" />`,
      },
      {
        title: "Invalid",
        description: "Set aria-invalid to apply the destructive validation treatment.",
        preview: (
          <Input aria-invalid placeholder="Invalid field" className="max-w-sm" />
        ),
        code: `<Input aria-invalid placeholder="Invalid field" />`,
      },
    ],
    api: [
      { name: "type", type: "string", defaultValue: "text", description: "Forwarded to the underlying input (email, number, file, …)." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Locks interaction and softens the surface." },
      { name: "aria-invalid", type: "boolean", defaultValue: "false", description: "Applies destructive validation treatment." },
      { name: "…input/textarea props", type: "native props", defaultValue: "-", description: "Everything else (value, onChange, placeholder, rows, …) is forwarded." },
    ],
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Use checkboxes for independent on/off options — any number can be selected at once." },
      { kind: "do", text: "Wrap the checkbox and its text in a <label> so the text is clickable." },
      { kind: "dont", text: "Use a checkbox when exactly one of a set must be chosen — that is the Radio group." },
    ],
    source: "components/ui/checkbox.tsx",
    description: "Turns an option on or off — pick any number, independently.",
    links: [
      { label: "Base UI Checkbox", href: "https://base-ui.com/react/components/checkbox" },
    ],
    preview: <CheckboxDemo />,
    installation: "Import Checkbox from the local UI primitive. It wraps the Base UI Checkbox and renders the DS check glyph.",
    importCode: `import { Checkbox } from "@/components/ui/checkbox"`,
    usageCode: `<Checkbox defaultChecked />\n<Checkbox variant="secondary" />`,
    usage: "Use checkboxes for multi-select opt-ins and standalone on/off settings.",
    composition: [
      "A 24px box with 4px radius and 2px border; checked = white fill, brand-600 border + check.",
      "Two levels: primary (default) and a lighter secondary (brand-100 fill, brand-300 border).",
      "Exposes hover, disabled, and aria-invalid (error) states.",
    ],
    examples: [
      {
        title: "Checkbox with label",
        preview: (
          <label className="flex items-center gap-2 text-ds-xs font-bold text-foreground">
            <Checkbox defaultChecked />
            Email updates
          </label>
        ),
        code: `<label className="flex items-center gap-2">\n  <Checkbox defaultChecked />\n  Email updates\n</label>`,
      },
    ],
    api: [
      { name: "variant", type: "primary | secondary", defaultValue: "primary", description: "Selection level; secondary is the lighter mint treatment." },
      { name: "defaultChecked", type: "boolean", defaultValue: "false", description: "Initial checked state (uncontrolled)." },
      { name: "checked / onCheckedChange", type: "boolean / (checked) => void", defaultValue: "-", description: "Controlled state, forwarded from Base UI Checkbox.Root." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Locks interaction at 50% opacity." },
      { name: "aria-invalid", type: "boolean", defaultValue: "false", description: "Applies the destructive validation treatment." },
    ],
  },
  {
    slug: "radio",
    title: "Radio",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Keep every option visible — radios are for short, mutually-exclusive sets." },
      { kind: "do", text: "Wrap each item and its text in a <label> so the text is clickable." },
      { kind: "dont", text: "Use radios for long option lists — switch to a Select." },
    ],
    source: "components/ui/radio-group.tsx",
    description: "Picks exactly one option from a short, mutually-exclusive set.",
    links: [
      { label: "Base UI Radio Group", href: "https://base-ui.com/react/components/radio-group" },
    ],
    preview: <RadioDemo />,
    installation: "Import RadioGroup and RadioGroupItem from the local UI primitive. They wrap the Base UI Radio Group / Radio.",
    importCode: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`,
    usageCode: `<RadioGroup defaultValue="weekly">\n  <RadioGroupItem value="weekly" />\n  <RadioGroupItem value="monthly" />\n</RadioGroup>`,
    usage: "Use radios for single-choice settings where every option should stay visible.",
    composition: [
      "A 24px dial; selected = brand-600 ring + brand-600 dot.",
      "Wrap items in a RadioGroup so only one is active at a time.",
      "Exposes hover, disabled, and aria-invalid (error) states.",
    ],
    examples: [
      {
        title: "Radio group",
        preview: (
          <RadioGroup defaultValue="weekly" className="gap-2">
            <label className="flex items-center gap-2 text-ds-xs font-bold text-foreground">
              <RadioGroupItem value="weekly" />
              Weekly digest
            </label>
            <label className="flex items-center gap-2 text-ds-xs font-bold text-foreground">
              <RadioGroupItem value="monthly" />
              Monthly digest
            </label>
          </RadioGroup>
        ),
        code: `<RadioGroup defaultValue="weekly">\n  <RadioGroupItem value="weekly" /> Weekly digest\n  <RadioGroupItem value="monthly" /> Monthly digest\n</RadioGroup>`,
      },
    ],
    api: [],
    apiSections: [
      {
        title: "RadioGroup",
        rows: [
          { name: "defaultValue", type: "string", defaultValue: "-", description: "Initially-selected value (uncontrolled)." },
          { name: "value / onValueChange", type: "string / (value) => void", defaultValue: "-", description: "Controlled selection, forwarded from Base UI Radio Group." },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables every item in the group." },
        ],
      },
      {
        title: "RadioGroupItem",
        rows: [
          { name: "value", type: "string", defaultValue: "-", description: "This item's value within the group (required)." },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables just this item." },
          { name: "aria-invalid", type: "boolean", defaultValue: "false", description: "Applies the destructive validation treatment." },
        ],
      },
    ],
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Mark the current page with BreadcrumbPage — it renders aria-current=page and is not a link." },
      { kind: "dont", text: "Link the current page — only ancestor steps are links." },
    ],
    source: "components/ui/breadcrumb.tsx",
    description: "Shows where a page sits in the hierarchy, with links back up the trail.",
    preview: <BreadcrumbDemo />,
    installation: "Import Breadcrumb parts from the local UI primitive.",
    importCode: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"`,
    usageCode: `<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/">Home</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbPage>Services</BreadcrumbPage>\n    </BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`,
    usage: "Use on service and article pages to show location within the information hierarchy.",
    compositionCode: `Breadcrumb\n└── BreadcrumbList\n    ├── BreadcrumbItem\n    │   └── BreadcrumbLink\n    ├── BreadcrumbSeparator\n    └── BreadcrumbItem\n        └── BreadcrumbPage`,
    composition: [
      "Links are underlined by default, brand-500 → brand-600 on hover; the current page uses brand-1000 and no underline.",
      "Labels are bold 13px; the default separator is a muted slash — pass children to BreadcrumbSeparator to replace it.",
      "BreadcrumbPage marks aria-current=page for the active step.",
    ],
    examples: [
      {
        title: "Custom separator",
        description: "Pass children to BreadcrumbSeparator — SVGs are auto-sized to 14px.",
        preview: (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Services</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ),
        code: `<BreadcrumbSeparator>\n  <ChevronRight />\n</BreadcrumbSeparator>`,
      },
    ],
    api: [],
    apiSections: [
      {
        title: "BreadcrumbLink",
        description: "Renders a Next.js <Link> — accepts every Link prop.",
        rows: [
          { name: "href", type: "string", defaultValue: "-", description: "Navigation target (required)." },
          { name: "className", type: "string", defaultValue: "-", description: "Merged via cn()." },
        ],
      },
      {
        title: "BreadcrumbSeparator",
        rows: [
          { name: "children", type: "ReactNode", defaultValue: '"/"', description: "Custom separator content; defaults to a slash." },
        ],
      },
      {
        title: "Breadcrumb · BreadcrumbList · BreadcrumbItem · BreadcrumbPage",
        description: "Structural parts — nav, ol, li, and the aria-current span. Each only takes className plus its native element props.",
        rows: [
          { name: "className", type: "string", defaultValue: "-", description: "Merged via cn()." },
        ],
      },
    ],
  },
  {
    slug: "list-item",
    title: "List Item",
    category: "Primitives",
    source: "components/ui/list-item.tsx",
    description: "Label/value rows with dividers, plus a section header — the schedule and details list from the DS.",
    preview: <ListItemDemo />,
    installation: "Import ListItem parts from the local UI primitive.",
    importCode: `import {\n  ListItem,\n  ListItemHeader,\n  ListItemIcon,\n  ListItemSubtitle,\n  ListItemValue,\n} from "@/components/ui/list-item"`,
    usageCode: `<ListItemHeader>Opening hours</ListItemHeader>\n<ListItem>\n  <ListItemIcon>\n    <Icon name="clock" />\n  </ListItemIcon>\n  <ListItemSubtitle>Mon, Tue, Thu</ListItemSubtitle>\n  <ListItemValue>10.00–12.30</ListItemValue>\n</ListItem>`,
    usage: "Use for scannable label/value lists — opening hours, contact details, schedule rows (typically inside a CardSchedule).",
    compositionCode: `ListItemHeader   ← section title (type=header)\nListItem         ← one row (type=row)\n├── ListItemIcon\n├── ListItemSubtitle\n└── ListItemValue`,
    composition: [
      "ListItemHeader is the brand-500 bold 15px section title.",
      "A row is a flex line with a 16px gap and a 2px brand-200 bottom divider.",
      "ListItemSubtitle (bold 13px) fills the row; ListItemValue (medium 13px) is right-aligned.",
      "The leading icon is 16px and painted brand-500.",
    ],
    examples: [],
    api: [],
    apiSections: [
      {
        title: "ListItem · ListItemHeader · ListItemIcon · ListItemSubtitle · ListItemValue",
        description: "All parts are styled native elements — each only takes className plus its element props.",
        rows: [
          { name: "className", type: "string", defaultValue: "-", description: "Merged via cn() — e.g. remove the divider on a last row with border-b-0." },
        ],
      },
    ],
  },
  {
    slug: "infobox",
    title: "Infobox",
    category: "Primitives",
    source: "components/ui/infobox.tsx",
    description: "An inline callout for tips, notices, and short pieces of guidance.",
    preview: <InfoboxDemo />,
    installation: "Import Infobox from the local UI primitive.",
    importCode: `import { Infobox } from "@/components/ui/infobox"`,
    usage: "Use for short, contextual notices near the content they describe.",
    usageCode: `<Infobox\n  title="No appointment needed."\n  description="Just walk in during opening hours."\n/>`,
    composition: [
      "brand-200 fill, 2px brand-600 border, 16px radius.",
      "Faded info icon (replaceable via the icon prop), bold title (13px) over medium description (text-secondary).",
      "Optional trailing action (e.g. a secondary icon button).",
    ],
    examples: [],
    api: [
      { name: "title", type: "ReactNode", defaultValue: "-", description: "Bold lead line." },
      { name: "description", type: "ReactNode", defaultValue: "-", description: "Supporting copy." },
      { name: "icon", type: "ReactNode", defaultValue: "<IconInfo />", description: "Replaces the default faded info glyph; SVG auto-sized to 16px." },
      { name: "action", type: "ReactNode", defaultValue: "-", description: "Optional trailing control." },
      { name: "children", type: "ReactNode", defaultValue: "-", description: "Extra content below title/description, inside the text column." },
    ],
  },
  {
    slug: "text-block",
    title: "Text Block",
    category: "Primitives",
    source: "components/ui/text-block.tsx",
    description: "The section-body layout: a category chip, a title, a lead line, and body copy.",
    preview: <TextBlockDemo />,
    installation: "Import TextBlock from the local UI primitive.",
    importCode: `import { TextBlock } from "@/components/ui/text-block"`,
    usage: "Use as the text column inside service and article sections.",
    usageCode: `<TextBlock\n  categoryIcon={<Icon name="users" />}\n  category="Family and childcare"\n  title="What is it?"\n  lead="In Portugal, children between 6 and 18 are required to get their education."\n>\n  <p>Body copy…</p>\n</TextBlock>`,
    composition: [
      "The category row pairs a brand-dark icon (categoryIcon) with an outlined tag chip (category); both are optional.",
      "Title is xxxl brand-dark; lead is m brand-500 bold, capped at 720px.",
      "Body copy (children) is xs medium with comfortable line height.",
    ],
    examples: [],
    api: [
      { name: "category", type: "ReactNode", defaultValue: "-", description: "Label for the outlined category chip." },
      { name: "categoryIcon", type: "ReactNode", defaultValue: "-", description: "Glyph before the chip; SVG auto-sized to 20px." },
      { name: "title", type: "ReactNode", defaultValue: "-", description: "Block heading." },
      { name: "lead", type: "ReactNode", defaultValue: "-", description: "Emphasised intro line." },
      { name: "children", type: "ReactNode", defaultValue: "-", description: "Body copy paragraphs." },
    ],
  },
  {
    slug: "input-affixes",
    title: "Search & Password",
    category: "Primitives",
    source: "components/ui/input.tsx",
    description: "Input variants: leading search icon, and a password field with a show/hide toggle.",
    preview: <InputAffixesDemo />,
    installation: "Import the variants from the input primitive.",
    importCode: `import { InputSearch, InputPassword } from "@/components/ui/input"`,
    usageCode: `<InputSearch placeholder="Search contacts..." />\n<InputPassword placeholder="Password" />`,
    usage: "Use InputSearch for filters/lookups and InputPassword for credential fields.",
    composition: [
      "Both reuse the base Input field (44px, 16px radius, 2px border).",
      "InputSearch adds a leading search icon with left padding.",
      "InputPassword adds a trailing eye toggle that switches type between password/text.",
    ],
    examples: [
      {
        title: "Search",
        preview: (
          <InputSearch placeholder="Search contacts..." className="max-w-sm" />
        ),
        code: `<InputSearch placeholder="Search contacts..." />`,
      },
      {
        title: "Password",
        description: "The trailing eye toggle switches the field between password and text.",
        preview: (
          <InputPassword placeholder="Password" className="max-w-sm" />
        ),
        code: `<InputPassword placeholder="Password" />`,
      },
    ],
    api: [
      { name: "placeholder", type: "string", defaultValue: "-", description: "Field placeholder text." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Locks the field." },
      { name: "…Input props", type: "Base UI Input", defaultValue: "-", description: "Both variants forward everything to the base Input (value, onChange, aria-invalid, …). InputSearch fixes type=\"search\"; InputPassword manages its own type toggle." },
    ],
  },
  {
    slug: "photo-gallery",
    title: "Photo Gallery",
    category: "Primitives",
    source: "components/ui/photo-gallery.tsx",
    description: "Full-bleed image with responsive height/radii and secondary prev/next navigation.",
    preview: <PhotoGalleryDemo />,
    fullWidthPreview: true,
    installation: "Import PhotoGallery from the local UI primitive.",
    importCode: `import { PhotoGallery } from "@/components/ui/photo-gallery"`,
    usage: "Use on service and article pages to show a set of location or program photos.",
    usageCode: `<PhotoGallery\n  images={[\n    { src: "/photos/center-1.jpg", alt: "Community center entrance" },\n    { src: "/photos/center-2.jpg", alt: "Workshop room" },\n  ]}\n/>`,
    composition: [
      "Height steps 227 → 260 → 424 → 410 and radii 16 → 16 → 24 → 32 across breakpoints.",
      "Image is object-cover within an overflow-hidden container; navigation wraps around at both ends.",
      "Prev/next use secondary icon buttons, anchored bottom-left; they only render with 2+ images.",
    ],
    examples: [],
    api: [
      { name: "images", type: "{ src: string; alt?: string }[]", defaultValue: "-", description: "Photos to cycle through (required)." },
      { name: "showNavigation", type: "boolean", defaultValue: "true", description: "Toggles the prev/next controls." },
      { name: "className", type: "string", defaultValue: "-", description: "Override height/radius steps if a context needs different framing." },
    ],
  },
  {
    slug: "calendar",
    title: "Calendar",
    category: "Primitives",
    source: "components/ui/calendar.tsx",
    description: "Month date-picker built on react-day-picker v10, styled to the DS (selected, today, nav, event dots).",
    links: [
      { label: "React DayPicker docs", href: "https://daypicker.dev" },
    ],
    preview: <CalendarDemo />,
    installation: "Import Calendar from the local UI primitive. It wraps react-day-picker and restyles it with DS classNames — every DayPicker prop is available.",
    importCode: `import { Calendar } from "@/components/ui/calendar"`,
    usage: "Use for date selection in the agenda, booking flows, and admin filters. Control the selection with useState, like any DayPicker.",
    usageCode: `const [date, setDate] = useState<Date | undefined>(new Date())\n\n<Calendar mode="single" selected={date} onSelect={setDate} />`,
    composition: [
      "White card surface with bold month title and ghost chevron nav.",
      "Monday-start (weekStartsOn={1}), 3-letter muted weekday labels, rounded 48px day cells.",
      "Today shows a neutral outline box; the selected day a teal outline with mint fill (selected wins over today).",
      "Days carrying the custom `event` modifier render a teal dot — pass modifiers={{ event: dates }} (this is how the Agenda marks event days).",
    ],
    examples: [],
    api: [
      { name: "mode", type: "single | range | multiple", defaultValue: "-", description: "Selection mode (react-day-picker)." },
      { name: "selected / onSelect", type: "per mode", defaultValue: "-", description: "Controlled selection, typed by the mode." },
      { name: "showOutsideDays", type: "boolean", defaultValue: "true", description: "Renders the faded leading/trailing days of adjacent months." },
      { name: "modifiers.event", type: "Date[]", defaultValue: "-", description: "DS extension: marked days get a teal dot under the number." },
      { name: "…DayPicker props", type: "react-day-picker", defaultValue: "-", description: "Everything else (disabled, locale, numberOfMonths, …) is forwarded — see daypicker.dev." },
    ],
  },
  {
    slug: "agenda",
    title: "Agenda",
    category: "System components",
    source: "app/(frontend)/components/_components/agenda-demo.tsx",
    description: "Event browser: category filter chips, a calendar with event dots, and a day event list.",
    preview: <AgendaDemo />,
    fullWidthPreview: true,
    previewHeight: 760,
    installation: "Composition of Calendar + filter chips + event list.",
    importCode: `import { Calendar } from "@/components/ui/calendar"`,
    usage: "Use to browse program events by category and date.",
    composition: [
      "Filter chips toggle program-area categories (project colors).",
      "Calendar marks event days with a teal dot (the event modifier).",
      "Selecting a day lists its events with category accents.",
    ],
    examples: [],
    api: [
      { name: "—", type: "composition", defaultValue: "-", description: "Composes Calendar, chips, and an event list; wire to your event source." },
    ],
  },
  {
    slug: "accordion",
    title: "Accordion",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Remember value and defaultValue are arrays, even in single-open mode." },
      { kind: "dont", text: "Enable multiple unless comparing answers side-by-side matters — single-open keeps FAQs scannable." },
    ],
    source: "components/ui/accordion.tsx",
    description: "Expandable FAQ rows with a number badge, teal title, optional Label tag, and +/- toggle.",
    links: [
      { label: "Base UI Accordion", href: "https://base-ui.com/react/components/accordion" },
    ],
    preview: <AccordionDemo />,
    installation: "Import Accordion parts from the local UI primitive. They wrap the Base UI Accordion with the DS row treatment.",
    importCode: `import {\n  Accordion,\n  AccordionItem,\n  AccordionTrigger,\n  AccordionContent,\n} from "@/components/ui/accordion"`,
    usageCode: `<Accordion defaultValue={["01"]}>\n  <AccordionItem value="01">\n    <AccordionTrigger number="01">How do I register?</AccordionTrigger>\n    <AccordionContent>Create a profile to begin.</AccordionContent>\n  </AccordionItem>\n</Accordion>`,
    usage: "Use for FAQs and progressively-disclosed help content. Note that value/defaultValue are arrays (Base UI), even in single-open mode.",
    compositionCode: `Accordion\n└── AccordionItem\n    ├── AccordionTrigger   ← number badge · title · tag · +/- toggle\n    └── AccordionContent`,
    composition: [
      "Each trigger row: optional brand-200 number badge, teal bold title, optional trailing DS Tag, and a +/- toggle that flips with the open state.",
      "Rows are split by a 2px brand-200 divider; the panel animates open/closed via its measured height.",
      "Single-open by default; pass multiple on the Accordion root to allow several open at once.",
    ],
    examples: [],
    api: [],
    apiSections: [
      {
        title: "Accordion",
        description: "The Base UI Accordion.Root — value is always an array of open item values.",
        rows: [
          { name: "defaultValue", type: "Value[]", defaultValue: "-", description: "Items open on first render (uncontrolled)." },
          { name: "value / onValueChange", type: "Value[] / (value) => void", defaultValue: "-", description: "Controlled open items." },
          { name: "multiple", type: "boolean", defaultValue: "false", description: "Allow several items open at the same time." },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables the whole accordion." },
        ],
      },
      {
        title: "AccordionTrigger",
        rows: [
          { name: "number", type: "ReactNode", defaultValue: "-", description: "Leading badge content (e.g. 01)." },
          { name: "tag", type: "ReactNode", defaultValue: "-", description: "Optional trailing DS Tag." },
          { name: "children", type: "ReactNode", defaultValue: "-", description: "The row title." },
        ],
      },
      {
        title: "AccordionItem · AccordionContent",
        rows: [
          { name: "value", type: "Value", defaultValue: "-", description: "AccordionItem identity, matched against the root value array." },
          { name: "className", type: "string", defaultValue: "-", description: "Merged via cn() on either part." },
        ],
      },
    ],
  },
  {
    slug: "select",
    title: "Select",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Make item values readable labels, or pass an items map (value → label) whenever values are ids." },
      { kind: "do", text: "Coalesce null in onValueChange — clearing the selection produces null, not an empty string." },
      { kind: "dont", text: "Use a Select for two or three options that could stay visible — a Radio group keeps every option scannable." },
    ],
    source: "components/ui/select.tsx",
    description: "Single-value menu control for filters, settings, and compact option choices.",
    links: [
      { label: "Base UI Select", href: "https://base-ui.com/react/components/select" },
    ],
    preview: <SelectDemo />,
    installation: "Import Select primitives from the local UI wrapper. They wrap the Base UI Select.",
    importCode: `import {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from "@/components/ui/select"`,
    usageCode: `<Select value={value} onValueChange={(v) => setValue(v ?? "")}>\n  <SelectTrigger className="w-56">\n    <SelectValue />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="Housing">Housing</SelectItem>\n    <SelectItem value="Health">Health</SelectItem>\n  </SelectContent>\n</Select>`,
    usage: "Use Select where a bounded option list is clearer than free-form input. Two Base UI gotchas: SelectValue renders the raw value string, so either make values readable (as above) or pass an items map (value → label) to the Select root — otherwise the trigger shows the raw id. And onValueChange can receive null (cleared), so coalesce it.",
    compositionCode: `Select\n├── SelectTrigger\n│   └── SelectValue\n└── SelectContent\n    ├── SelectGroup + SelectLabel\n    ├── SelectItem\n    └── SelectSeparator`,
    composition: [
      "Trigger uses the same 44px / 16px control shape as Input, with a DS arrow icon.",
      "SelectContent is a portalled, positioned popup with DS border and option states; by default it aligns the selected item with the trigger.",
      "Use size=\"sm\" on the trigger for compact admin toolbars (40px).",
    ],
    examples: [
      {
        title: "Groups",
        description: "Use SelectGroup, SelectLabel, and SelectSeparator to organise longer option lists.",
        preview: (
          <Select defaultValue="Housing">
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Support</SelectLabel>
                <SelectItem value="Housing">Housing</SelectItem>
                <SelectItem value="Legal assistance">Legal assistance</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Programs</SelectLabel>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Employability">Employability</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ),
        code: `<SelectContent>\n  <SelectGroup>\n    <SelectLabel>Support</SelectLabel>\n    <SelectItem value="Housing">Housing</SelectItem>\n    <SelectItem value="Legal assistance">Legal assistance</SelectItem>\n  </SelectGroup>\n  <SelectSeparator />\n  <SelectGroup>\n    <SelectLabel>Programs</SelectLabel>\n    <SelectItem value="Education">Education</SelectItem>\n    <SelectItem value="Employability">Employability</SelectItem>\n  </SelectGroup>\n</SelectContent>`,
      },
    ],
    api: [],
    apiSections: [
      {
        title: "Select",
        description: "The Base UI Select.Root — controls state and holds the optional items map.",
        rows: [
          { name: "value / onValueChange", type: "string | null / (value) => void", defaultValue: "-", description: "Controlled selection. The callback receives null when cleared — coalesce it." },
          { name: "defaultValue", type: "string", defaultValue: "-", description: "Uncontrolled initial selection." },
          { name: "items", type: "Record<value, label>", defaultValue: "-", description: "Value → label map. Required whenever a label differs from its value (e.g. entity ids), or the trigger renders the raw value." },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables the whole select." },
        ],
      },
      {
        title: "SelectTrigger",
        rows: [
          { name: "size", type: "default | sm", defaultValue: "default", description: "44px / 40px trigger height and minimum width." },
        ],
      },
      {
        title: "SelectContent",
        rows: [
          { name: "side / align", type: "positioner props", defaultValue: "bottom / center", description: "Popup placement, forwarded to the Base UI Positioner (plus sideOffset / alignOffset)." },
          { name: "alignItemWithTrigger", type: "boolean", defaultValue: "true", description: "Native-select feel: opens with the selected item over the trigger. Set false for a plain dropdown." },
        ],
      },
      {
        title: "SelectItem",
        rows: [
          { name: "value", type: "string", defaultValue: "-", description: "Option value (required); children are the visible label." },
          { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables this option." },
        ],
      },
    ],
  },
  {
    slug: "table",
    title: "Table",
    category: "Primitives",
    source: "components/ui/table.tsx",
    description: "Structured data table with contained horizontal scrolling and DS dividers.",
    preview: <TableExample />,
    installation: "Import table parts from the local UI primitive.",
    importCode: `import {\n  Table,\n  TableHeader,\n  TableBody,\n  TableFooter,\n  TableRow,\n  TableHead,\n  TableCell,\n  TableCaption,\n} from "@/components/ui/table"`,
    usageCode: `<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Name</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell>Sarah Chen</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>`,
    usage: "Use tables for contacts, admin listings, and dense comparable data.",
    compositionCode: `Table          ← wraps itself in an overflow-x-auto scroller\n├── TableCaption\n├── TableHeader\n│   └── TableRow → TableHead\n├── TableBody\n│   └── TableRow → TableCell\n└── TableFooter`,
    composition: [
      "Tables are wrapped in an overflow-x-auto container automatically.",
      "Rows and headers use 2px DS dividers.",
      "Set min-width on the table for predictable mobile scrolling.",
    ],
    examples: [
      {
        title: "Two-column reference table",
        description:
          "A bold label column paired with a bulleted content column — for documents-required and comparison layouts. Supports nested bullets and inline links.",
        preview: <ReferenceTableExample />,
        align: "start",
      },
    ],
    api: [
      { name: "className", type: "string", defaultValue: "-", description: "Use min-w values for predictable mobile scrolling." },
    ],
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    category: "Primitives",
    bestPractices: [
      { kind: "do", text: "Keep tooltips to short, supplementary hints." },
      { kind: "do", text: "Wrap the subtree in one TooltipProvider so neighbouring tooltips share hover timing." },
      { kind: "dont", text: "Put content the user needs to proceed inside a tooltip — it is unreachable on touch and invisible until hover or focus." },
    ],
    source: "components/ui/tooltip.tsx",
    description: "A small dark bubble with contextual information, shown on hover or keyboard focus.",
    links: [
      { label: "Base UI Tooltip", href: "https://base-ui.com/react/components/tooltip" },
    ],
    preview: <TooltipDemo />,
    installation: "Import Tooltip parts from the local UI primitive. They wrap the Base UI Tooltip. Wrap the subtree that uses tooltips in a TooltipProvider so neighbouring tooltips share hover timing (the colour grid does this).",
    importCode: `import {\n  Tooltip,\n  TooltipContent,\n  TooltipProvider,\n  TooltipTrigger,\n} from "@/components/ui/tooltip"`,
    usageCode: `<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger render={<Button variant="secondary">Hover me</Button>} />\n    <TooltipContent>Copies the hex value</TooltipContent>\n  </Tooltip>\n</TooltipProvider>`,
    usage: "Use for short supplementary hints on interactive elements — never for content the user must read to proceed. Pass your own element to the trigger via the Base UI render prop, as in the example.",
    compositionCode: `TooltipProvider   ← once per subtree, shares delay timing\n└── Tooltip\n    ├── TooltipTrigger\n    └── TooltipContent`,
    composition: [
      "Dark bubble: foreground fill with background text, 16px radius, 13px medium, max 256px wide.",
      "An arrow tracks the side automatically; content is portalled above everything (z-50).",
      "Opens after the provider delay (150ms) and closes immediately by default.",
    ],
    examples: [
      {
        title: "Sides",
        description: "Use the side prop on TooltipContent to change the placement — the arrow follows.",
        preview: (
          <TooltipProvider>
            <div className="flex flex-wrap items-center gap-3 py-10">
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <Tooltip key={side}>
                  <TooltipTrigger
                    render={<Button variant="secondary">{side}</Button>}
                  />
                  <TooltipContent side={side}>Shown {side}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        ),
        code: `<TooltipContent side="top | bottom | left | right">…</TooltipContent>`,
      },
    ],
    api: [],
    apiSections: [
      {
        title: "TooltipProvider",
        rows: [
          { name: "delay", type: "number (ms)", defaultValue: "150", description: "Hover time before tooltips open." },
          { name: "closeDelay", type: "number (ms)", defaultValue: "0", description: "Delay before closing after the pointer leaves." },
        ],
      },
      {
        title: "TooltipTrigger",
        description: "The Base UI trigger — use render to attach the tooltip to your own element.",
        rows: [
          { name: "render", type: "ReactElement", defaultValue: "-", description: "The element that receives hover/focus handling (e.g. a Button)." },
        ],
      },
      {
        title: "TooltipContent",
        rows: [
          { name: "side", type: "top | bottom | left | right", defaultValue: "top", description: "Preferred placement, forwarded to the positioner." },
          { name: "sideOffset / align", type: "number / start | center | end", defaultValue: "6 / center", description: "Fine placement controls." },
        ],
      },
    ],
  },
  {
    slug: "main-menu",
    title: "Main Menu",
    category: "System components",
    source: "components/site/site-header.jsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Sticky public-site navigation with the Admin Hub lockup (magnifier-house glyph + lisbon project endorsement), menu action, and donate CTA.",
    preview: <SiteHeader sticky={false} />,
    fullWidthPreview: true,
    previewHeight: 220,
    installation: "Import the production site header.",
    importCode: `import { SiteHeader } from "@/components/site/site-header"`,
    usage: "Use once at the top of public site layouts.",
    composition: [
      "Header uses 56px desktop outer gutters inside a 1680px frame.",
      "Menu and donate actions use 44px control sizing.",
      "Use sticky={false} only inside previews or static mocks.",
    ],
    examples: [],
    api: [
      { name: "sticky", type: "boolean", defaultValue: "true", description: "Controls sticky positioning for production vs preview contexts." },
    ],
  },
  {
    slug: "home-hero",
    title: "Home Hero",
    category: "System components",
    source: "components/home/hero.jsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Admin Hub landing hero with DS illustration, title block, and embedded quick access cards.",
    preview: <Hero />,
    fullWidthPreview: true,
    previewHeight: 760,
    installation: "Import the production home hero.",
    importCode: `import { Hero } from "@/components/home/hero"`,
    usage: "Use as the first section on the Admin Hub home page.",
    composition: [
      "Includes the four quick access cards as part of the Figma hero section.",
      "Uses 56px rounded panel and 135px desktop inner inset.",
      "Decorative illustration is hidden until wide desktop to avoid overlap.",
    ],
    examples: [],
    api: [
      { name: "data", type: "AdminProvider state", defaultValue: "quickAccess", description: "Reads quick access items from the admin store." },
    ],
  },
  {
    slug: "quick-access",
    title: "Quick Access",
    category: "System components",
    source: "components/home/quick-access.jsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Four-card shortcut grid used inside the home hero and standalone contexts.",
    preview: <QuickAccess />,
    fullWidthPreview: true,
    previewHeight: 640,
    installation: "Import the production quick access component.",
    importCode: `import { QuickAccess } from "@/components/home/quick-access"`,
    usage: "Use embedded inside Hero, or standalone when a page needs shortcuts.",
    composition: [
      "Cards auto-fit with a 280px minimum track.",
      "Icons are semantic per card id.",
      "Use embedded to remove the surrounding section wrapper.",
    ],
    examples: [],
    api: [
      { name: "embedded", type: "boolean", defaultValue: "false", description: "Removes standalone section wrapper when used inside Hero." },
    ],
  },
  {
    slug: "services-list",
    title: "Services List",
    category: "System components",
    source: "components/home/services-grid.jsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Two-column service information list with semantic icons and compact card rows.",
    preview: <ServicesGrid />,
    fullWidthPreview: true,
    previewHeight: 720,
    installation: "Import the production services grid.",
    importCode: `import { ServicesGrid } from "@/components/home/services-grid"`,
    usage: "Use on the home page to expose all service categories.",
    composition: [
      "Service rows use a 480px minimum track.",
      "Service icons resolve through lib/service-icons.",
      "Panel uses the same DS section padding as Figma.",
    ],
    examples: [],
    api: [
      { name: "services", type: "AdminProvider state", defaultValue: "defaultAdminData.services", description: "Rendered from the admin store." },
    ],
  },
  {
    slug: "contacts",
    title: "Contacts",
    category: "System components",
    source: "components/home/all-contacts.tsx · components/shared/contacts-section.tsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Searchable and filterable contacts section with DS table, badges, and action buttons.",
    preview: <AllContacts />,
    fullWidthPreview: true,
    previewHeight: 720,
    installation: "Import AllContacts or ContactsSection depending on the page.",
    importCode: `import { AllContacts } from "@/components/home/all-contacts"\nimport { ContactsSection } from "@/components/shared/contacts-section"`,
    usage: "Use ContactsSection when a service page needs a scoped contact table.",
    composition: [
      "Search input and select controls sit above the table.",
      "Mobile overflow is contained by the table scroller.",
      "Contact badges use the outline badge variant.",
    ],
    examples: [],
    api: [
      { name: "contacts", type: "Contact[]", defaultValue: "[]", description: "Rows rendered by ContactsSection." },
      { name: "categoryFilters", type: "string[]", defaultValue: "[]", description: "Options for the category filter." },
    ],
  },
  {
    slug: "map-visit",
    title: "Map Visit",
    category: "System components",
    source: "components/home/map-visit.tsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Map, address, opening hours, and contact information section used near page footers.",
    preview: <MapVisit />,
    fullWidthPreview: true,
    previewHeight: 700,
    installation: "Import the production map visit component.",
    importCode: `import { MapVisit } from "@/components/home/map-visit"`,
    usage: "Use near the end of public pages where location and visiting information are needed.",
    composition: [
      "Map iframe sits behind a white information panel.",
      "Information panel auto-fits columns to avoid overflow.",
      "Desktop column gap matches the Figma 88px gap at 1680px.",
    ],
    examples: [],
    api: [
      { name: "MAP_QUERY", type: "module constant", defaultValue: '"Rua Carvalho Araújo 66B, 1900-140 Lisboa, Portugal"', description: "Google Maps query used by the iframe — edit in components/home/map-visit.tsx." },
    ],
  },
  {
    slug: "service-page",
    title: "Service Page",
    category: "System components",
    source: "components/services/service-hero.jsx · components/services/topics-grid.jsx",
    links: [{ label: "View live at /services/family-child-support", href: "/services/family-child-support" }],
    description: "Service-category composition combining hero, topic cards, contacts, and location sections.",
    preview: (
      <>
        <ServiceHero title={familyService.title} breadcrumb={familyService.breadcrumb} intro={familyService.intro} iconKey={familyService.iconKey} />
        <TopicsGrid topics={familyService.topics} categorySlug={familyService.slug} />
      </>
    ),
    fullWidthPreview: true,
    previewHeight: 780,
    installation: "Import page-level service components or use the route-level ServiceCategoryView.",
    importCode: `import { ServiceHero } from "@/components/services/service-hero"\nimport { TopicsGrid } from "@/components/services/topics-grid"`,
    usage: "Use the route-level ServiceCategoryView for production routes; use these parts for custom service pages.",
    composition: [
      "Hero uses the selected service icon and intro copy.",
      "TopicsGrid renders article cards for the service category.",
      "ContactsSection and MapVisit typically follow this composition.",
    ],
    examples: [],
    api: [
      { name: "slug", type: "string", defaultValue: "-", description: "Service slug used to resolve admin data and routes." },
    ],
  },
  {
    slug: "article-page",
    title: "Article Page",
    category: "System components",
    source: "components/services/article-view.tsx",
    links: [{ label: "View live at /services/family-child-support/basic-education", href: "/services/family-child-support/basic-education" }],
    description: "Article view composition with hero, alternating content panels, FAQ, map, and footer-ready spacing.",
    preview: <ArticleView slug="family-child-support" topicSlug="basic-education" />,
    fullWidthPreview: true,
    previewHeight: 800,
    installation: "Import the route-level article view.",
    importCode: `import { ArticleView } from "@/components/services/article-view"`,
    usage: "Use for service topic routes that need the Figma article structure.",
    composition: [
      "Hero introduces the topic.",
      "Content sections alternate white panel and page background.",
      "FAQ rows use collapsible-style affordances.",
    ],
    examples: [],
    api: [
      { name: "slug", type: "string", defaultValue: "-", description: "Parent service slug." },
      { name: "topicSlug", type: "string", defaultValue: "-", description: "Article topic slug." },
    ],
  },
  {
    slug: "key-links",
    title: "Key Links",
    category: "System components",
    source: "components/services/key-links.tsx",
    links: [{ label: "View live at /services/family-child-support/basic-education", href: "/services/family-child-support/basic-education" }],
    description: "Article section listing shortcut links — the standard section header over 13px bold teal link rows with a chevron.",
    preview: (
      <KeyLinks
        links={[
          { label: "ePortugal — public services portal", href: "https://eportugal.gov.pt" },
          { label: "AIMA — migration and asylum agency", href: "https://aima.gov.pt" },
          { label: "Lisbon city council", href: "https://www.lisboa.pt" },
          { label: "Community events calendar", href: "/calendar" },
        ]}
      />
    ),
    fullWidthPreview: true,
    previewHeight: 460,
    installation: "Import KeyLinks from the services components.",
    importCode: `import { KeyLinks } from "@/components/services/key-links"`,
    usage: "Use inside article pages for the editor-managed list of shortcuts; ArticleView renders it from the article's keyLinks at the top of the article, before the content sections.",
    usageCode: `<KeyLinks\n  links={[\n    { label: "ePortugal — public services portal", href: "https://eportugal.gov.pt" },\n    { label: "Community events calendar", href: "/calendar" },\n  ]}\n/>`,
    composition: [
      "Header reuses the article-section pattern: brand-dark icon badge (info glyph) + xxxl brand-dark title.",
      "Each row is a 13px bold teal (brand-500) underlined label with a 16px chevron, 8px between rows.",
      "https:// links open in a new tab; /path links navigate in place via next/link.",
      "Renders nothing when the links array is empty.",
    ],
    examples: [],
    api: [
      { name: "links", type: "{ label: string; href: string }[]", defaultValue: "-", description: "The shortcut rows; edited per-article in the admin topic editor." },
      { name: "title", type: "string", defaultValue: '"Key links"', description: "Section heading." },
      { name: "className", type: "string", defaultValue: "-", description: "Merged onto the section panel via cn()." },
    ],
  },
  {
    slug: "footer",
    title: "Footer",
    category: "System components",
    source: "components/site/site-footer.jsx",
    links: [{ label: "View live at /", href: "/" }],
    description: "Newsletter band and legal/social footer used on public site pages.",
    preview: <SiteFooter />,
    fullWidthPreview: true,
    previewHeight: 560,
    installation: "Import the production footer.",
    importCode: `import { SiteFooter } from "@/components/site/site-footer"`,
    usage: "Use once at the bottom of public site layouts.",
    composition: [
      "Newsletter band uses bg-mint.",
      "Inputs and CTA reuse DS form/button primitives.",
      "Social actions use circular icon links.",
    ],
    examples: [],
    api: [
      { name: "children", type: "none", defaultValue: "-", description: "Footer is currently static." },
    ],
  },
  {
    slug: "topics-viewed-chart",
    title: "Topics Viewed Chart",
    category: "System components",
    source: "components/analytics/topics-viewed-chart.tsx",
    links: [{ label: "View live at /admin/insights", href: "/admin/insights" }],
    description: "Horizontal bar chart of topic views on the DS Card, built with the shadcn chart primitives in the brand primary colour. Sample data shown; pass `data` for live counts.",
    preview: <TopicsViewedChart />,
    installation: "Import the analytics chart and pass topic-view data.",
    importCode: `import { TopicsViewedChart } from "@/components/analytics/topics-viewed-chart"`,
    usage: "Use on the protected team insights route; feed it counts from the `topic_viewed` PostHog insight.",
    composition: [
      "Bars use var(--primary) (DS teal); in-bar labels use --primary-foreground (white).",
      "Wrapped in the DS Card; chart rendered via @/components/ui/chart (recharts).",
      "Reuses the `topic_viewed` event taxonomy — see docs/ANALYTICS.md.",
    ],
    examples: [],
    api: [
      { name: "data", type: "{ topic: string; views: number }[]", defaultValue: "SAMPLE_DATA", description: "Topic view counts; wire to the topic_viewed insight for live data." },
      { name: "title", type: "string", defaultValue: '"Which topics have been seen the most?"', description: "Card title." },
      { name: "description", type: "string", defaultValue: '"Unique views per topic · last 30 days"', description: "Card subtitle." },
    ],
  },
];

export const STYLEGUIDE_NAV_GROUPS = ["Foundations", "Primitives", "System components"].map((title) => ({
  title,
  items: COMPONENT_DOCS.filter((doc) => doc.category === title)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      status: doc.status,
    })),
}));

export function getComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((doc) => doc.slug === slug);
}
