import {
  Archive,
  BarChart3,
  BookUser,
  Boxes,
  Home,
  Inbox,
  Lock,
  Settings,
  ShieldCheck
} from "lucide-react";

export const primaryNavigation = [
  { href: "/overview", label: "Overview", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/leads", label: "Leads", icon: BookUser },
  { href: "/ads", label: "Ads", icon: BarChart3 },
  { href: "/contacts", label: "Contacts", icon: Boxes },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/connected-accounts", label: "Connected Accounts", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

export const secondaryNavigation = [
  { href: "/settings/security", label: "Security", icon: Lock },
  { href: "/settings/audit", label: "Audit", icon: ShieldCheck }
] as const;

export const pageTitles: Record<string, string> = {
  "/overview": "Operational overview",
  "/inbox": "Unified inbox",
  "/leads": "Lead pipeline",
  "/ads": "Ad account reporting",
  "/contacts": "CRM contacts",
  "/archive": "Archive and preservation",
  "/connected-accounts": "Connected Meta assets",
  "/settings": "Settings",
  "/settings/security": "Security controls",
  "/settings/audit": "Audit activity"
};
