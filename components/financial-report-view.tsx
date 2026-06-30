"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getTransactionsData,
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
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  Briefcase,
  FileText,
  Clock,
  Filter,
  Check,
} from "lucide-react";

// Kategori Standar sesuai permintaan
const EXPENSE_CATEGORIES = [
  "Gaji",
  "Sewa Unit",
  "BBM Operasional",
  "BBM Armada",
  "kantor",
  "maintenance",
  "Overhead",
  "Transportasi",
  "Akomodasi",
  "Pajak",
  "Lainnya",
];

const INCOME_CATEGORIES = [
  "Pembayaran Invoice",
  "DP Kontrak",
  "Pelunasan",
  "Pendapatan Lain",
  "Dana Investor",
  "Lainnya",
];

export function FinancialReportView() {
  const queryClient = useQueryClient();

  // 1. Filter States
  const [filterJenis, setFilterJenis] = useState<"ALL" | "Pemasukan" | "Pengeluaran">("ALL");
  const [filterKategori, setFilterKategori] = useState<string>("ALL");
  const [filterKontrak, setFilterKontrak] = useState<string>("ALL");
  const [filterPeriode, setFilterPeriode] = useState<"TODAY" | "WEEK" | "MONTH" | "CUSTOM">("MONTH");
  const [searchTerm, setSearchTerm] = useState("");

  // Custom Date Bounds (Only displayed when filterPeriode is CUSTOM)
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    const s = new Date(d.getFullYear(), d.getMonth(), 1);
    return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const d = new Date();
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
  });

  // Table pagination
  const [currentIncomePage, setCurrentIncomePage] = useState(1);
  const [currentExpensePage, setCurrentExpensePage] = useState(1);
  const itemsPerPage = 10;

  // Session user profile state
  const [userProfile, setUserProfile] = useState<any>(null);

  // Modal / Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDetailTx, setSelectedDetailTx] = useState<any | null>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [jenis, setJenis] = useState<"Pemasukan" | "Pengeluaran">("Pengeluaran");
  const [kategori, setKategori] = useState("");
  const [nominal, setNominal] = useState<string>("0");
  const [kontrakHaulingId, setKontrakHaulingId] = useState<string>("none");
  const [keterangan, setKeterangan] = useState("");

  // Fetch user session on load
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

  // Fetch database transactions
  const { data, isLoading } = useQuery({
    queryKey: ["transactions-data"],
    queryFn: getTransactionsData,
  });

  const { cashFlows = [], contracts = [], totalRunningBalance = 0 } = data || {};

  // Reset category filter if selected type changes
  useEffect(() => {
    setFilterKategori("ALL");
  }, [filterJenis]);

  // Dynamic Categories list for Filter dropdown
  const filteredCategoriesList = useMemo(() => {
    if (filterJenis === "Pemasukan") return INCOME_CATEGORIES;
    if (filterJenis === "Pengeluaran") return EXPENSE_CATEGORIES;
    return Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]));
  }, [filterJenis]);

  // Dynamic Categories list for Form dialog depending on Form's selected Jenis
  const formCategoriesList = useMemo(() => {
    return jenis === "Pemasukan" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }, [jenis]);

  // Set default category when form transaction type changes
  useEffect(() => {
    if (formCategoriesList.length > 0 && !formCategoriesList.includes(kategori)) {
      setKategori(formCategoriesList[0]);
    }
  }, [jenis, formCategoriesList]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCashFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions-data"] });
      toast({ title: "Sukses", description: "Transaksi manual berhasil dicatat", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal mencatat transaksi", type: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCashFlow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions-data"] });
      toast({ title: "Sukses", description: "Transaksi manual berhasil diubah", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal mengubah transaksi", type: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCashFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions-data"] });
      toast({ title: "Sukses", description: "Transaksi manual berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus transaksi", type: "error" });
    },
  });

  // Modal handlers
  const openAddDialog = () => {
    setEditTx(null);
    setTanggal(new Date().toISOString().substring(0, 10));
    setJenis("Pengeluaran");
    setKategori(EXPENSE_CATEGORIES[0]);
    setNominal("0");
    setKontrakHaulingId("none");
    setKeterangan("");
    setIsOpen(true);
  };

  const openEditDialog = (tx: any) => {
    setEditTx(tx);
    setTanggal(tx.tanggal);
    setJenis(tx.jenis);
    setKategori(tx.kategori);
    setNominal(String(tx.nominal));
    setKontrakHaulingId(tx.kontrak_hauling_id || "none");
    setKeterangan(tx.keterangan || "");
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !kategori || Number(nominal) <= 0) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi dan nominal harus lebih dari 0", type: "warning" });
      return;
    }

    const payload = {
      tanggal,
      jenis,
      kategori,
      nominal: Number(nominal),
      keterangan: keterangan || undefined,
      kontrak_hauling_id: kontrakHaulingId === "none" ? null : kontrakHaulingId,
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

  // Helper currency formatters
  const formatCurrency = (val: number) => {
    return "Rp" + Math.round(val).toLocaleString("id-ID");
  };


  // Helper: format Date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
  const toLocalDateStr = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 2. Client-Side Filtration Logic
  const filteredTransactions = useMemo(() => {
    // A. Period Calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toLocalDateStr(today);

    // Compute week start (Monday) and end (Sunday)
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(today.getTime() + distanceToMonday * 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    const startOfWeekStr = toLocalDateStr(startOfWeek);
    const endOfWeekStr = toLocalDateStr(endOfWeek);

    // Compute month start and end
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfMonthStr = toLocalDateStr(startOfMonth);
    const endOfMonthStr = toLocalDateStr(endOfMonth);

    return cashFlows.filter((tx: any) => {
      // Periode filter
      if (filterPeriode === "TODAY") {
        if (tx.tanggal !== todayStr) return false;
      } else if (filterPeriode === "WEEK") {
        if (tx.tanggal < startOfWeekStr || tx.tanggal > endOfWeekStr) return false;
      } else if (filterPeriode === "MONTH") {
        if (tx.tanggal < startOfMonthStr || tx.tanggal > endOfMonthStr) return false;
      } else if (filterPeriode === "CUSTOM") {
        if (tx.tanggal < customStartDate || tx.tanggal > customEndDate) return false;
      }

      // Jenis filter
      if (filterJenis !== "ALL" && tx.jenis !== filterJenis) return false;

      // Kategori filter
      if (filterKategori !== "ALL" && tx.kategori !== filterKategori) return false;

      // Kontrak filter
      if (filterKontrak !== "ALL") {
        if (tx.kontrak_hauling_id !== filterKontrak) return false;
      }

      // Search term (Cari)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const categoryMatch = tx.kategori.toLowerCase().includes(query);
        const descMatch = (tx.keterangan || "").toLowerCase().includes(query);
        const contractMatch = tx.kontrak_hauling?.kode_kontrak?.toLowerCase().includes(query) ||
                              tx.kontrak_hauling?.perusahaan?.toLowerCase().includes(query);
        if (!categoryMatch && !descMatch && !contractMatch) return false;
      }

      return true;
    });
  }, [cashFlows, filterPeriode, filterJenis, filterKategori, filterKontrak, customStartDate, customEndDate, searchTerm]);

  // Split into Income and Expense Lists
  const incomeTransactions = useMemo(() => {
    return filteredTransactions.filter((tx: any) => tx.jenis === "Pemasukan");
  }, [filteredTransactions]);

  const expenseTransactions = useMemo(() => {
    return filteredTransactions.filter((tx: any) => tx.jenis === "Pengeluaran");
  }, [filteredTransactions]);

  // Paginated lists
  const paginatedIncome = useMemo(() => {
    const start = (currentIncomePage - 1) * itemsPerPage;
    return incomeTransactions.slice(start, start + itemsPerPage);
  }, [incomeTransactions, currentIncomePage]);

  const paginatedExpense = useMemo(() => {
    const start = (currentExpensePage - 1) * itemsPerPage;
    return expenseTransactions.slice(start, start + itemsPerPage);
  }, [expenseTransactions, currentExpensePage]);

  const totalIncomePages = Math.ceil(incomeTransactions.length / itemsPerPage);
  const totalExpensePages = Math.ceil(expenseTransactions.length / itemsPerPage);

  // 3. Compute Metrics based on today's local date
  const todaySummary = useMemo(() => {
    const today = toLocalDateStr(new Date());
    let cashInToday = 0;
    let cashOutToday = 0;

    cashFlows.forEach((tx: any) => {
      if (tx.tanggal === today) {
        if (tx.jenis === "Pemasukan") {
          cashInToday += Number(tx.nominal || 0);
        } else {
          cashOutToday += Number(tx.nominal || 0);
        }
      }
    });

    return {
      cashInToday,
      cashOutToday,
      netCashFlowToday: cashInToday - cashOutToday,
    };
  }, [cashFlows]);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      
      {/* ────────────────────────────────────────────────────────
          AREA 1: FINANCIAL SUMMARY
         ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1: Saldo Kas Total */}
        <Card className="border border-blue-500/25 rounded-2xl bg-blue-500/[0.02] dark:bg-blue-950/[0.05] shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Saldo Kas</span>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 leading-tight truncate">
              {formatCurrency(totalRunningBalance)}
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Cash In Hari Ini */}
        <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cash In Hari Ini</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight truncate">
              {formatCurrency(todaySummary.cashInToday)}
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Cash Out Hari Ini */}
        <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cash Out Hari Ini</span>
            <ArrowDownLeft className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 leading-tight truncate">
              {formatCurrency(todaySummary.cashOutToday)}
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Net Cash Flow Hari Ini */}
        <Card className="border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Net Cash Flow</span>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-lg sm:text-xl font-black leading-tight truncate ${todaySummary.netCashFlowToday >= 0 ? "text-emerald-500" : "text-rose-600"}`}>
              {formatCurrency(todaySummary.netCashFlowToday)}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ────────────────────────────────────────────────────────
          AREA 2: FILTERS
         ──────────────────────────────────────────────────────── */}
      <Card className="border rounded-2xl bg-card shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Filter size={16} className="text-orange-500" /> Filter Ledger Transaksi
            </CardTitle>
            <CardDescription className="text-xs">Saring berdasarkan parameter operasional dan tanggal</CardDescription>
          </div>
          {isWriteAllowed && (
            <Button
              onClick={openAddDialog}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs h-9 px-4 rounded-xl"
            >
              <Plus size={15} /> Catat Transaksi
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            
            {/* Filter Jenis */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Jenis</label>
              <Select value={filterJenis} onValueChange={(val: any) => { setFilterJenis(val); setCurrentIncomePage(1); setCurrentExpensePage(1); }}>
                <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Semua Jenis</SelectItem>
                  <SelectItem value="Pemasukan">Pemasukan (+)</SelectItem>
                  <SelectItem value="Pengeluaran">Pengeluaran (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Kategori */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Kategori</label>
              <Select value={filterKategori} onValueChange={(val) => { setFilterKategori(val); setCurrentIncomePage(1); setCurrentExpensePage(1); }}>
                <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  {filteredCategoriesList.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Kontrak */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Kontrak Kerja</label>
              <Select value={filterKontrak} onValueChange={(val) => { setFilterKontrak(val); setCurrentIncomePage(1); setCurrentExpensePage(1); }}>
                <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                  <SelectValue placeholder="Pilih Kontrak" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Semua Kontrak</SelectItem>
                  {contracts.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.kode_kontrak} - {c.perusahaan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Periode */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Periode</label>
              <Select value={filterPeriode} onValueChange={(val: any) => { setFilterPeriode(val); setCurrentIncomePage(1); setCurrentExpensePage(1); }}>
                <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="TODAY">Hari Ini</SelectItem>
                  <SelectItem value="WEEK">Minggu Ini</SelectItem>
                  <SelectItem value="MONTH">Bulan Ini</SelectItem>
                  <SelectItem value="CUSTOM">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pencarian (Cari) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Cari Deskripsi</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Keterangan, kode..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentIncomePage(1); setCurrentExpensePage(1); }}
                  className="pl-8 text-xs h-9 rounded-xl"
                />
              </div>
            </div>

          </div>

          {/* Conditional Date inputs for CUSTOM range */}
          {filterPeriode === "CUSTOM" && (
            <div className="flex items-center gap-3 p-3 bg-muted/20 border border-dashed rounded-xl max-w-md animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Dari Tanggal</span>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => { setCustomStartDate(e.target.value); setCurrentIncomePage(1); setCurrentExpensePage(1); }}
                  className="text-xs h-8 bg-card"
                />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Hingga Tanggal</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => { setCustomEndDate(e.target.value); setCurrentIncomePage(1); setCurrentExpensePage(1); }}
                  className="text-xs h-8 bg-card"
                />
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* ────────────────────────────────────────────────────────
          AREA 3: LEDGER TABLES (Cash In / Cash Out Side-by-Side)
         ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* LEFT COLUMN: Cash In (Pemasukan) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight size={14} /> Pemasukan Kas (Cash In)
            </h4>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/10 font-bold">
              Total: {formatCurrency(incomeTransactions.reduce((sum, tx) => sum + Number(tx.nominal), 0))}
            </Badge>
          </div>
          <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">Tanggal</TableHead>
                  <TableHead className="text-xs">Kategori</TableHead>
                  <TableHead className="text-xs">Kontrak</TableHead>
                  <TableHead className="text-xs text-right">Nominal</TableHead>
                  {isWriteAllowed && <TableHead className="text-xs text-right w-16">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedIncome.map((tx: any) => {
                  const isManual = tx.source_type === "Manual";
                  return (
                    <TableRow 
                      key={tx.id} 
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedDetailTx(tx)}
                    >
                      <TableCell className="text-xs font-mono">{tx.tanggal}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-foreground">{tx.kategori}</div>
                        <div className="text-[9px] text-muted-foreground max-w-[120px] truncate" title={tx.keterangan}>
                          {tx.keterangan || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {tx.kontrak_hauling?.kode_kontrak || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-emerald-500">
                        +{formatCurrency(tx.nominal)}
                      </TableCell>
                      {isWriteAllowed && (
                        <TableCell className="text-xs text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {isManual ? (
                              <>
                                <Button
                                  onClick={() => openEditDialog(tx)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 size={12} />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(tx.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary" className="text-[8px] font-semibold text-muted-foreground bg-muted tracking-wider select-none px-1 py-0.5 uppercase">
                                Auto ({tx.source_type})
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {incomeTransactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isWriteAllowed ? 5 : 4}
                      className="text-center py-12 text-xs text-muted-foreground italic"
                    >
                      Tidak ada catatan pemasukan kas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Income Pagination */}
            {totalIncomePages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/10">
                <span className="text-[10px] text-muted-foreground">
                  Hal {currentIncomePage} / {totalIncomePages} ({incomeTransactions.length} item)
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

        {/* RIGHT COLUMN: Cash Out (Pengeluaran) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft size={14} /> Pengeluaran Kas (Cash Out)
            </h4>
            <Badge variant="outline" className="text-[10px] bg-rose-500/5 text-rose-500 border-rose-500/10 font-bold">
              Total: {formatCurrency(expenseTransactions.reduce((sum, tx) => sum + Number(tx.nominal), 0))}
            </Badge>
          </div>
          <div className="border rounded-2xl bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">Tanggal</TableHead>
                  <TableHead className="text-xs">Kategori</TableHead>
                  <TableHead className="text-xs">Kontrak</TableHead>
                  <TableHead className="text-xs text-right">Nominal</TableHead>
                  {isWriteAllowed && <TableHead className="text-xs text-right w-16">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpense.map((tx: any) => {
                  const isManual = tx.source_type === "Manual";
                  return (
                    <TableRow 
                      key={tx.id} 
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedDetailTx(tx)}
                    >
                      <TableCell className="text-xs font-mono">{tx.tanggal}</TableCell>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-foreground">{tx.kategori}</div>
                        <div className="text-[9px] text-muted-foreground max-w-[120px] truncate" title={tx.keterangan}>
                          {tx.keterangan || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {tx.kontrak_hauling?.kode_kontrak || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-right font-bold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(tx.nominal)}
                      </TableCell>
                      {isWriteAllowed && (
                        <TableCell className="text-xs text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {isManual ? (
                              <>
                                <Button
                                  onClick={() => openEditDialog(tx)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 size={12} />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(tx.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary" className="text-[8px] font-semibold text-muted-foreground bg-muted tracking-wider select-none px-1 py-0.5 uppercase">
                                Auto ({tx.source_type})
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {expenseTransactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isWriteAllowed ? 5 : 4}
                      className="text-center py-12 text-xs text-muted-foreground italic"
                    >
                      Tidak ada catatan pengeluaran kas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Expense Pagination */}
            {totalExpensePages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/10">
                <span className="text-[10px] text-muted-foreground">
                  Hal {currentExpensePage} / {totalExpensePages} ({expenseTransactions.length} item)
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

      {/* ────────────────────────────────────────────────────────
          DIALOGS & MODALS
         ──────────────────────────────────────────────────────── */}
      
      {/* 1. Transaction Detail Dialog */}
      <Dialog open={!!selectedDetailTx} onOpenChange={() => setSelectedDetailTx(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FileText size={18} className="text-orange-500" /> Detail Transaksi Kas
            </DialogTitle>
            <DialogDescription className="text-xs">
              Informasi lengkap rincian arus kas masuk atau keluar.
            </DialogDescription>
          </DialogHeader>

          {selectedDetailTx && (
            <div className="space-y-4 py-2">
              {/* Type Badge Header Block */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedDetailTx.jenis === "Pemasukan"
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-300"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    selectedDetailTx.jenis === "Pemasukan" ? "bg-emerald-500" : "bg-rose-500"
                  }`} />
                  <span className="text-xs font-bold uppercase">{selectedDetailTx.jenis}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {selectedDetailTx.id.substring(0, 8)}...
                </span>
              </div>

              {/* Data Rows */}
              <div className="space-y-2 text-xs border rounded-xl p-3 bg-muted/10">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground font-medium">Tanggal:</span>
                  <span className="font-bold text-foreground">{selectedDetailTx.tanggal}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground font-medium">Kategori:</span>
                  <span className="font-bold text-foreground">{selectedDetailTx.kategori}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground font-medium">Nominal:</span>
                  <span className={`font-black text-sm ${
                    selectedDetailTx.jenis === "Pemasukan" ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {selectedDetailTx.jenis === "Pemasukan" ? "+" : "-"}{formatCurrency(selectedDetailTx.nominal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground font-medium">Kontrak Kerja:</span>
                  <span className="font-bold text-foreground text-right">
                    {selectedDetailTx.kontrak_hauling
                      ? `${selectedDetailTx.kontrak_hauling.kode_kontrak} (${selectedDetailTx.kontrak_hauling.perusahaan})`
                      : "Semua / Umum"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground font-medium">Sumber Data:</span>
                  <Badge variant="outline" className="text-[9px] font-bold py-0 px-1.5 uppercase">
                    {selectedDetailTx.source_type}
                  </Badge>
                </div>
              </div>

              {/* Description Block */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Keterangan Transaksi</label>
                <div className="bg-muted/40 border p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap text-foreground font-medium">
                  {selectedDetailTx.keterangan || "Tidak ada rincian keterangan tambahan yang dicantumkan."}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t mt-2">
            <Button onClick={() => setSelectedDetailTx(null)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 rounded-xl w-full sm:w-auto">
              Tutup Rincian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Manual Input Dialog (Add / Edit) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editTx ? "Ubah Catatan Transaksi" : "Catat Transaksi Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mencatat transaksi keuangan kas manual yang terintegrasi dengan kontrak hauling.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            
            {/* Tanggal */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Tanggal Transaksi</label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="text-xs h-9 bg-card rounded-xl"
              />
            </div>

            {/* Jenis & Kategori */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Jenis</label>
                <Select
                  value={jenis}
                  onValueChange={(val: "Pemasukan" | "Pengeluaran") => setJenis(val)}
                >
                  <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Pemasukan">Pemasukan (+)</SelectItem>
                    <SelectItem value="Pengeluaran">Pengeluaran (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Kategori</label>
                <Select value={kategori} onValueChange={setKategori}>
                  <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {formCategoriesList.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Nominal */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Nominal Rupiah</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-muted-foreground font-bold">Rp</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="pl-10 text-xs h-9 bg-card rounded-xl"
                />
              </div>
            </div>

            {/* Kontrak Kerja */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Kontrak Kerja Terkait</label>
              <Select value={kontrakHaulingId} onValueChange={setKontrakHaulingId}>
                <SelectTrigger className="text-xs h-9 bg-card rounded-xl">
                  <SelectValue placeholder="Pilih Kontrak" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">Tidak Ada / Umum</SelectItem>
                  {contracts.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.kode_kontrak} - {c.perusahaan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Keterangan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Keterangan / Rincian</label>
              <Input
                placeholder="Deskripsi transaksi secara detail..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="text-xs h-9 bg-card rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9 rounded-xl">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 rounded-xl"
              >
                {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Delete Confirmation Dialog */}
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
