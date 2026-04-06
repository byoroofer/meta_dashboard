import {
  Archive,
  BarChart3,
  BookUser,
  Boxes,
  BriefcaseBusiness,
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
  { href: "/marketplace-deals", label: "Marketplace Deals", icon: BriefcaseBusiness },
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
  "/marketplace-deals": "Marketplace deal intelligence",
  "/archive": "Archive and preservation",
  "/connected-accounts": "Connected Meta assets",
  "/settings": "Settings",
  "/settings/security": "Security controls",
  "/settings/audit": "Audit activity"
};
