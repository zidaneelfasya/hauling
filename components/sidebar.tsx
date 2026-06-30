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
  User,
  ChevronUp,
  ChevronsUpDown,
  UserCheck,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Owner", "Full Access", "Admin", "Supervisor", "Driver"],
  },
  {
    title: "Transaksi",
    href: "/dashboard/financial",
    icon: Wallet,
    roles: ["Owner", "Full Access", "Admin"],
  },
  {
    title: "Armada Unit DT",
    href: "/dashboard/units",
    icon: Truck,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Data Driver",
    href: "/dashboard/drivers",
    icon: Users,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Ritase Tambang",
    href: "/dashboard/ritase",
    icon: FileText,
    roles: ["Owner", "Full Access", "Admin", "Supervisor", "Driver"],
  },
  {
    title: "Maintenance",
    href: "/dashboard/maintenance",
    icon: Wrench,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Payroll Gaji",
    href: "/dashboard/payroll",
    icon: CircleDollarSign,
    roles: ["Owner", "Full Access", "Admin", "Driver"],
  },
  {
    title: "Invoice Customer",
    href: "/dashboard/invoices",
    icon: Receipt,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Master Data",
    href: "/dashboard/master",
    icon: Database,
    roles: ["Owner", "Full Access", "Admin", "Supervisor"],
  },
  {
    title: "Audit Log",
    href: "/dashboard/audit-logs",
    icon: History,
    roles: ["Owner", "Full Access", "Admin"],
  },
];

export function Sidebar({ profile, signOutAction }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close user dropup when clicking outside
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isUserMenuOpen]);

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
            <Link href="/dashboard" className="flex items-center gap-2 pl-1 hover:opacity-90 transition-opacity overflow-hidden">
              <img src="/logo/light-logo.svg" alt="Horizon Logo" className="h-9 w-auto dark:hidden select-none shrink-0" />
              <img src="/logo/dark-logo.svg" alt="Horizon Logo" className="h-9 w-auto hidden dark:block select-none shrink-0" />
              <span className="font-extrabold text-sm tracking-wide text-foreground uppercase  select-none">
                PT azure prima capital
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto hover:opacity-90 transition-opacity">
              <img src="/logo/light-logo.svg" alt="Horizon Logo" className="h-8 w-8 dark:hidden select-none" />
              <img src="/logo/dark-logo.svg" alt="Horizon Logo" className="h-8 w-8 hidden dark:block select-none" />
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>



        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

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

        {/* User Card & Dropup Menu in Footer */}
        <div className="relative p-4 border-t bg-muted/20 user-menu-container">
          {/* Dropup Options Menu */}
          {isUserMenuOpen && (
            <div
              className={cn(
                "absolute bottom-16 z-50 py-1.5 w-56 rounded-lg border bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150",
                isCollapsed ? "left-2" : "left-4 right-4 w-auto"
              )}
            >
              <div className="px-3 py-1.5 border-b text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Opsi Pengguna
              </div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left"
              >
                <User size={15} className="text-muted-foreground" />
                <span>Profil Saya</span>
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  signOutAction();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left border-t mt-1 pt-2"
              >
                <LogOut size={15} />
                <span>Log Out / Keluar</span>
              </button>
            </div>
          )}

          {/* User Card Trigger */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/80 transition-colors text-left focus:outline-none"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden leading-none">
                  <p className="text-sm font-semibold truncate text-foreground mb-1">
                    {profile.nama}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-wider">
                    {profile.role}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronsUpDown size={16} className="text-muted-foreground shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Profile Details Dialog */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck size={18} className="text-orange-500" />
              Detail Profil Pengguna
            </DialogTitle>
            <DialogDescription className="text-xs">
              Informasi akun dan hak akses Anda di sistem manajemen hauling.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="h-12 w-12 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-foreground">{profile.nama}</h4>
                <p className="text-xs text-muted-foreground">PT Hauling Kembar Jaya</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-muted/50">
                <span className="text-muted-foreground">Jabatan / Role:</span>
                <span className="font-bold text-orange-500 uppercase">{profile.role}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-muted/50">
                <span className="text-muted-foreground">Status Keanggotaan:</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                  Aktif
                </Badge>
              </div>

              <div className="space-y-1 py-1.5">
                <span className="text-muted-foreground block mb-1">Cakupan Hak Akses:</span>
                <p className="text-[11px] leading-relaxed text-muted-foreground bg-muted/40 p-2 rounded border">
                  {profile.role === "Owner" || profile.role === "Full Access" || profile.role === "Admin" ? (
                    "Akses penuh sistem: Manajemen armada unit, registrasi driver, manajemen kontrak hauling, persetujuan ritase harian, kalkulasi payroll gaji, invoicing customer, dan peninjauan riwayat audit log aktivitas."
                  ) : profile.role === "Supervisor" ? (
                    "Akses supervisor: Manajemen armada unit, registrasi driver, peninjauan ritase harian, pemantauan log BBM, perbaikan maintenance, invoicing customer, dan konfigurasi master data lokasi tambang."
                  ) : (
                    "Akses driver operasional: Mengajukan laporan ritase hauling harian, mencatat log pengisian bahan bakar BBM solar, serta meninjau slip payroll gaji bulanan pribadi."
                  )}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setIsProfileModalOpen(false)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
