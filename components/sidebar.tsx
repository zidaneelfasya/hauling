"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  Fuel,
  Wrench,
  CircleDollarSign,
  Receipt,
  Database,
  History,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  nama: string;
  role: string;
  email?: string;
}

interface SidebarProps {
  profile: Profile;
  signOutAction: () => Promise<void>;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/protected",
    icon: LayoutDashboard,
    roles: ["Owner", "Full Access", "Admin", "Supervisor", "Driver"],
  },
  {
    title: "Armada Unit DT",
    href: "/protected/units",
    icon: Truck,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Data Driver",
    href: "/protected/drivers",
    icon: Users,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Ritase Tambang",
    href: "/protected/ritase",
    icon: FileText,
    roles: ["Owner", "Full Access", "Admin", "Supervisor", "Driver"],
  },
  {
    title: "Log BBM",
    href: "/protected/bbm",
    icon: Fuel,
    roles: ["Owner", "Full Access", "Admin", "Supervisor", "Driver"],
  },
  {
    title: "Maintenance",
    href: "/protected/maintenance",
    icon: Wrench,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Payroll Gaji",
    href: "/protected/payroll",
    icon: CircleDollarSign,
    roles: ["Owner", "Full Access", "Admin", "Driver"],
  },
  {
    title: "Invoice Customer",
    href: "/protected/invoices",
    icon: Receipt,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Master Data",
    href: "/protected/master",
    icon: Database,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Audit Log",
    href: "/protected/audit-logs",
    icon: History,
    roles: ["Owner", "Full Access", "Admin"],
  },
];

export function Sidebar({ profile, signOutAction }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md bg-card border text-card-foreground shadow-sm hover:bg-muted"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-45 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded bg-orange-600 flex items-center justify-center font-bold text-white text-xs">
                N
              </span>
              <span className="font-extrabold text-sm tracking-wide text-foreground uppercase">
                Hauling <span className="text-orange-500">HMS</span>
              </span>
            </div>
          ) : (
            <div className="mx-auto h-6 w-6 rounded bg-orange-600 flex items-center justify-center font-bold text-white text-xs">
              N
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-foreground">
                  {profile.nama}
                </p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/protected" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                  isActive
                    ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0",
                    isActive ? "text-orange-500" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t bg-muted/20">
          <button
            onClick={() => signOutAction()}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
