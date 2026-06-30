"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Truck,
  TrendingUp,
  TrendingDown,
  Fuel,
  Wrench,
  DollarSign,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  ChevronRight,
  Activity,
  Layers,
  Scale,
  Users
} from "lucide-react";

interface DashboardViewProps {
  activeUnits: number;
  maintenanceUnits: number;
  activeDrivers: number;
  ritase: any[];
  bbm: any[];
  maintenance: any[];
  invoices: any[];
  isDriver: boolean;
  hasProfile?: boolean;
  contracts?: any[];
  units: any[];
  drivers: any[];
  payrolls: any[];
  cashFlow: any[];
  operationalExpenses: any[];
}

export function DashboardView({
  activeUnits,
  maintenanceUnits,
  activeDrivers,
  ritase = [],
  bbm = [],
  maintenance = [],
  invoices = [],
  isDriver,
  hasProfile = true,
  contracts = [],
  units = [],
  drivers = [],
  payrolls = [],
  cashFlow = [],
  operationalExpenses = []
}: DashboardViewProps) {
  // Global filter states
  const [selectedContractId, setSelectedContractId] = useState<string>("all");
  const [recapTab, setRecapTab] = useState<"daily" | "monthly" | "yearly">("daily");

  // Specific dates for period selection
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-25"); // Defaults to end of seeded records
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // June
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [dailyStartDate, setDailyStartDate] = useState<string>("2026-06-20");
  const [dailyEndDate, setDailyEndDate] = useState<string>("2026-06-25");

  // Helper currency formatter
  const formatCurrency = (val: number) => {
    return "Rp " + Math.round(val).toLocaleString("id-ID");
  };

  // Helper trend calculator
  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  // 1. In-memory cash flow filtration mapped to selected contract
  const filteredCashFlowList = useMemo(() => {
    if (selectedContractId === "all") return cashFlow;

    return cashFlow.filter(cf => {
      if (cf.source_type === "Invoice") {
        const inv = invoices.find(i => i.id === cf.source_id);
        return inv?.kontrak_hauling_id === selectedContractId;
      }
      if (cf.source_type === "BBM") {
        const fuel = bbm.find(b => b.id === cf.source_id);
        if (fuel) {
          const unit = units.find(u => u.id === fuel.unit_id);
          return unit?.kontrak_hauling_id === selectedContractId;
        }
      }
      if (cf.source_type === "Payroll") {
        const pr = payrolls.find(p => p.id === cf.source_id);
        if (pr) {
          const driver = drivers.find(d => d.id === pr.driver_id);
          return driver?.kontrak_hauling_id === selectedContractId;
        }
      }
      // Manual and corporate Operational expenses do not directly belong to a specific contract
      return false;
    });
  }, [selectedContractId, cashFlow, invoices, bbm, units, payrolls, drivers]);

  // 2. Compute date boundaries for current and previous periods
  const periodBoundaries = useMemo(() => {
    if (recapTab === "daily") {
      const start = new Date(dailyStartDate);
      const end = new Date(dailyEndDate);
      const msDiff = end.getTime() - start.getTime();
      const daysDiff = Math.max(1, Math.round(msDiff / (24 * 60 * 60 * 1000)) + 1);

      const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const prevStart = new Date(prevEnd.getTime() - (daysDiff - 1) * 24 * 60 * 60 * 1000);

      const prevDateStrStart = prevStart.toISOString().substring(0, 10);
      const prevDateStrEnd = prevEnd.toISOString().substring(0, 10);

      const formatLabel = (dStr: string) => {
        return new Date(dStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      };

      return {
        start: dailyStartDate,
        end: dailyEndDate,
        prevStart: prevDateStrStart,
        prevEnd: prevDateStrEnd,
        label: dailyStartDate === dailyEndDate
          ? formatLabel(dailyStartDate)
          : `${formatLabel(dailyStartDate)} - ${formatLabel(dailyEndDate)}`,
        prevLabel: prevDateStrStart === prevDateStrEnd
          ? formatLabel(prevDateStrStart)
          : `${formatLabel(prevDateStrStart)} - ${formatLabel(prevDateStrEnd)}`,
      };
    } else if (recapTab === "monthly") {
      // Current system time is 2026-06-30 (June 2026)
      const now = new Date("2026-06-30T18:48:15+07:00");
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-indexed

      let targetMonth = selectedMonth;
      let targetYear = selectedYear;
      let isShifted = false;

      // Has the selected month ended?
      const hasEnded = (selectedYear < currentYear) || (selectedYear === currentYear && selectedMonth < currentMonth);
      if (!hasEnded) {
        // Shift to the previous month relative to the current local time (i.e. May 2026)
        targetMonth = currentMonth - 1;
        targetYear = currentYear;
        if (targetMonth === 0) {
          targetMonth = 12;
          targetYear = currentYear - 1;
        }
        isShifted = true;
      }

      const currentLastDay = new Date(targetYear, targetMonth, 0).getDate();
      const currentStart = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
      const currentEnd = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(currentLastDay).padStart(2, "0")}`;

      let prevMonth = targetMonth - 1;
      let prevYear = targetYear;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = targetYear - 1;
      }
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
      const prevEnd = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(prevLastDay).padStart(2, "0")}`;

      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

      return {
        start: currentStart,
        end: currentEnd,
        prevStart,
        prevEnd,
        label: `${monthNames[targetMonth - 1]} ${targetYear}`,
        prevLabel: `${monthNames[prevMonth - 1]} ${prevYear}`,
        targetMonth,
        targetYear,
        isShifted,
        originalLabel: `${monthNames[selectedMonth - 1]} ${selectedYear}`,
      };
    } else {
      // Yearly
      const currentStart = `${selectedYear}-01-01`;
      const currentEnd = `${selectedYear}-12-31`;

      const prevStart = `${selectedYear - 1}-01-01`;
      const prevEnd = `${selectedYear - 1}-12-31`;

      return {
        start: currentStart,
        end: currentEnd,
        prevStart,
        prevEnd,
        label: `Tahun ${selectedYear}`,
        prevLabel: `Tahun ${selectedYear - 1}`,
      };
    }
  }, [recapTab, selectedDate, selectedMonth, selectedYear, dailyStartDate, dailyEndDate]);

  // 3. Centralized calculator for dashboard metrics in any range
  const computeMetrics = (start: string, end: string) => {
    // A. Approved Ritase Revenue
    let periodRitase = ritase.filter(r => r.status === "Approved" && r.tanggal >= start && r.tanggal <= end);
    if (selectedContractId !== "all") {
      periodRitase = periodRitase.filter(r => r.kontrak_hauling_id === selectedContractId);
    }
    const revenue = periodRitase.reduce((sum, r) => sum + (Number(r.jumlah_ritase) * Number(r.tarif_per_ritase)), 0);
    const trips = periodRitase.reduce((sum, r) => sum + Number(r.jumlah_ritase), 0);

    // B. Direct Costs (HPP)
    const driverSalaryHpp = periodRitase.reduce((sum, r) => sum + (Number(r.jumlah_ritase) * 50000), 0);
    const fuelHpp = periodRitase.reduce((sum, r) => sum + Number(r.biaya_bbm || 0), 0);
    const directCost = driverSalaryHpp + fuelHpp;
    const grossProfit = revenue - directCost;

    // C. Operating Expenses (Rent, Maintenance, Office Overhead)
    let unitIdsForContract: Set<string> | null = null;
    if (selectedContractId !== "all") {
      const contractUnits = units.filter(u => u.kontrak_hauling_id === selectedContractId);
      unitIdsForContract = new Set(contractUnits.map(u => u.id));
    }

    // C.1 Maintenance Cost
    let periodMaint = maintenance.filter(m => m.status === "Completed" && m.tanggal >= start && m.tanggal <= end);
    if (unitIdsForContract) {
      periodMaint = periodMaint.filter(m => unitIdsForContract!.has(m.unit_id));
    }
    const maintCost = periodMaint.reduce((sum, m) => sum + Number(m.biaya), 0);

    // C.2 Rental Cost (pro-rated based on days in period)
    let activeUnitsForContract = units;
    if (selectedContractId !== "all") {
      activeUnitsForContract = units.filter(u => u.kontrak_hauling_id === selectedContractId);
    }
    const monthlyRent = activeUnitsForContract.reduce((sum, u) => {
      return sum + (Number(u.biaya_sewa || 0) / Math.max(1, Number(u.durasi_sewa_bulan || 1)));
    }, 0);

    const msDiff = new Date(end).getTime() - new Date(start).getTime();
    const daysDiff = Math.max(1, Math.round(msDiff / (24 * 60 * 60 * 1000)) + 1);
    let rentCost = 0;
    if (daysDiff === 1) {
      rentCost = monthlyRent / 30; // Pro-rate daily
    } else if (daysDiff > 25 && daysDiff < 32) {
      rentCost = monthlyRent; // Full month
    } else {
      rentCost = (monthlyRent * daysDiff) / 30; // Custom scaling
    }

    // C.3 Corporate/Indirect Operational Overhead (only displayed under consolidated "All Contracts")
    let opCost = 0;
    if (selectedContractId === "all") {
      const periodOps = operationalExpenses.filter(op => op.tanggal >= start && op.tanggal <= end);
      opCost = periodOps.reduce((sum, op) => sum + Number(op.nominal), 0);
    }

    const operatingExpense = maintCost + rentCost + opCost;
    const netProfit = grossProfit - operatingExpense;

    // D. Cash Flow Details
    const periodCashFlow = filteredCashFlowList.filter(cf => cf.tanggal >= start && cf.tanggal <= end);
    let cashIn = 0;
    let cashOut = 0;
    periodCashFlow.forEach(cf => {
      if (cf.jenis === "Pemasukan") {
        cashIn += Number(cf.nominal);
      } else {
        cashOut += Number(cf.nominal);
      }
    });
    const netCashFlow = cashIn - cashOut;

    // E. Running Cash Balance (aggregated from beginning of time up to the end date of selected period)
    const runningCashFlow = filteredCashFlowList.filter(cf => cf.tanggal <= end);
    let cumulativeCashIn = 0;
    let cumulativeCashOut = 0;
    runningCashFlow.forEach(cf => {
      if (cf.jenis === "Pemasukan") {
        cumulativeCashIn += Number(cf.nominal);
      } else {
        cumulativeCashOut += Number(cf.nominal);
      }
    });
    const cashBalance = cumulativeCashIn - cumulativeCashOut;

    return {
      revenue,
      trips,
      driverSalaryHpp,
      fuelHpp,
      directCost,
      grossProfit,
      maintCost,
      rentCost,
      opCost,
      operatingExpense,
      netProfit,
      cashIn,
      cashOut,
      netCashFlow,
      cashBalance
    };
  };

  // 4. Calculate final values for current and previous period
  const currentMetrics = useMemo(() => {
    return computeMetrics(periodBoundaries.start, periodBoundaries.end);
  }, [periodBoundaries, selectedContractId, ritase, maintenance, units, operationalExpenses, filteredCashFlowList]);

  const previousMetrics = useMemo(() => {
    return computeMetrics(periodBoundaries.prevStart, periodBoundaries.prevEnd);
  }, [periodBoundaries, selectedContractId, ritase, maintenance, units, operationalExpenses, filteredCashFlowList]);

  // 5. Trend compilation for executive metrics
  const trends = useMemo(() => {
    return {
      revenue: calculateTrend(currentMetrics.revenue, previousMetrics.revenue),
      netProfit: calculateTrend(currentMetrics.netProfit, previousMetrics.netProfit),
      cashBalance: calculateTrend(currentMetrics.cashBalance, previousMetrics.cashBalance),
      trips: calculateTrend(currentMetrics.trips, previousMetrics.trips),
      cashIn: calculateTrend(currentMetrics.cashIn, previousMetrics.cashIn),
      cashOut: calculateTrend(currentMetrics.cashOut, previousMetrics.cashOut),
      netCashFlow: calculateTrend(currentMetrics.netCashFlow, previousMetrics.netCashFlow),
    };
  }, [currentMetrics, previousMetrics]);

  // 6. Generate business trends chart datasets based on selected period
  const chartData = useMemo(() => {
    const list: any[] = [];
    if (recapTab === "daily") {
      // Daily: day-by-day between dailyStartDate and dailyEndDate
      const start = new Date(dailyStartDate);
      const end = new Date(dailyEndDate);
      const daysCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);

      for (let i = 0; i < daysCount; i++) {
        const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().substring(0, 10);
        const m = computeMetrics(dateStr, dateStr);
        list.push({
          label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
          revenue: m.revenue,
          profit: m.netProfit,
          trips: m.trips,
          cashBalance: m.cashBalance,
        });
      }
    } else if (recapTab === "monthly") {
      const tMonth = (periodBoundaries as any).targetMonth || selectedMonth;
      const tYear = (periodBoundaries as any).targetYear || selectedYear;
      // Monthly: Day 1 to last day of targetMonth
      const lastDay = new Date(tYear, tMonth, 0).getDate();
      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${tYear}-${String(tMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const m = computeMetrics(dateStr, dateStr);
        list.push({
          label: `${day}`,
          revenue: m.revenue,
          profit: m.netProfit,
          trips: m.trips,
          cashBalance: m.cashBalance,
        });
      }
    } else {
      // Yearly: 12 months of selectedYear
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let mIdx = 1; mIdx <= 12; mIdx++) {
        const monthStart = `${selectedYear}-${String(mIdx).padStart(2, "0")}-01`;
        const lastDayNum = new Date(selectedYear, mIdx, 0).getDate();
        const monthEnd = `${selectedYear}-${String(mIdx).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;
        const m = computeMetrics(monthStart, monthEnd);
        list.push({
          label: monthNames[mIdx - 1],
          revenue: m.revenue,
          profit: m.netProfit,
          trips: m.trips,
          cashBalance: m.cashBalance,
        });
      }
    }
    return list;
  }, [recapTab, selectedDate, selectedMonth, selectedYear, dailyStartDate, dailyEndDate, periodBoundaries, selectedContractId, ritase, maintenance, units, operationalExpenses, filteredCashFlowList]);

  // Check if period has any cash flow data (for monthly/yearly data check)
  const periodHasData = useMemo(() => {
    const { start, end } = periodBoundaries;
    const periodCashFlow = filteredCashFlowList.filter(cf => cf.tanggal >= start && cf.tanggal <= end);
    return periodCashFlow.length > 0;
  }, [periodBoundaries, filteredCashFlowList]);

  // Compute category-based breakdown for cash flow in the period
  const categoryBreakdown = useMemo(() => {
    const { start, end } = periodBoundaries;
    const periodCashFlow = filteredCashFlowList.filter(cf => cf.tanggal >= start && cf.tanggal <= end);

    const incomeMap: { [cat: string]: number } = {};
    const expenseMap: { [cat: string]: number } = {};

    periodCashFlow.forEach(cf => {
      const nom = Number(cf.nominal || 0);
      const cat = cf.kategori || "Lainnya";
      if (cf.jenis === "Pemasukan") {
        incomeMap[cat] = (incomeMap[cat] || 0) + nom;
      } else {
        expenseMap[cat] = (expenseMap[cat] || 0) + nom;
      }
    });

    const income = Object.entries(incomeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const expense = Object.entries(expenseMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { income, expense };
  }, [periodBoundaries, filteredCashFlowList]);


  // ----------------------------------------------------
  // DRIVER DASHBOARD VIEW (SIMPLE & CLEAN ROLE PORTAL)
  // ----------------------------------------------------
  if (isDriver) {
    // Find driver specific records
    const driverRecord = drivers.find(d => d.profile_id !== null); // Assumes current log matches driver
    const driverRitase = ritase.filter(r => r.driver_id === driverRecord?.id);

    const driverApprovedToday = driverRitase.filter(r => r.tanggal === selectedDate && r.status === "Approved");
    const driverApprovedMonth = driverRitase.filter(r => {
      const parts = r.tanggal.split("-");
      return r.status === "Approved" && parts[0] === String(selectedYear) && Number(parts[1]) === selectedMonth;
    });

    const totalRitaseToday = driverApprovedToday.reduce((sum, r) => sum + r.jumlah_ritase, 0);
    const totalRitaseMonth = driverApprovedMonth.reduce((sum, r) => sum + r.jumlah_ritase, 0);
    const accumulatedTrips = driverRecord?.accumulated_ritase || 0;

    return (
      <div className="space-y-8 select-none p-2 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Portal Driver
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Catatan pengiriman tambang pribadi Anda
            </p>
          </div>
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 font-bold rounded-full">
            Driver Aktif
          </Badge>
        </div>

        {/* Warn if Profile trigger hasn't finished schema run */}
        {!hasProfile && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-200 p-4 rounded-xl shadow-sm">
            <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400">Pemberitahuan Profil</h4>
            <p className="text-xs mt-1 leading-relaxed">
              Profil database untuk akun ini belum dibuat. Hubungi IT administrator untuk menyelaraskan akun Anda di tabel profiles.
            </p>
          </div>
        )}

        {/* Driver stats cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ritase Hari Ini
              </CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{totalRitaseToday} Rit</div>
              <p className="text-xs text-muted-foreground mt-1">Pada tanggal {selectedDate}</p>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ritase Bulan Ini
              </CardTitle>
              <Layers className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{totalRitaseMonth} Rit</div>
              <p className="text-xs text-muted-foreground mt-1">Periode Juni 2026</p>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Belum Dibayarkan
              </CardTitle>
              <Wallet className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{accumulatedTrips} Rit</div>
              <p className="text-xs text-muted-foreground mt-1">Menunggu penyusunan payroll</p>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status Armada
              </CardTitle>
              <Truck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{activeUnits} DT</div>
              <p className="text-xs text-muted-foreground mt-1">{maintenanceUnits} unit sedang maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal Logs */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border rounded-2xl bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">Log Ritase Terakhir Anda</CardTitle>
              <CardDescription className="text-xs">Catatan perjalanan hauling yang diajukan oleh Anda</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Tanggal</TableHead>
                    <TableHead className="text-xs">Unit DT</TableHead>
                    <TableHead className="text-xs">Jenis Pengiriman</TableHead>
                    <TableHead className="text-xs text-right">Ritase</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverRitase.slice(0, 10).map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/40">
                      <TableCell className="text-xs py-3 font-mono">{r.tanggal}</TableCell>
                      <TableCell className="text-xs py-3 font-semibold text-orange-500">
                        {r.unit?.kode_unit}
                      </TableCell>
                      <TableCell className="text-xs py-3">{r.jenis_pengiriman}</TableCell>
                      <TableCell className="text-xs py-3 text-right font-bold">{r.jumlah_ritase} Rit</TableCell>
                      <TableCell className="text-xs py-3 text-right">
                        <Badge variant="outline" className={`font-semibold text-[10px] ${r.status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            r.status === "Rejected" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {driverRitase.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs py-8 text-muted-foreground italic">
                        Belum ada data ritase yang diajukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border rounded-2xl bg-card shadow-sm flex flex-col justify-center items-center p-8 text-center">
            <Users className="h-16 w-16 text-orange-500/80 mb-4 bg-orange-500/5 p-3 rounded-full" />
            <h3 className="font-bold text-base mb-2 text-foreground">Pengawasan Operasional</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
              Gunakan menu sidebar untuk memasukkan data ritase harian atau mencatat pengisian BBM. Silakan hubungi supervisor lapangan untuk melakukan verifikasi (Approval) pengiriman Anda.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMINISTRATOR / OWNER EXECUTIVE DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="space-y-8 select-none p-1 animate-in fade-in duration-500">

      {/* ----------------- GLOBAL FILTERS SECTION ----------------- */}
      <div className="flex flex-row items-center justify-between gap-6 pb-6 border-b border-border/80 flex-wrap lg:flex-nowrap">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rangkuman performa keuangan, profitabilitas, dan arus kas internal HMS.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-row items-center gap-4 flex-nowrap">

          {/* Contract Filter */}
          <div className="flex flex-col gap-1.5 w-[220px]">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Kontrak Kerja</label>
            <Select value={selectedContractId} onValueChange={(val) => setSelectedContractId(val)}>
              <SelectTrigger className="w-full text-xs h-10 bg-card rounded-xl border-border/80 font-medium">
                <SelectValue placeholder="Pilih Kontrak" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="font-semibold text-xs">Semua Kontrak (Konsolidasi)</SelectItem>
                {contracts.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.kode_kontrak} - {c.perusahaan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period Mode Selector */}
          <div className="flex flex-col gap-1.5 w-[240px]">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Periode Rekap</label>
            <div className="flex border border-border/80 rounded-xl p-1 bg-muted/30 h-10 items-center w-full">
              <button
                type="button"
                onClick={() => setRecapTab("daily")}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all h-8 ${recapTab === 'daily' ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Harian
              </button>
              <button
                type="button"
                onClick={() => setRecapTab("monthly")}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all h-8 ${recapTab === 'monthly' ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setRecapTab("yearly")}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-all h-8 ${recapTab === 'yearly' ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tahunan
              </button>
            </div>
          </div>

          {/* Dynamic Period Date/Month/Year Picker */}
          <div className="flex flex-col gap-1.5 w-[280px]">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {recapTab === "daily" ? "Pilih Rentang Tanggal" : recapTab === "monthly" ? "Pilih Bulan" : "Pilih Tahun"}
            </label>

            {recapTab === "daily" && (
              <div className="flex items-center justify-between w-full">
                <input
                  type="date"
                  value={dailyStartDate}
                  onChange={(e) => setDailyStartDate(e.target.value)}
                  className="bg-card border border-border/80 rounded-xl px-2 h-10 text-xs text-foreground font-semibold outline-none focus:ring-1 focus:ring-orange-500 w-[125px]"
                />
                <span className="text-xs text-muted-foreground font-bold px-1">s/d</span>
                <input
                  type="date"
                  value={dailyEndDate}
                  onChange={(e) => setDailyEndDate(e.target.value)}
                  className="bg-card border border-border/80 rounded-xl px-2 h-10 text-xs text-foreground font-semibold outline-none focus:ring-1 focus:ring-orange-500 w-[125px]"
                />
              </div>
            )}

            {recapTab === "monthly" && (
              <div className="flex items-center justify-between w-full">
                <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                  <SelectTrigger className="w-[145px] text-xs h-10 bg-card rounded-xl border-border/80 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, idx) => (
                      <SelectItem key={idx + 1} value={String(idx + 1)} className="text-xs">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                  <SelectTrigger className="w-[125px] text-xs h-10 bg-card rounded-xl border-border/80 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[2025, 2026, 2027].map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recapTab === "yearly" && (
              <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger className="w-full text-xs h-10 bg-card rounded-xl border-border/80 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {[2025, 2026, 2027].map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

        </div>
      </div>

      {/* ----------------- DATA BELUM CUKUP VIEW (Monthly/Yearly with no transactions) ----------------- */}
      {(!periodHasData && (recapTab === "monthly" || recapTab === "yearly")) ? (
        <Card className="border rounded-2xl bg-card shadow-sm flex flex-col justify-center items-center p-12 text-center my-6 animate-in fade-in duration-300">
          <Activity className="h-16 w-16 text-zinc-400 mb-4 bg-muted p-4 rounded-full" />
          <h3 className="font-bold text-lg mb-2 text-foreground">Data Belum Cukup</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Tidak ada catatan transaksi keuangan yang ditemukan untuk {recapTab === "monthly" ? "bulan" : "tahun"} ini ({periodBoundaries.label}). Silakan catat transaksi terlebih dahulu di menu Laporan Keuangan Ledger.
          </p>
        </Card>
      ) : (recapTab === "monthly" || recapTab === "yearly") ? (
        // Monthly & Yearly Premium Cash Flow Layout
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* Shifting Info Alert Banner (for Monthly only when shifted) */}
          {recapTab === "monthly" && (periodBoundaries as any).isShifted && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-2xl flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Pemberitahuan Rekap Periode</h4>
                <p className="text-xs mt-1 leading-relaxed">
                  Menampilkan data untuk bulan <strong>{(periodBoundaries as any).label}</strong> karena bulan <strong>{(periodBoundaries as any).originalLabel}</strong> belum berakhir.
                </p>
              </div>
            </div>
          )}

          {/* 4 Premium Cards: Cash In, Cash Out, Net, Cash Balance */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Cash In */}
            <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Uang Masuk (Cash In)</span>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-500">{formatCurrency(currentMetrics.cashIn)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.cashIn >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.cashIn >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.cashIn >= 0 ? "+" : ""}{trends.cashIn.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Cash Out */}
            <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Uang Keluar (Cash Out)</span>
                <ArrowDownLeft className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-500">{formatCurrency(currentMetrics.cashOut)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.cashOut >= 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                    {trends.cashOut >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.cashOut >= 0 ? "+" : ""}{trends.cashOut.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Surplus / Defisit */}
            <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Surplus / Defisit Kas</span>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-black ${currentMetrics.netCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(currentMetrics.netCashFlow)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.netCashFlow >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.netCashFlow >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.netCashFlow >= 0 ? "+" : ""}{trends.netCashFlow.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Saldo Kas / Uang Kas Akhir Periode */}
            <Card className="border border-blue-500/25 rounded-2xl bg-blue-500/[0.02] dark:bg-blue-950/[0.05] shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Saldo Kas / Uang Kas</span>
                <Wallet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-black ${currentMetrics.cashBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-500"}`}>
                  {formatCurrency(currentMetrics.cashBalance)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.cashBalance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.cashBalance >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.cashBalance >= 0 ? "+" : ""}{trends.cashBalance.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two columns layout: breakdown & cash balance trend graphic */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Category Breakdown */}
            <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/80">
                <CardTitle className="text-base font-bold text-foreground">Rincian Pos Keuangan ({periodBoundaries.label})</CardTitle>
                <CardDescription className="text-xs">Rincian dana masuk dan keluar per kategori transaksi riil.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-grow flex flex-col justify-between">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/80 flex-grow">
                  {/* Pemasukan */}
                  <div className="p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" /> Aliran Masuk
                    </h4>
                    <div className="space-y-3.5">
                      {categoryBreakdown.income.map(item => (
                        <div key={item.name} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">{item.name}</span>
                          <span className="font-bold text-emerald-500">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                      {categoryBreakdown.income.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-4 text-center">Tidak ada pemasukan tercatat.</p>
                      )}
                    </div>
                  </div>

                  {/* Pengeluaran */}
                  <div className="p-5 space-y-4">
                    <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                      <ArrowDownLeft className="h-4 w-4" /> Aliran Keluar
                    </h4>
                    <div className="space-y-3.5">
                      {categoryBreakdown.expense.map(item => (
                        <div key={item.name} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">{item.name}</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                      {categoryBreakdown.expense.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-4 text-center">Tidak ada pengeluaran tercatat.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border-t border-border/80 text-[11px] text-muted-foreground flex justify-between">
                  <span>Total Kategori Masuk: <strong>{categoryBreakdown.income.length}</strong></span>
                  <span>Total Kategori Keluar: <strong>{categoryBreakdown.expense.length}</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Saldo Kas Trend Graphic */}
            <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/80">
                <CardTitle className="text-base font-bold text-foreground">Tren Perkembangan Saldo Kas (Uang Kas)</CardTitle>
                <CardDescription className="text-xs">Akumulasi saldo kas riil berjalan sepanjang periode ini.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex-grow flex items-center">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCashBalancePremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} />
                      <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} />
                      <Tooltip
                        contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "10px" }}
                        labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#a8a29e" }}
                        itemStyle={{ fontSize: "10px", color: "#3b82f6" }}
                        formatter={(value) => [formatCurrency(Number(value)), "Saldo Kas"]}
                      />
                      <Area type="monotone" dataKey="cashBalance" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCashBalancePremium)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      ) : (
        // Daily Dashboard Layout (original dashboard)
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* ----------------- SECTION 1: EXECUTIVE KPI CARDS ----------------- */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Card 1: Revenue */}
            <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pendapatan</span>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{formatCurrency(currentMetrics.revenue)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.revenue >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.revenue >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.revenue >= 0 ? "+" : ""}{trends.revenue.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Estimated Net Profit */}
            <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Laba Bersih Estimasi</span>
                <Scale className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-black ${currentMetrics.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(currentMetrics.netProfit)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.netProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.netProfit >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.netProfit >= 0 ? "+" : ""}{trends.netProfit.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Cash Balance */}
            <Card className="border border-blue-500/25 rounded-2xl bg-blue-500/[0.02] dark:bg-blue-950/[0.05] shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Saldo Kas Riil (Uang Kita)</span>
                <Wallet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-black ${currentMetrics.cashBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-500"}`}>
                  {formatCurrency(currentMetrics.cashBalance)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.cashBalance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.cashBalance >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.cashBalance >= 0 ? "+" : ""}{trends.cashBalance.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs akhir periode lalu</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Total Trips */}
            <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Ritase (Trips)</span>
                <Truck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{currentMetrics.trips.toLocaleString("id-ID")} Rit</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`flex items-center text-xs font-bold py-0.5 px-1.5 rounded-full ${trends.trips >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {trends.trips >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trends.trips >= 0 ? "+" : ""}{trends.trips.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">vs periode lalu</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ----------------- SECTION 2: PROFIT BREAKDOWN (FINANCIAL FLOW) ----------------- */}
          <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-foreground">Alur Alokasi Profitabilitas (Accrual)</CardTitle>
              <CardDescription className="text-xs">Visualisasi dekomposisi dari omset kotor hingga laba bersih berjalan.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <div className="grid gap-6 lg:grid-cols-9 items-center">

                {/* 1. Revenue Card */}
                <div className="lg:col-span-2 border rounded-xl p-4 bg-muted/20 relative group hover:border-orange-500/20 transition-all duration-300">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Pilar 1: Omset</span>
                  <div className="text-xs font-semibold text-foreground">Pendapatan Hauling</div>
                  <div className="text-lg font-black text-orange-500 mt-1">{formatCurrency(currentMetrics.revenue)}</div>
                  <p className="text-[9px] text-muted-foreground mt-1">Tarif ritase dikalikan volumeApproved.</p>
                </div>

                {/* Direct Cost Connection */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-center">
                  <ChevronRight className="h-5 w-5 text-rose-500 hidden lg:block" />
                  <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1">
                    (-) HPP Direct
                  </div>
                  <div className="text-xs font-bold text-rose-500/80 font-mono mt-0.5">
                    {formatCurrency(currentMetrics.directCost)}
                  </div>
                  <div className="text-[8px] text-muted-foreground mt-0.5 leading-tight">
                    Gaji: {formatCurrency(currentMetrics.driverSalaryHpp)} <br />
                    BBM: {formatCurrency(currentMetrics.fuelHpp)}
                  </div>
                </div>

                {/* 2. Gross Profit Card */}
                <div className="lg:col-span-2 border rounded-xl p-4 bg-muted/20 relative group hover:border-orange-500/20 transition-all duration-300">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Pilar 2: Laba Kotor</span>
                  <div className="text-xs font-semibold text-foreground">Gross Profit</div>
                  <div className={`text-lg font-black mt-1 ${currentMetrics.grossProfit >= 0 ? "text-foreground" : "text-rose-500"}`}>
                    {formatCurrency(currentMetrics.grossProfit)}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">Margin operasional sebelum biaya overhead.</p>
                </div>

                {/* Operating Expense Connection */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-center">
                  <ChevronRight className="h-5 w-5 text-rose-500 hidden lg:block" />
                  <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1">
                    (-) OpEx
                  </div>
                  <div className="text-xs font-bold text-rose-500/80 font-mono mt-0.5">
                    {formatCurrency(currentMetrics.operatingExpense)}
                  </div>
                  <div className="text-[8px] text-muted-foreground mt-0.5 leading-tight">
                    Unit: {formatCurrency(currentMetrics.rentCost)} <br />
                    Maint: {formatCurrency(currentMetrics.maintCost)}
                    {selectedContractId === "all" && (
                      <>
                        <br />Kantor: {formatCurrency(currentMetrics.opCost)}
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Estimated Net Profit Card */}
                <div className="lg:col-span-3 border border-emerald-500/20 rounded-xl p-5 bg-emerald-500/[0.02] relative group hover:bg-emerald-500/[0.04] transition-all duration-300">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Pilar 3: Laba Bersih</span>
                  <div className="text-xs font-bold text-foreground">Estimated Net Profit</div>
                  <div className={`text-xl font-black mt-1.5 ${currentMetrics.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatCurrency(currentMetrics.netProfit)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="outline" className={`text-[9px] font-semibold ${currentMetrics.revenue > 0 && currentMetrics.netProfit >= 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                      Margin Bersih: {currentMetrics.revenue > 0 ? ((currentMetrics.netProfit / currentMetrics.revenue) * 100).toFixed(1) : "0"}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ----------------- SECTION 3: CASH FLOW SUMMARY ----------------- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">Rangkuman Arus Kas Masuk & Keluar</h2>
                <p className="text-xs text-muted-foreground">Arus dana aktual berdasarkan realisasi pembayaran Invoice dan pengeluaran operasional.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Cash In Card */}
              <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kas Masuk (Cash In)</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-emerald-500">{formatCurrency(currentMetrics.cashIn)}</div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-[11px]">
                    <span className="text-muted-foreground font-medium">Periode Lalu:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(previousMetrics.cashIn)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    <span className={`font-bold ${trends.cashIn >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {trends.cashIn >= 0 ? "+" : ""}{trends.cashIn.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground font-semibold">vs periode sebelumnya</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Out Card */}
              <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kas Keluar (Cash Out)</span>
                  <ArrowDownLeft className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-rose-500">{formatCurrency(currentMetrics.cashOut)}</div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-[11px]">
                    <span className="text-muted-foreground font-medium">Periode Lalu:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(previousMetrics.cashOut)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    <span className={`font-bold ${trends.cashOut <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {trends.cashOut >= 0 ? "+" : ""}{trends.cashOut.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground font-semibold">vs periode sebelumnya</span>
                  </div>
                </CardContent>
              </Card>

              {/* Net Cash Flow Card */}
              <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Cash Flow</span>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-black ${currentMetrics.netCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatCurrency(currentMetrics.netCashFlow)}
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-4 text-[11px]">
                    <span className="text-muted-foreground font-medium">Periode Lalu:</span>
                    <span className={`font-semibold ${previousMetrics.netCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {formatCurrency(previousMetrics.netCashFlow)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    <span className={`font-bold ${trends.netCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {trends.netCashFlow >= 0 ? "+" : ""}{trends.netCashFlow.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground font-semibold">vs periode sebelumnya</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ----------------- SECTION 4: BUSINESS TRENDS (DYNAMIC CHARTS) ----------------- */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground">Grafik Tren Bisnis</h2>
              <p className="text-xs text-muted-foreground">Analisis tren volumetrik dan finansial berjalan sesuai periode aktif.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Chart 1: Revenue Trend */}
              <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">Tren Pendapatan</CardTitle>
                  <CardDescription className="text-xs">Omset kotor tambang (Approved)</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] pb-4 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} />
                      <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} />
                      <Tooltip
                        contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "10px" }}
                        labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#a8a29e" }}
                        itemStyle={{ fontSize: "10px", color: "#f97316" }}
                        formatter={(value) => [formatCurrency(Number(value)), "Pendapatan"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 2: Profit Trend */}
              <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">Tren Profit Bersih</CardTitle>
                  <CardDescription className="text-xs">Estimasi laba bersih operasional</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] pb-4 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} />
                      <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} />
                      <Tooltip
                        contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "10px" }}
                        labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#a8a29e" }}
                        itemStyle={{ fontSize: "10px", color: "#10b981" }}
                        formatter={(value) => [formatCurrency(Number(value)), "Laba Bersih"]}
                      />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 3: Cash Balance Trend */}
              <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">Tren Perkembangan Saldo Kas (Uang Riil)</CardTitle>
                  <CardDescription className="text-xs">Akumulasi uang riil dari arus kas masuk vs keluar</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] pb-4 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCashBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} />
                      <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} />
                      <Tooltip
                        contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "10px" }}
                        labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#a8a29e" }}
                        itemStyle={{ fontSize: "10px", color: "#3b82f6" }}
                        formatter={(value) => [formatCurrency(Number(value)), "Saldo Kas"]}
                      />
                      <Area type="monotone" dataKey="cashBalance" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCashBalance)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 4: Trip Trend */}
              <Card className="border rounded-2xl bg-card shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-foreground">Tren Ritase (Trips)</CardTitle>
                  <CardDescription className="text-xs">Perkembangan trip dump truck tambang</CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] pb-4 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 5, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="label" fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} />
                      <YAxis fontSize={9} tickLine={false} axisLine={false} stroke="currentColor" opacity={0.6} />
                      <Tooltip
                        contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "10px" }}
                        labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#a8a29e" }}
                        itemStyle={{ fontSize: "10px", color: "#0ea5e9" }}
                        formatter={(value) => [`${Number(value).toLocaleString("id-ID")} Rit`, "Ritase"]}
                      />
                      <Bar dataKey="trips" fill="#0ea5e9" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
