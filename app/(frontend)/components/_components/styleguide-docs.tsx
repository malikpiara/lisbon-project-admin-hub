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
import { TextBlock } from "@/components/ui/text-block";
import { Textarea } from "@/components/ui/textarea";
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
import { ServiceHero } from "@/components/services/service-hero";
import { TopicsGrid } from "@/components/services/topics-grid";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

type Example = {
  title: string;
  description?: string;
  preview: ReactNode;
  code?: string;
  fullWidth?: boolean;
};

type ApiRow = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
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
  installation: string;
  importCode?: string;
  usage: string;
  usageCode?: string;
  composition: string[];
  examples: Example[];
  api: ApiRow[];
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

const buttonVariants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;

function TypographySpec() {
  return (
    <div className="space-y-5">
      <p className="font-heading text-ds-xxxxl font-bold text-primary">Admin Hub</p>
      <p className="font-heading text-ds-xxxl font-bold text-brand-dark">Services and Information</p>
      <p className="text-ds-l font-bold text-foreground">Connecting community members to external services.</p>
      <p className="text-ds-s font-medium text-foreground">Information platform summarizing administrative processes, sharing tips and mapping services.</p>
      <p className="font-mono text-ds-xs text-muted-foreground">font-mono / token labels / ids</p>
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
    description: "Responsive Quicksand type scale for product UI, service pages, and content-heavy sections.",
    preview: <TypographySpec />,
    installation: "Typography is configured globally through next/font and Tailwind theme tokens.",
    usage: "Use ds text tokens for public UI so typography follows the Figma breakpoint scale.",
    composition: [
      "Use text-ds-xxxxl for page hero titles.",
      "Use text-ds-xxxl for section headers.",
      "Use text-ds-s and text-ds-xs for dense UI copy and tables.",
    ],
    examples: [],
    api: [
      { name: "font-heading", type: "class", defaultValue: "Quicksand", description: "Shared heading/display family." },
      { name: "text-ds-*", type: "class", defaultValue: "responsive", description: "Breakpoint-driven DS size aliases." },
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
    description: "The Lisbon Project DS icon set — 81 filled icons exported from Figma, normalized to currentColor.",
    preview: <IconGallery />,
    installation: "Import the Icon component; icons live in public/icons and lib/ds-icons-data.ts.",
    importCode: `import { Icon } from "@/components/ui/icon"`,
    usage: `Use <Icon name="call-solo" /> wherever a DS glyph is needed; it inherits text color and scales via className.`,
    composition: [
      "Each icon is a filled SVG normalized to currentColor.",
      "Color with text-* utilities; size with size-* on the Icon.",
      "Names mirror the Figma set (e.g. call-solo, briefcase-search, ui-arrow-right).",
    ],
    examples: [],
    api: sharedFoundationApi,
  },
  {
    slug: "button",
    title: "Button",
    category: "Primitives",
    description: "The main control for triggering an action — three priorities, optional icons, and two sizes.",
    preview: <ButtonMatrix />,
    installation: "Import Button from the local UI primitive.",
    importCode: `import { Button } from "@/components/ui/button"`,
    usage: "Use Button for commands. Use links for navigation unless the visual treatment must match a command.",
    usageCode: `<Button>\n  Donate\n  <ChevronRight />\n</Button>`,
    composition: [
      "Default buttons are 44px high with 16px radius.",
      "Icon buttons use the same 44px square hit area.",
      "Use secondary or outline variants for lower-priority actions.",
    ],
    examples: [
      {
        title: "Sizes",
        description: "Use sm in dense toolbars and lg for prominent CTAs.",
        preview: (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        ),
        code: `<Button size="sm">Small</Button>\n<Button>Default</Button>\n<Button size="lg">Large</Button>`,
      },
      {
        title: "Secondary & ghost",
        description: "Lower-priority actions use the lighter treatments.",
        preview: (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary">Reset</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        ),
        code: `<Button variant="secondary">Reset</Button>\n<Button variant="ghost">Cancel</Button>`,
      },
      {
        title: "Disabled",
        preview: <Button disabled>Disabled</Button>,
        code: `<Button disabled>Disabled</Button>`,
      },
      {
        title: "Icon only",
        description: "Keeps the 44px square hit area — always pass an aria-label.",
        preview: (
          <Button size="icon" aria-label="Add">
            <Plus />
          </Button>
        ),
        code: `<Button size="icon" aria-label="Add">\n  <Plus />\n</Button>`,
      },
    ],
    api: [
      { name: "variant", type: "default | secondary | outline | ghost | destructive | link", defaultValue: "default", description: "Visual treatment." },
      { name: "size", type: "xs | sm | default | lg | icon", defaultValue: "default", description: "Height, padding, and icon-only sizing." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Applies disabled opacity and interaction lock." },
    ],
  },
  {
    slug: "tag",
    title: "Tag",
    category: "Primitives",
    description: "A small pill that labels a category or piece of metadata. One variant, by design.",
    preview: <TagRow />,
    installation: "Import Tag from the local UI primitive.",
    importCode: `import { Tag } from "@/components/ui/tag"`,
    usage: "Use a Tag for a short category or status inside tables, cards, and metadata rows.",
    usageCode: `<Tag>Family Support</Tag>`,
    composition: [
      "28px minimum height, fully-rounded pill.",
      "2px brand-200 border with brand-800 text — one consistent style.",
      "Keep the label to one or two words.",
    ],
    examples: [],
    api: [
      { name: "className", type: "string", defaultValue: "-", description: "Compose extra layout/spacing on the tag." },
    ],
  },
  {
    slug: "card",
    title: "Card",
    category: "Primitives",
    description: "Bounded surface for repeated content, service cards, quick access cards, and admin previews.",
    preview: <CardExamples />,
    installation: "Import card parts from the local UI primitive.",
    importCode: `import { Card, CardService, CardShortcut, CardContent, CardHeader, CardTitle } from "@/components/ui/card"`,
    usageCode: `<Card>\n  <CardHeader>\n    <CardTitle>Emergency contacts</CardTitle>\n  </CardHeader>\n  <CardContent>Help · 112</CardContent>\n</Card>`,
    usage: "Use cards for individual repeated items. Avoid nesting cards inside cards.",
    composition: [
      "Cards use a 24px radius and 2px mint border.",
      "CardHeader, CardContent, and CardFooter provide consistent internal spacing.",
      "Use size=\"sm\" for denser admin lists.",
    ],
    examples: [],
    api: [
      { name: "size", type: "default | sm", defaultValue: "default", description: "Adjusts inner spacing density." },
    ],
  },
  {
    slug: "form-fields",
    title: "Form Fields",
    category: "Primitives",
    description: "Single-line inputs and multi-line textareas, with disabled and invalid states built in.",
    preview: <FormExamples />,
    installation: "Import Input and Textarea from local UI primitives.",
    importCode: `import { Input } from "@/components/ui/input"\nimport { Textarea } from "@/components/ui/textarea"`,
    usageCode: `<Input placeholder="Email address" />\n<Textarea placeholder="Message" />`,
    usage: "Use these controls for search, newsletter forms, admin editing, and filters.",
    composition: [
      "Input is 44px high with 16px radius and 2px neutral border.",
      "Textarea follows the same border/radius language with taller minimum height.",
      "Use aria-invalid for validation state.",
    ],
    examples: [
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
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Locks interaction and softens the surface." },
      { name: "aria-invalid", type: "boolean", defaultValue: "false", description: "Applies destructive validation treatment." },
    ],
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    category: "Primitives",
    description: "Turns an option on or off — pick any number, independently.",
    preview: <CheckboxDemo />,
    installation: "Import Checkbox from the local UI primitive.",
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
      { name: "defaultChecked", type: "boolean", defaultValue: "false", description: "Initial checked state (uncontrolled)." },
      { name: "variant", type: "primary | secondary", defaultValue: "primary", description: "Selection level; secondary is the lighter mint treatment." },
      { name: "aria-invalid", type: "boolean", defaultValue: "false", description: "Applies the destructive validation treatment." },
    ],
  },
  {
    slug: "radio",
    title: "Radio",
    category: "Primitives",
    description: "Picks exactly one option from a short, mutually-exclusive set.",
    preview: <RadioDemo />,
    installation: "Import RadioGroup and RadioGroupItem from the local UI primitive.",
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
    api: [
      { name: "value", type: "string", defaultValue: "-", description: "RadioGroupItem value within a RadioGroup." },
      { name: "defaultValue", type: "string", defaultValue: "-", description: "Initially-selected value on the RadioGroup." },
      { name: "aria-invalid", type: "boolean", defaultValue: "false", description: "Applies the destructive validation treatment." },
    ],
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    category: "Primitives",
    description: "Shows where a page sits in the hierarchy, with links back up the trail.",
    preview: <BreadcrumbDemo />,
    installation: "Import Breadcrumb parts from the local UI primitive.",
    importCode: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"`,
    usageCode: `<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/">Home</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbPage>Services</BreadcrumbPage>\n    </BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`,
    usage: "Use on service and article pages to show location within the information hierarchy.",
    composition: [
      "Links use brand-500 → brand-600 on hover; the current page uses brand-1000.",
      "Labels are bold 13px; the separator is a muted slash.",
      "BreadcrumbPage marks aria-current=page for the active step.",
    ],
    examples: [],
    api: [
      { name: "href", type: "string", defaultValue: "-", description: "Target for BreadcrumbLink (Next.js Link)." },
    ],
  },
  {
    slug: "list-item",
    title: "List Item",
    category: "Primitives",
    description: "A single icon-and-text row with a divider, for service and contact lists.",
    preview: <ListItemDemo />,
    installation: "Import ListItem parts from the local UI primitive.",
    importCode: `import { ListItem, ListItemIcon, ListItemContent, ListItemTitle, ListItemText } from "@/components/ui/list-item"`,
    usage: "Use for scannable lists of services, contacts, or topics.",
    composition: [
      "Title is brand-500 bold 15px; supporting text is foreground medium 13px.",
      "Each row has a 2px brand-200 bottom divider.",
      "Leading icon uses brand-500.",
    ],
    examples: [],
    api: [
      { name: "className", type: "string", defaultValue: "-", description: "Compose layout/spacing on the row container." },
    ],
  },
  {
    slug: "infobox",
    title: "Infobox",
    category: "Primitives",
    description: "An inline callout for tips, notices, and short pieces of guidance.",
    preview: <InfoboxDemo />,
    installation: "Import Infobox from the local UI primitive.",
    importCode: `import { Infobox } from "@/components/ui/infobox"`,
    usage: "Use for short, contextual notices near the content they describe.",
    composition: [
      "brand-200 fill, 2px brand-600 border, 16px radius.",
      "Faded info icon, bold title (13px) over medium description (text-secondary).",
      "Optional trailing action (e.g. a secondary icon button).",
    ],
    examples: [],
    api: [
      { name: "title", type: "ReactNode", defaultValue: "-", description: "Bold lead line." },
      { name: "description", type: "ReactNode", defaultValue: "-", description: "Supporting copy." },
      { name: "action", type: "ReactNode", defaultValue: "-", description: "Optional trailing control." },
    ],
  },
  {
    slug: "text-block",
    title: "Text Block",
    category: "Primitives",
    description: "The section-body layout: a category chip, a title, a lead line, and body copy.",
    preview: <TextBlockDemo />,
    installation: "Import TextBlock from the local UI primitive.",
    importCode: `import { TextBlock } from "@/components/ui/text-block"`,
    usage: "Use as the text column inside service and article sections.",
    composition: [
      "Optional category chip uses brand-700 fill with a white icon.",
      "Title is xxxl brand-700; lead is m brand-500 bold.",
      "Body copy is xs foreground medium with comfortable line height.",
    ],
    examples: [],
    api: [
      { name: "category", type: "ReactNode", defaultValue: "-", description: "Label for the category chip." },
      { name: "title", type: "ReactNode", defaultValue: "-", description: "Block heading." },
      { name: "lead", type: "ReactNode", defaultValue: "-", description: "Emphasised intro line." },
    ],
  },
  {
    slug: "input-affixes",
    title: "Search & Password",
    category: "Primitives",
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
    ],
  },
  {
    slug: "photo-gallery",
    title: "Photo Gallery",
    category: "Primitives",
    description: "Full-bleed image with responsive height/radii and secondary prev/next navigation.",
    preview: <PhotoGalleryDemo />,
    fullWidthPreview: true,
    installation: "Import PhotoGallery from the local UI primitive.",
    importCode: `import { PhotoGallery } from "@/components/ui/photo-gallery"`,
    usage: "Use on service and article pages to show a set of location or program photos.",
    composition: [
      "Height steps 227 → 260 → 424 → 410 and radii 16 → 16 → 24 → 32 across breakpoints.",
      "Image is object-cover within an overflow-hidden container.",
      "Prev/next use the secondary button variant, anchored bottom-left.",
    ],
    examples: [],
    api: [
      { name: "images", type: "{ src, alt }[]", defaultValue: "[]", description: "Photos to cycle through." },
      { name: "showNavigation", type: "boolean", defaultValue: "true", description: "Toggles the prev/next controls." },
    ],
  },
  {
    slug: "calendar",
    title: "Calendar",
    category: "Primitives",
    description: "Month date-picker built on react-day-picker, styled to the DS (selected, today, nav).",
    preview: <CalendarDemo />,
    installation: "Import Calendar from the local UI primitive (depends on react-day-picker).",
    importCode: `import { Calendar } from "@/components/ui/calendar"`,
    usage: "Use for date selection in the agenda, booking flows, and admin filters.",
    composition: [
      "White card surface with bold month title and chevron nav.",
      "Monday-start weekdays in muted; rounded day cells.",
      "Selected day shows a rounded outline; today is teal + bold.",
    ],
    examples: [],
    api: [
      { name: "mode", type: "single | range | multiple", defaultValue: "single", description: "Selection mode (react-day-picker)." },
      { name: "selected", type: "Date | Date[]", defaultValue: "-", description: "Controlled selection." },
      { name: "onSelect", type: "(date) => void", defaultValue: "-", description: "Selection callback." },
    ],
  },
  {
    slug: "agenda",
    title: "Agenda",
    category: "System components",
    description: "Event browser: category filter chips, a calendar with event dots, and a day event list.",
    preview: <AgendaDemo />,
    fullWidthPreview: true,
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
    description: "Expandable FAQ rows with a number badge, teal title, optional Label tag, and +/- toggle.",
    preview: <AccordionDemo />,
    installation: "Import Accordion parts from the local UI primitive (Base UI).",
    importCode: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`,
    usageCode: `<Accordion defaultValue={["01"]}>\n  <AccordionItem value="01">\n    <AccordionTrigger>How do I register?</AccordionTrigger>\n    <AccordionContent>Create a profile to begin.</AccordionContent>\n  </AccordionItem>\n</Accordion>`,
    usage: "Use for FAQs and progressively-disclosed help content.",
    composition: [
      "Each item has a brand-200 number badge, teal title, and optional Label tag.",
      "The +/- toggle flips with the open state; rows are split by a 2px brand-200 divider.",
      "Single-open by default; pass openMultiple on the Root to allow several.",
      "Built on a headless Collapsible primitive — the same base the admin editor rows use.",
    ],
    examples: [],
    api: [
      { name: "number", type: "ReactNode", defaultValue: "-", description: "Leading badge content (e.g. 01)." },
      { name: "tag", type: "ReactNode", defaultValue: "-", description: "Optional trailing Label tag." },
      { name: "openMultiple", type: "boolean", defaultValue: "false", description: "Allow multiple open items (Root)." },
    ],
  },
  {
    slug: "select",
    title: "Select",
    category: "Primitives",
    description: "Single-value menu control for filters, settings, and compact option choices.",
    preview: <SelectDemo />,
    installation: "Import Select primitives from the local UI wrapper.",
    importCode: `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"`,
    usageCode: `<Select>\n  <SelectTrigger className="w-[180px]">\n    <SelectValue placeholder="Theme" />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="light">Light</SelectItem>\n    <SelectItem value="dark">Dark</SelectItem>\n    <SelectItem value="system">System</SelectItem>\n  </SelectContent>\n</Select>`,
    usage: "Use Select where a bounded option list is clearer than free-form input.",
    composition: [
      "Trigger uses the same 44px / 16px control shape as Input.",
      "SelectContent is a rounded menu with DS border and option states.",
      "Use size=\"sm\" for compact admin toolbars.",
    ],
    examples: [],
    api: [
      { name: "size", type: "default | sm", defaultValue: "default", description: "Controls trigger height and minimum width." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables the root select." },
    ],
  },
  {
    slug: "table",
    title: "Table",
    category: "Primitives",
    description: "Structured data table with contained horizontal scrolling and DS dividers.",
    preview: <TableExample />,
    installation: "Import table parts from the local UI primitive.",
    importCode: `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"`,
    usageCode: `<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Name</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell>Sarah Chen</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>`,
    usage: "Use tables for contacts, admin listings, and dense comparable data.",
    composition: [
      "Tables are wrapped in an overflow-x-auto container.",
      "Rows and headers use 2px DS dividers.",
      "Set min-width on the table for mobile scrollers.",
    ],
    examples: [
      {
        title: "Two-column reference table",
        description:
          "A bold label column paired with a bulleted content column — for documents-required and comparison layouts. Supports nested bullets and inline links.",
        preview: <ReferenceTableExample />,
        fullWidth: true,
      },
    ],
    api: [
      { name: "className", type: "string", defaultValue: "-", description: "Use min-w values for predictable mobile scrolling." },
    ],
  },
  {
    slug: "main-menu",
    title: "Main Menu",
    category: "System components",
    description: "Sticky public-site navigation with Lisbon Project lockup, menu action, and donate CTA.",
    preview: <SiteHeader sticky={false} />,
    fullWidthPreview: true,
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
    description: "Admin Hub landing hero with DS illustration, title block, and embedded quick access cards.",
    preview: <Hero />,
    fullWidthPreview: true,
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
    description: "Four-card shortcut grid used inside the home hero and standalone contexts.",
    preview: <QuickAccess />,
    fullWidthPreview: true,
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
    description: "Two-column service information list with semantic icons and compact card rows.",
    preview: <ServicesGrid />,
    fullWidthPreview: true,
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
    description: "Searchable and filterable contacts section with DS table, badges, and action buttons.",
    preview: <AllContacts />,
    fullWidthPreview: true,
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
    description: "Map, address, opening hours, and contact information section used near page footers.",
    preview: <MapVisit />,
    fullWidthPreview: true,
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
      { name: "MAP_QUERY", type: "constant", defaultValue: "Rua Carvalho Araujo 66B", description: "Google Maps query used by the iframe." },
    ],
  },
  {
    slug: "service-page",
    title: "Service Page",
    category: "System components",
    description: "Service-category composition combining hero, topic cards, contacts, and location sections.",
    preview: (
      <>
        <ServiceHero title={familyService.title} breadcrumb={familyService.breadcrumb} intro={familyService.intro} iconKey={familyService.iconKey} />
        <TopicsGrid topics={familyService.topics} categorySlug={familyService.slug} />
      </>
    ),
    fullWidthPreview: true,
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
    description: "Article view composition with hero, alternating content panels, FAQ, map, and footer-ready spacing.",
    preview: <ArticleView slug="family-child-support" topicSlug="basic-education" />,
    fullWidthPreview: true,
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
    slug: "footer",
    title: "Footer",
    category: "System components",
    description: "Newsletter band and legal/social footer used on public site pages.",
    preview: <SiteFooter />,
    fullWidthPreview: true,
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
