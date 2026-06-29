"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ChevronRight, Home } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  
  const pathSegments = pathname.split("/").filter(Boolean);
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    
    let label = segment;
    if (segment === "dashboard") label = "Dashboard";
    else if (segment === "units") label = "Armada Unit DT";
    else if (segment === "drivers") label = "Driver";
    else if (segment === "ritase") label = "Ritase";
    else if (segment === "bbm") label = "BBM";
    else if (segment === "maintenance") label = "Maintenance";
    else if (segment === "payroll") label = "Payroll";
    else if (segment === "invoices") label = "Invoices";
    else if (segment === "master") label = "Master Data";
    else if (segment === "audit-logs") label = "Audit Log";
    
    if (label === segment) {
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    }
    
    const isLast = index === pathSegments.length - 1;
    
    return { label, href, isLast };
  });

  const isDashboardOnly = pathSegments.length === 1 && pathSegments[0] === "dashboard";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-background/95 backdrop-blur border-b select-none">
      <div className="flex items-center gap-2 pl-12 lg:pl-0">
        <Home size={15} className="text-muted-foreground shrink-0" />
        <ChevronRight size={14} className="text-muted-foreground shrink-0" />
        
        {isDashboardOnly ? (
          <span className="text-sm font-semibold text-foreground">Dashboard</span>
        ) : (
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
              Dashboard
            </Link>
            {breadcrumbs.filter(b => b.label !== "Dashboard").map((crumb) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                {crumb.isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="text-muted-foreground hover:text-foreground font-medium transition-colors truncate max-w-[80px] sm:max-w-none">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
