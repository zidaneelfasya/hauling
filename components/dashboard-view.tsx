"use client";

import React, { useMemo } from "react";
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Truck,
  Users,
  TrendingUp,
  Fuel,
  Wrench,
  DollarSign,
  Receipt,
  FileText
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
}

export function DashboardView({
  activeUnits,
  maintenanceUnits,
  activeDrivers,
  ritase,
  bbm,
  maintenance,
  invoices,
  isDriver
}: DashboardViewProps) {
  // Current time anchor for calculations (June 25, 2026)
  const anchorDateStr = "2026-06-25";
  const anchorYear = 2026;
  const anchorMonthStr = "06"; // June
  const anchorMonthInt = 6;

  // 1. Calculate KPI Metrics
  const metrics = useMemo(() => {
    // Total Ritase Hari Ini
    const ritaseHariIni = ritase.filter((r) => r.tanggal === anchorDateStr);
    const totalRitaseHariIni = ritaseHariIni.reduce((sum, r) => sum + r.jumlah_ritase, 0);

    // Total Ritase Bulan Ini
    const ritaseBulanIni = ritase.filter((r) => {
      const parts = r.tanggal.split("-");
      return parts[0] === String(anchorYear) && parts[1] === anchorMonthStr;
    });
    const totalRitaseBulanIni = ritaseBulanIni.reduce((sum, r) => sum + r.jumlah_ritase, 0);

    // Pendapatan Bulan Ini (Approved Ritase)
    const approvedRitaseBulanIni = ritaseBulanIni.filter((r) => r.status === "Approved");
    const pendapatanBulanIni = approvedRitaseBulanIni.reduce(
      (sum, r) => sum + Number(r.total_pendapatan),
      0
    );

    // BBM Bulan Ini
    const bbmBulanIni = bbm.filter((b) => {
      const parts = b.tanggal.split("-");
      return parts[0] === String(anchorYear) && parts[1] === anchorMonthStr;
    });
    const pengeluaranBbmBulanIni = bbmBulanIni.reduce(
      (sum, b) => sum + Number(b.total_biaya),
      0
    );

    // Maintenance Bulan Ini
    const maintBulanIni = maintenance.filter((m) => {
      const parts = m.tanggal.split("-");
      return parts[0] === String(anchorYear) && parts[1] === anchorMonthStr;
    });
    const pengeluaranMaintBulanIni = maintBulanIni.reduce(
      (sum, m) => sum + Number(m.biaya),
      0
    );

    const totalPengeluaranBulanIni = pengeluaranBbmBulanIni + pengeluaranMaintBulanIni;
    const labaBersihBulanIni = pendapatanBulanIni - totalPengeluaranBulanIni;

    return {
      totalRitaseHariIni,
      totalRitaseBulanIni,
      pendapatanBulanIni,
      totalPengeluaranBulanIni,
      labaBersihBulanIni,
      pengeluaranBbmBulanIni,
      pengeluaranMaintBulanIni
    };
  }, [ritase, bbm, maintenance]);

  // 2. Chart 1: Ritase Harian (Last 15 days of June 2026)
  const dailyRitaseChartData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    
    // Initialize last 15 days of June
    for (let day = 11; day <= 25; day++) {
      const dateStr = `2026-06-${String(day).padStart(2, "0")}`;
      dailyMap[dateStr] = 0;
    }

    ritase.forEach((r) => {
      if (dailyMap[r.tanggal] !== undefined) {
        dailyMap[r.tanggal] += r.jumlah_ritase;
      }
    });

    return Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date: date.substring(8, 10) + " Jun",
        ritase: dailyMap[date]
      }));
  }, [ritase]);

  // 3. Chart 2: Pendapatan vs Pengeluaran Bulanan (May vs June 2026)
  const monthlyBarChartData = useMemo(() => {
    const months = [
      { name: "Mei", year: "2026", monthStr: "05" },
      { name: "Juni", year: "2026", monthStr: "06" }
    ];

    return months.map((m) => {
      // Income
      const rMonth = ritase.filter((r) => {
        const parts = r.tanggal.split("-");
        return parts[0] === m.year && parts[1] === m.monthStr && r.status === "Approved";
      });
      const income = rMonth.reduce((sum, r) => sum + Number(r.total_pendapatan), 0);

      // Expenses (BBM + Maintenance)
      const bMonth = bbm.filter((b) => {
        const parts = b.tanggal.split("-");
        return parts[0] === m.year && parts[1] === m.monthStr;
      });
      const bbmCost = bMonth.reduce((sum, b) => sum + Number(b.total_biaya), 0);

      const mMonth = maintenance.filter((main) => {
        const parts = main.tanggal.split("-");
        return parts[0] === m.year && parts[1] === m.monthStr;
      });
      const maintCost = mMonth.reduce((sum, main) => sum + Number(main.biaya), 0);

      return {
        name: m.name,
        Pendapatan: income,
        Pengeluaran: bbmCost + maintCost
      };
    });
  }, [ritase, bbm, maintenance]);

  // 4. Chart 3: Pengeluaran BBM per Hari (June 15 - 25)
  const dailyBbmChartData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    for (let day = 15; day <= 25; day++) {
      const dateStr = `2026-06-${String(day).padStart(2, "0")}`;
      dailyMap[dateStr] = 0;
    }

    bbm.forEach((b) => {
      if (dailyMap[b.tanggal] !== undefined) {
        dailyMap[b.tanggal] += Number(b.total_biaya);
      }
    });

    return Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date: date.substring(8, 10) + " Jun",
        BBM: dailyMap[date]
      }));
  }, [bbm]);

  // 5. Chart 4: Biaya Maintenance Pie Chart (by Status)
  const maintenancePieData = useMemo(() => {
    const statusMap = {
      Completed: 0,
      "In Progress": 0,
      Scheduled: 0
    };

    maintenance.forEach((m) => {
      if (statusMap[m.status as keyof typeof statusMap] !== undefined) {
        statusMap[m.status as keyof typeof statusMap] += Number(m.biaya);
      }
    });

    return Object.keys(statusMap).map((status) => ({
      name: status,
      value: statusMap[status as keyof typeof statusMap]
    }));
  }, [maintenance]);

  const COLORS = ["#10b981", "#f97316", "#ef4444"];

  // 6. Recent activity lists
  const recentRitase = useMemo(() => ritase.slice(0, 5), [ritase]);
  const recentMaintenance = useMemo(() => maintenance.slice(0, 5), [maintenance]);
  const recentInvoices = useMemo(() => invoices.slice(0, 5), [invoices]);

  const formatCurrency = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Dashboard HMS
        </h1>
        <p className="text-muted-foreground text-sm">
          Pantau performa armada, ritase, dan keuangan hauling nikel per 25 Juni 2026.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Unit Status */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Armada DT Aktif
            </CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {activeUnits} <span className="text-xs font-normal text-muted-foreground">/ {activeUnits + maintenanceUnits} DT</span>
            </div>
            <p className="text-xs text-orange-500 mt-1">
              {maintenanceUnits} Unit di Maintenance
            </p>
          </CardContent>
        </Card>

        {/* Active Drivers */}
        {!isDriver && (
          <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Driver Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-foreground">
                {activeDrivers} Driver
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Seluruh driver operasional terdaftar
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ritase Today & Month */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ritase Hari Ini / Bulan Ini
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {metrics.totalRitaseHariIni} <span className="text-xs font-normal text-muted-foreground">Ritase</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan ini: <span className="text-orange-500 font-semibold">{metrics.totalRitaseBulanIni}</span> ritase
            </p>
          </CardContent>
        </Card>

        {/* Pendapatan Bulan Ini */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pendapatan Bulan Ini
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-foreground truncate">
              {formatCurrency(metrics.pendapatanBulanIni)}
            </div>
            <p className="text-xs text-emerald-500 mt-1">
              Hanya ritase yang disetujui (Approved)
            </p>
          </CardContent>
        </Card>

        {/* Pengeluaran Bulan Ini */}
        {!isDriver && (
          <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pengeluaran Bulan Ini
              </CardTitle>
              <Fuel className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-foreground truncate">
                {formatCurrency(metrics.totalPengeluaranBulanIni)}
              </div>
              <p className="text-xs text-rose-500 mt-1">
                BBM: {formatCurrency(metrics.pengeluaranBbmBulanIni)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Laba Bersih Bulan Ini */}
        {!isDriver && (
          <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Estimasi Laba Bersih
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-emerald-400 truncate">
                {formatCurrency(metrics.labaBersihBulanIni)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pendapatan dikurangi BBM & Maint.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Daily Ritase Area Chart */}
        <Card className="border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Trafik Ritase Harian (Juni 2026)</CardTitle>
            <CardDescription className="text-xs">Jumlah ritase dump truck per hari</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRitaseChartData}>
                <defs>
                  <linearGradient id="colorRitase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "8px" }} labelStyle={{ fontSize: "11px", fontWeight: "bold" }} itemStyle={{ fontSize: "11px", color: "#f97316" }} />
                <Area type="monotone" dataKey="ritase" stroke="#f97316" fillOpacity={1} fill="url(#colorRitase)" name="Ritase" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Pendapatan vs Pengeluaran (Managers only) */}
        {!isDriver ? (
          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Pendapatan vs Pengeluaran (Rupiah)</CardTitle>
              <CardDescription className="text-xs">BBM & Perawatan vs Pendapatan Approved</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} stroke="currentColor" opacity={0.5} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "8px" }} labelStyle={{ fontSize: "11px", fontWeight: "bold" }} itemStyle={{ fontSize: "11px" }} />
                  <Legend verticalAlign="top" height={36} fontSize={11} />
                  <Bar dataKey="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          /* Placeholder / simplified graph for drivers (BBM costs of their logs if we want, or fuel refill trends) */
          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Statistik BBM Harian</CardTitle>
              <CardDescription className="text-xs">Volume pengisian bahan bakar armada</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyBbmChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" fontSize={11} stroke="currentColor" opacity={0.5} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "8px" }} labelStyle={{ fontSize: "11px", fontWeight: "bold" }} itemStyle={{ fontSize: "11px", color: "#f97316" }} />
                  <Line type="monotone" dataKey="BBM" stroke="#f97316" name="Biaya BBM" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 3: Pengeluaran BBM (Managers only) */}
        {!isDriver && (
          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Trafik Pembelian BBM Harian</CardTitle>
              <CardDescription className="text-xs">Fluktuasi pengeluaran solar armada</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyBbmChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" fontSize={11} stroke="currentColor" opacity={0.5} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "8px" }} labelStyle={{ fontSize: "11px", fontWeight: "bold" }} itemStyle={{ fontSize: "11px", color: "#f97316" }} />
                  <Line type="monotone" dataKey="BBM" stroke="#f97316" name="Biaya BBM" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Chart 4: Maintenance pie chart */}
        {!isDriver && (
          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Pengeluaran Perawatan (Berdasarkan Status)</CardTitle>
              <CardDescription className="text-xs">Proporsi alokasi biaya perbaikan</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
              <div className="w-[60%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maintenancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {maintenancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #2e2a24", borderRadius: "8px" }} itemStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[40%] text-xs space-y-2">
                {maintenancePieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="font-medium text-muted-foreground truncate">{d.name}</span>
                    <span className="font-bold text-foreground ml-auto">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activities Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Ritase */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Ritase Terkini</CardTitle>
              <CardDescription className="text-xs">Aktivitas hauling unit DT di lapangan</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Tgl</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs">Driver</TableHead>
                  <TableHead className="text-xs text-right">Rit/Ton</TableHead>
                  <TableHead className="text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRitase.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="text-xs py-2">{r.tanggal}</TableCell>
                    <TableCell className="text-xs py-2 font-semibold text-orange-500">
                      {r.unit?.kode_unit}
                    </TableCell>
                    <TableCell className="text-xs py-2 truncate max-w-[100px]">{r.driver?.nama}</TableCell>
                    <TableCell className="text-xs py-2 text-right">
                      {r.jumlah_ritase} / {r.tonase}T
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          r.status === "Approved"
                            ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                            : r.status === "Rejected"
                            ? "bg-rose-950/40 border-rose-800 text-rose-400"
                            : "bg-zinc-900 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {recentRitase.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs py-4 text-muted-foreground">
                      Tidak ada data ritase baru
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Maintenance & Invoices */}
        {!isDriver ? (
          <Card className="border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Perbaikan Terkini</CardTitle>
                <CardDescription className="text-xs">Log maintenance armada DT</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Tgl</TableHead>
                    <TableHead className="text-xs">Unit</TableHead>
                    <TableHead className="text-xs">Jenis</TableHead>
                    <TableHead className="text-xs text-right">Biaya</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMaintenance.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/40">
                      <TableCell className="text-xs py-2">{m.tanggal}</TableCell>
                      <TableCell className="text-xs py-2 font-semibold text-orange-500">
                        {m.unit?.kode_unit}
                      </TableCell>
                      <TableCell className="text-xs py-2 truncate max-w-[120px]">{m.jenis_maintenance}</TableCell>
                      <TableCell className="text-xs py-2 text-right font-medium">
                        {formatCurrency(Number(m.biaya))}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            m.status === "Completed"
                              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                              : m.status === "In Progress"
                              ? "bg-amber-950/40 border-amber-800 text-amber-400"
                              : "bg-zinc-900 border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {m.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentMaintenance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs py-4 text-muted-foreground">
                        Tidak ada data maintenance baru
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          /* Custom card showing private message for driver role */
          <Card className="border bg-card shadow-sm flex flex-col justify-center items-center p-6 text-center">
            <Users className="h-12 w-12 text-orange-500 opacity-60 mb-3" />
            <h3 className="font-semibold text-sm mb-1 text-foreground">Data Pribadi Driver</h3>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              Menu sidebar ritase dan log BBM berisi seluruh catatan pribadi perjalanan tambang yang anda ajukan. Hubungi pengawas supervisor untuk menyetujui ritase draft anda.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
