"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// DS lacks these nav/utility glyphs — kept on lucide, flagged for Rafael.
import {
  BarChart3,
  ClipboardCheck,
  Contact,
  ExternalLink,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Sparkles,
} from "lucide-react";

import { IconChatBot, IconMail, IconNotes, IconUsers } from "@/components/icons/ds-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/(frontend)/login/actions";

// The unified team-workspace sidebar for the /admin group — content editor
// (Quick Access / Services / Articles), analytics (Insights / History) and team
// management (admins only). Built on the shadcn Sidebar: collapses to an icon
// rail (⌘B or the rail), and the mobile drawer is the primitive's own Sheet.
const navGroups = [
  {
    title: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/quick-access", label: "Quick Access", icon: Sparkles },
      { href: "/admin/services", label: "Services & Information", icon: ListChecks },
      { href: "/admin/articles", label: "Articles", icon: IconNotes },
      { href: "/admin/contacts", label: "Contacts", icon: Contact },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/admin/insights", label: "Insights", icon: BarChart3 },
      { href: "/admin/conversations", label: "Conversations", icon: IconChatBot },
      { href: "/admin/history", label: "History", icon: History },
    ],
  },
  {
    title: "Admin",
    adminOnly: true,
    items: [
      // `badge: "pendingReviews"` renders the live count passed by the layout.
      { href: "/admin/review", label: "Review", icon: ClipboardCheck, badge: "pendingReviews" },
      { href: "/admin/users", label: "Team", icon: IconUsers },
      { href: "/admin/subscribers", label: "Subscribers", icon: IconMail },
    ],
  },
];

function initials(email) {
  const base = (email || "?").split("@")[0].replace(/[^a-z0-9]/gi, "");
  return (base.slice(0, 2) || "?").toUpperCase();
}

export function AdminSidebar({ userEmail, isAdmin = false, pendingReviews = 0 }) {
  const pathname = usePathname();
  const groups = navGroups.filter((g) => !g.adminOnly || isAdmin);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <IconNotes className="size-4.5" />
          </span>
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-ds-s font-bold text-brand-dark">Admin Hub</span>
            <span className="text-ds-xxs font-medium text-muted-foreground">Team workspace</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const badge = item.badge === "pendingReviews" ? pendingReviews : 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                    {badge > 0 ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  // No `tooltip` here: it would wrap the button in a
                  // TooltipTrigger and swallow the dropdown's own trigger wiring.
                  <SidebarMenuButton size="lg">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-ds-xxs font-bold text-primary">
                      {initials(userEmail)}
                    </span>
                    <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-ds-xs font-bold text-foreground">Signed in</span>
                      <span className="truncate text-ds-xxs font-medium text-muted-foreground">
                        {userEmail}
                      </span>
                    </span>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {userEmail}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link href="/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      View live site
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link href="/components" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      Design system
                    </Link>
                  }
                />
                <DropdownMenuSeparator />
                <form action={logout}>
                  <DropdownMenuItem
                    variant="destructive"
                    render={
                      <button type="submit" className="w-full">
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    }
                  />
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
