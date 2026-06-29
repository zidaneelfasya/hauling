"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getFinancialReportData,
  createCashFlow,
  updateCashFlow,
  deleteCashFlow,
} from "@/app/actions/financial-report";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Calendar,
  Fuel,
  Users,
  Wrench,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function FinancialReportView() {
  const queryClient = useQueryClient();

  // Date Filter State (defaults to current month)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().substring(0, 10);
  });

  // Table Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIncomePage, setCurrentIncomePage] = useState(1);
  const [currentExpensePage, setCurrentExpensePage] = useState(1);
  const itemsPerPage = 10;

  // Session user state
  const [userProfile, setUserProfile] = useState<any>(null);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [jenis, setJenis] = useState<"Pemasukan" | "Pengeluaran">("Pengeluaran");
  const [kategori, setKategori] = useState("");
  const [nominal, setNominal] = useState<string>("0");
  const [keterangan, setKeterangan] = useState("");

  // Fetch session profile on load
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setUserProfile(data);
          });
      }
    });
  }, []);

  const isWriteAllowed =
    userProfile && ["Owner", "Full Access", "Admin"].includes(userProfile.role);

  // Query Financial Report Data
  const { data: report, isLoading } = useQuery({
    queryKey: ["financial-report", startDate, endDate],
    queryFn: () => getFinancialReportData(startDate, endDate),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCashFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
      toast({
        title: "Sukses",
        description: "Transaksi manual berhasil dicatat",
        type: "success",
      });
      closeDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Gagal",
        description: err.message || "Gagal mencatat transaksi",
        type: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCashFlow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
      toast({
        title: "Sukses",
        description: "Transaksi manual berhasil diubah",
        type: "success",
      });
      closeDialog();
    },
    onError: (err: any) => {
      toast({
        title: "Gagal",
        description: err.message || "Gagal mengubah transaksi",
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCashFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
      toast({
        title: "Sukses",
        description: "Transaksi manual berhasil dihapus",
        type: "success",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Gagal",
        description: err.message || "Gagal menghapus transaksi",
        type: "error",
      });
    },
  });

  // Modal actions
  const openAddDialog = () => {
    setEditTx(null);
    setTanggal(new Date().toISOString().substring(0, 10));
    setJenis("Pengeluaran");
    setKategori("");
    setNominal("0");
    setKeterangan("");
    setIsOpen(true);
  };

  const openEditDialog = (tx: any) => {
    setEditTx(tx);
    setTanggal(tx.tanggal);
    setJenis(tx.jenis);
    setKategori(tx.kategori);
    setNominal(String(tx.nominal));
    setKeterangan(tx.keterangan || "");
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !kategori || Number(nominal) <= 0) {
      toast({
        title: "Peringatan",
        description: "Semua kolom wajib diisi dan nominal harus lebih dari 0",
        type: "warning",
      });
      return;
    }

    const payload = {
      tanggal,
      jenis,
      kategori,
      nominal: Number(nominal),
      keterangan,
    };

    if (editTx) {
      updateMutation.mutate({ id: editTx.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  // UI calculations & charts preparation
  const formatCurrency = (val: number) => {
    return `Rp${Number(val || 0).toLocaleString("id-ID")}`;
  };

  const filteredTransactions = useMemo(() => {
    const list = report?.cashFlowBlock?.transactions || [];
    const sorted = [...list].sort((a: any, b: any) => {
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
    return sorted.filter((tx: any) => {
      const matchSearch =
        tx.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.keterangan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.source_type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [report, searchTerm]);

  // Separate Income and Expense
  const incomeTransactions = useMemo(() => {
    return filteredTransactions.filter((tx: any) => tx.jenis === "Pemasukan");
  }, [filteredTransactions]);

  const expenseTransactions = useMemo(() => {
    return filteredTransactions.filter((tx: any) => tx.jenis === "Pengeluaran");
  }, [filteredTransactions]);

  // Pagination for Income
  const totalIncomePages = Math.ceil(incomeTransactions.length / itemsPerPage);
  const paginatedIncomeTransactions = useMemo(() => {
    const start = (currentIncomePage - 1) * itemsPerPage;
    return incomeTransactions.slice(start, start + itemsPerPage);
  }, [incomeTransactions, currentIncomePage]);

  // Pagination for Expense
  const totalExpensePages = Math.ceil(expenseTransactions.length / itemsPerPage);
  const paginatedExpenseTransactions = useMemo(() => {
    const start = (currentExpensePage - 1) * itemsPerPage;
    return expenseTransactions.slice(start, start + itemsPerPage);
  }, [expenseTransactions, currentExpensePage]);

  // Recharts Chart Data Preparations
  const barChartData = useMemo(() => {
    if (!report) return [];
    return [
      {
        name: "Accrual (Kinerja)",
        Revenue: report.revenueBlock.revenue,
        HPP: report.hppBlock.totalHpp,
        Profit: report.profitBlock.netProfit,
      },
      {
        name: "Kas Riil (Cash Flow)",
        Revenue: report.cashFlowBlock.cashIn,
        HPP: report.cashFlowBlock.cashOut,
        Profit: report.cashFlowBlock.netCashFlow,
      },
    ];
  }, [report]);

  // Expenses breakdown for Pie Chart
  const expensePieData = useMemo(() => {
    if (!report) return [];
    const breakdown: { [key: string]: number } = {};

    report.cashFlowBlock.transactions.forEach((tx: any) => {
      if (tx.jenis === "Pengeluaran") {
        breakdown[tx.kategori] = (breakdown[tx.kategori] || 0) + Number(tx.nominal);
      }
    });

    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value,
    }));
  }, [report]);

  const COLORS = ["#f57c00", "#d32f2f", "#1976d2", "#388e3c", "#7b1fa2", "#e64a19", "#0097a7"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const { revenueBlock, hppBlock, cashFlowBlock, profitBlock } = report || {
    revenueBlock: { totalRitase: 0, totalTonase: 0, revenue: 0 },
    hppBlock: { fuelHpp: 0, driverSalaryHpp: 0, maintenanceHpp: 0, totalHpp: 0 },
    cashFlowBlock: { cashIn: 0, cashOut: 0, netCashFlow: 0, transactions: [] },
    profitBlock: { grossProfit: 0, netProfit: 0 },
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financial Report</h1>
          <p className="text-xs text-muted-foreground">
            Laporan Kinerja Keuangan: Rekap Omset, HPP, Cash Flow, dan Profitabilitas
          </p>
        </div>

        {/* Date Filter & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border rounded-lg bg-card px-2.5 py-1.5 gap-2 text-xs">
            <Calendar size={14} className="text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentIncomePage(1);
                setCurrentExpensePage(1);
              }}
              className="bg-transparent border-none outline-none text-foreground font-semibold w-28"
            />
            <span className="text-muted-foreground font-medium">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentIncomePage(1);
                setCurrentExpensePage(1);
              }}
              className="bg-transparent border-none outline-none text-foreground font-semibold w-28"
            />
          </div>
          {isWriteAllowed && (
            <Button
              onClick={openAddDialog}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs h-9"
            >
              <Plus size={16} /> Catat Transaksi
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Four Blocks (Revenue, HPP, Cashflow, Profit) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Block 1: Revenue */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Revenue (Ritase)
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-foreground">
              {formatCurrency(revenueBlock.revenue)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
              <p>Total Ritase: <span className="font-semibold text-foreground">{revenueBlock.totalRitase} Rit</span></p>
              <p>Total Tonase: <span className="font-semibold text-foreground">{revenueBlock.totalTonase.toLocaleString("id-ID")} T</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Block 2: HPP */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              HPP (Biaya Langsung)
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(hppBlock.totalHpp)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 space-y-0.5 grid grid-cols-2 gap-x-2">
              <p className="flex items-center gap-1"><Fuel size={10} className="text-orange-500" /> BBM: {formatCurrency(hppBlock.fuelHpp)}</p>
              <p className="flex items-center gap-1"><Users size={10} className="text-blue-500" /> Gaji: {formatCurrency(hppBlock.driverSalaryHpp)}</p>
              <p className="flex items-center gap-1 col-span-2"><Wrench size={10} className="text-rose-500" /> Maintenance: {formatCurrency(hppBlock.maintenanceHpp)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Block 3: Cash Flow */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cash Flow Riil
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-black ${cashFlowBlock.netCashFlow >= 0 ? "text-emerald-500" : "text-rose-600"}`}>
              {formatCurrency(cashFlowBlock.netCashFlow)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
              <p className="flex justify-between"><span>Pemasukan (Kas):</span> <span className="font-semibold text-emerald-500">{formatCurrency(cashFlowBlock.cashIn)}</span></p>
              <p className="flex justify-between"><span>Pengeluaran (Kas):</span> <span className="font-semibold text-rose-500">{formatCurrency(cashFlowBlock.cashOut)}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Block 4: Profit */}
        <Card className="border bg-card shadow-sm hover:border-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Profitabilitas (Accrual)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-black ${profitBlock.netProfit >= 0 ? "text-emerald-500" : "text-rose-600"}`}>
              {formatCurrency(profitBlock.netProfit)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
              <p className="flex justify-between"><span>Gross Profit:</span> <span className="font-semibold text-foreground">{formatCurrency(profitBlock.grossProfit)}</span></p>
              <p className="flex justify-between">
                <span>Net Margin %:</span> 
                <span className={`font-semibold ${revenueBlock.revenue > 0 && profitBlock.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {revenueBlock.revenue > 0 ? `${((profitBlock.netProfit / revenueBlock.revenue) * 100).toFixed(1)}%` : "0%"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left: Accrual vs Cash comparison */}
        <div className="md:col-span-7 border rounded-xl p-5 bg-card shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Accrual (Kinerja) vs Kas Riil (Cash Flow)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbandingan pendapatan ritase vs cash-in invoice, dan HPP ritase vs cash-out BBM/Payroll
            </p>
          </div>
          <div className="h-[280px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    background: "#1c1917",
                    border: "1px solid #2e2a24",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Legend verticalAlign="top" height={36} fontSize={11} />
                <Bar dataKey="Revenue" fill="#10b981" name="Pendapatan / Cash In" radius={[4, 4, 0, 0]} />
                <Bar dataKey="HPP" fill="#f43f5e" name="HPP / Cash Out" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#3b82f6" name="Profit / Bersih" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Cash Expense Breakdown by Category */}
        <div className="md:col-span-5 border rounded-xl p-5 bg-card shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Porsi Pengeluaran Kas (Cash Out)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proporsi penyaluran dana kas pengeluaran berdasarkan kategori
            </p>
          </div>

          {expensePieData.length > 0 ? (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 mt-4 justify-center">
              <div className="w-[150px] h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1c1917",
                        border: "1px solid #2e2a24",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 text-xs space-y-1.5 w-full max-w-[200px]">
                {expensePieData.map((d, i) => {
                  const pct = (d.value / cashFlowBlock.cashOut) * 100;
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="font-semibold text-muted-foreground truncate w-24">
                        {d.name}
                      </span>
                      <span className="font-bold text-foreground ml-auto">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-10 italic">
              Tidak ada data pengeluaran kas dalam periode ini.
            </div>
          )}

          <div className="pt-3 border-t flex justify-between items-center text-xs font-bold text-foreground">
            <span>TOTAL PENGELUARAN KAS:</span>
            <span className="text-rose-500 font-extrabold text-sm">
              {formatCurrency(cashFlowBlock.cashOut)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Buku Kas & Transaksi (Ledger)
            </h3>
            <p className="text-xs text-muted-foreground">
              Daftar pemasukan dan pengeluaran kas yang disinkronisasi maupun dicatat manual.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kategori, keterangan, sumber..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentIncomePage(1);
                setCurrentExpensePage(1);
              }}
              className="pl-9 text-xs h-9 bg-card"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Left Panel: Pemasukan Kas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight size={14} /> Pemasukan Kas (Cash In)
              </h4>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/10 font-bold">
                Total: {formatCurrency(cashFlowBlock.cashIn)}
              </Badge>
            </div>
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-24">Tanggal</TableHead>
                    <TableHead className="text-xs">Kategori</TableHead>
                    <TableHead className="text-xs">Keterangan / Rincian</TableHead>
                    <TableHead className="text-xs text-right">Nominal</TableHead>
                    <TableHead className="text-xs">Sumber</TableHead>
                    {isWriteAllowed && <TableHead className="text-xs text-right w-20">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncomeTransactions.map((tx: any) => {
                    const isManual = tx.source_type === "Manual";
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-mono">{tx.tanggal}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {tx.kategori}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium max-w-[150px] truncate" title={tx.keterangan}>
                          {tx.keterangan || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold text-emerald-500">
                          +{formatCurrency(tx.nominal)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {isManual ? (
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              Manual
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] font-semibold uppercase tracking-wider"
                            >
                              Auto ({tx.source_type})
                            </Badge>
                          )}
                        </TableCell>
                        {isWriteAllowed && (
                          <TableCell className="text-xs text-right space-x-1">
                            {isManual ? (
                              <>
                                <Button
                                  onClick={() => openEditDialog(tx)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(tx.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </>
                            ) : (
                              <div className="inline-block text-[10px] text-muted-foreground italic pr-2 select-none">
                                Locked
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {incomeTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isWriteAllowed ? 6 : 5}
                        className="text-center py-12 text-xs text-muted-foreground"
                      >
                        Tidak ada catatan pemasukan kas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Income Pagination */}
              {totalIncomePages > 1 && (
                <div className="flex items-center justify-between p-3.5 border-t bg-muted/10">
                  <span className="text-[10px] text-muted-foreground">
                    Hal {currentIncomePage} / {totalIncomePages} ({incomeTransactions.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => setCurrentIncomePage((p) => Math.max(p - 1, 1))}
                      disabled={currentIncomePage === 1}
                      variant="outline"
                      size="sm"
                      className="text-[10px] px-2 h-7"
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={() => setCurrentIncomePage((p) => Math.min(p + 1, totalIncomePages))}
                      disabled={currentIncomePage === totalIncomePages}
                      variant="outline"
                      size="sm"
                      className="text-[10px] px-2 h-7"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Pengeluaran Kas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownLeft size={14} /> Pengeluaran Kas (Cash Out)
              </h4>
              <Badge variant="outline" className="text-[10px] bg-rose-500/5 text-rose-500 border-rose-500/10 font-bold">
                Total: {formatCurrency(cashFlowBlock.cashOut)}
              </Badge>
            </div>
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-24">Tanggal</TableHead>
                    <TableHead className="text-xs">Kategori</TableHead>
                    <TableHead className="text-xs">Keterangan / Rincian</TableHead>
                    <TableHead className="text-xs text-right">Nominal</TableHead>
                    <TableHead className="text-xs">Sumber</TableHead>
                    {isWriteAllowed && <TableHead className="text-xs text-right w-20">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenseTransactions.map((tx: any) => {
                    const isManual = tx.source_type === "Manual";
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-mono">{tx.tanggal}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {tx.kategori}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium max-w-[150px] truncate" title={tx.keterangan}>
                          {tx.keterangan || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold text-rose-600 dark:text-rose-400">
                          -{formatCurrency(tx.nominal)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {isManual ? (
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              Manual
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] font-semibold uppercase tracking-wider"
                            >
                              Auto ({tx.source_type})
                            </Badge>
                          )}
                        </TableCell>
                        {isWriteAllowed && (
                          <TableCell className="text-xs text-right space-x-1">
                            {isManual ? (
                              <>
                                <Button
                                  onClick={() => openEditDialog(tx)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(tx.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </>
                            ) : (
                              <div className="inline-block text-[10px] text-muted-foreground italic pr-2 select-none">
                                Locked
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {expenseTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isWriteAllowed ? 6 : 5}
                        className="text-center py-12 text-xs text-muted-foreground"
                      >
                        Tidak ada catatan pengeluaran kas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Expense Pagination */}
              {totalExpensePages > 1 && (
                <div className="flex items-center justify-between p-3.5 border-t bg-muted/10">
                  <span className="text-[10px] text-muted-foreground">
                    Hal {currentExpensePage} / {totalExpensePages} ({expenseTransactions.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => setCurrentExpensePage((p) => Math.max(p - 1, 1))}
                      disabled={currentExpensePage === 1}
                      variant="outline"
                      size="sm"
                      className="text-[10px] px-2 h-7"
                    >
                      Prev
                    </Button>
                    <Button
                      onClick={() => setCurrentExpensePage((p) => Math.min(p + 1, totalExpensePages))}
                      disabled={currentExpensePage === totalExpensePages}
                      variant="outline"
                      size="sm"
                      className="text-[10px] px-2 h-7"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editTx ? "Ubah Catatan Transaksi Kas" : "Catat Transaksi Kas Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mencatat pemasukan atau pengeluaran kas manual di luar transaksi otomatis system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Tanggal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">
                Tanggal Transaksi
              </label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="text-xs h-9 bg-card"
              />
            </div>

            {/* Jenis & Kategori */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Jenis Transaksi
                </label>
                <Select
                  value={jenis}
                  onValueChange={(val: "Pemasukan" | "Pengeluaran") => setJenis(val)}
                >
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pemasukan">Pemasukan (+)</SelectItem>
                    <SelectItem value="Pengeluaran">Pengeluaran (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Kategori
                </label>
                <Input
                  placeholder="Sewa Unit, Wi-Fi, Toll, dll."
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="text-xs h-9 bg-card"
                />
              </div>
            </div>

            {/* Nominal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">
                Nominal Transaksi (Rupiah)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="pl-9 text-xs h-9 bg-card"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">
                Keterangan / Deskripsi
              </label>
              <Input
                placeholder="Rincian informasi transaksi..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="text-xs h-9 bg-card"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Menyimpan..."
                  : "Simpan Transaksi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
        title="Hapus Transaksi Kas"
        description="Apakah Anda yakin ingin menghapus catatan transaksi manual ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
