"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  calculateDriverIncentive
} from "@/app/actions/payroll";
import { getDrivers } from "@/app/actions/driver";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, Loader2, Sparkles, Filter, Receipt } from "lucide-react";

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("2026");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [userProfile, setUserProfile] = useState<any>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editPay, setEditPay] = useState<any>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [driverId, setDriverId] = useState("");
  const [bulan, setBulan] = useState(6);
  const [tahun, setTahun] = useState(2026);
  const [jumlahRitase, setJumlahRitase] = useState<string>("0");
  const [tarifPerRitase, setTarifPerRitase] = useState<string>("50000");
  const [bonus, setBonus] = useState<string>("0");
  const [potongan, setPotongan] = useState<string>("0");
  const [status, setStatus] = useState<"Draft" | "Paid">("Draft");

  // Fetch session profile
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

  const isManager = userProfile && ["Owner", "Full Access", "Admin"].includes(userProfile.role);
  const isDriver = userProfile?.role === "Driver";

  // Queries
  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ["payroll"],
    queryFn: getPayroll,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers-active"],
    queryFn: async () => {
      const all = await getDrivers();
      return all.filter((d) => d.status === "Aktif");
    }
  });

  // Autofill driver accumulated ritase count
  useEffect(() => {
    if (driverId && !editPay) {
      const selectedDriver = drivers.find((d: any) => d.id === driverId);
      if (selectedDriver) {
        setJumlahRitase(String(selectedDriver.accumulated_ritase || 0));
      }
    }
  }, [driverId, drivers, editPay]);

  // Mutators
  const createMutation = useMutation({
    mutationFn: createPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({ title: "Sukses", description: "Slip gaji berhasil dibuat", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal membuat slip gaji", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePayroll(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({ title: "Sukses", description: "Slip gaji berhasil diperbarui", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui slip gaji", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast({ title: "Sukses", description: "Slip gaji berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus slip gaji", type: "error" });
    }
  });

  const openAddDialog = () => {
    setEditPay(null);
    setDriverId(drivers[0]?.id || "");
    setBulan(6);
    setTahun(2026);
    setJumlahRitase("0");
    setTarifPerRitase("50000");
    setBonus("0");
    setPotongan("0");
    setStatus("Draft");
    setIsOpen(true);
  };

  const openEditDialog = (p: any) => {
    setEditPay(p);
    setDriverId(p.driver_id);
    setBulan(p.bulan);
    setTahun(p.tahun);
    setJumlahRitase(String(p.jumlah_ritase || 0));
    setTarifPerRitase(String(p.tarif_per_ritase || 50000));
    setBonus(String(p.bonus));
    setPotongan(String(p.potongan));
    setStatus(p.status);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  // Pull driver incentives automatically from approved trips
  const pullIncentive = async () => {
    if (!driverId) {
      toast({ title: "Peringatan", description: "Pilih driver terlebih dahulu", type: "warning" });
      return;
    }
    setIsPulling(true);
    try {
      const accumulatedTrips = await calculateDriverIncentive(driverId, bulan, tahun);
      setJumlahRitase(String(accumulatedTrips));
      toast({
        title: "Kalkulasi Berhasil",
        description: `Jumlah Ritase Terhitung: ${accumulatedTrips} Rit`,
        type: "success"
      });
    } catch (err: any) {
      toast({ title: "Kalkulasi Gagal", description: err.message || "Gagal menarik insentif", type: "error" });
    } finally {
      setIsPulling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverId) {
      toast({ title: "Peringatan", description: "Pilih driver terlebih dahulu", type: "warning" });
      return;
    }

    const payload = {
      driver_id: driverId,
      bulan: Number(bulan),
      tahun: Number(tahun),
      jumlah_ritase: Number(jumlahRitase),
      tarif_per_ritase: Number(tarifPerRitase),
      bonus: Number(bonus),
      potongan: Number(potongan),
      status,
    };

    if (editPay) {
      updateMutation.mutate({ id: editPay.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  // Real-time computed total salary in form
  const computedTotal = useMemo(() => {
    return ((Number(jumlahRitase) || 0) * (Number(tarifPerRitase) || 0)) + (Number(bonus) || 0) - (Number(potongan) || 0);
  }, [jumlahRitase, tarifPerRitase, bonus, potongan]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((p) => {
      const matchMonth = monthFilter === "ALL" || p.bulan === Number(monthFilter);
      const matchYear = yearFilter === "ALL" || p.tahun === Number(yearFilter);
      return matchMonth && matchYear;
    });
  }, [payrolls, monthFilter, yearFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const paginatedPayrolls = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayrolls.slice(start, start + itemsPerPage);
  }, [filteredPayrolls, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationGroup = () => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const end = Math.min(totalPages, Math.max(currentPage + 2, 5));
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return {
      pages,
      showLeftEllipsis: start > 1,
      showRightEllipsis: end < totalPages
    };
  };

  const getMonthName = (m: number) => {
    const names = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return names[m - 1] || "";
  };

  const formatCurrency = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payroll Gaji Driver</h1>
          <p className="text-xs text-muted-foreground">Kalkulasi gaji pokok, bonus ritase, dan potongan driver</p>
        </div>
        {isManager && (
          <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
            <Plus size={16} /> Buat Gaji Baru
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground shrink-0" />
          <Select value={monthFilter} onValueChange={(val) => { setMonthFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px] text-xs h-9 bg-card">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Bulan</SelectItem>
              {Array.from({ length: 12 }).map((_, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  {getMonthName(i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={yearFilter} onValueChange={(val) => { setYearFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-[120px] text-xs h-9 bg-card">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Driver</TableHead>
                <TableHead className="text-xs">NIK</TableHead>
                <TableHead className="text-xs">Periode</TableHead>
                <TableHead className="text-xs text-right">Banyaknya Ritase</TableHead>
                <TableHead className="text-xs text-right">Tarif / Ritase</TableHead>
                <TableHead className="text-xs text-right">Bonus / Potongan</TableHead>
                <TableHead className="text-xs text-right">Total Gaji Diterima</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                {isManager && <TableHead className="text-xs text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayrolls.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{p.driver?.nama}</div>
                    {p.driver?.kontrak_hauling && (
                      <div className="text-[9px] text-orange-500 font-semibold tracking-tight leading-none mt-0.5" title={p.driver.kontrak_hauling.perusahaan}>
                        {p.driver.kontrak_hauling.kode_kontrak} - {p.driver.kontrak_hauling.perusahaan}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{p.driver?.nik}</TableCell>
                  <TableCell className="text-xs font-semibold">{getMonthName(p.bulan)} {p.tahun}</TableCell>
                  <TableCell className="text-xs text-right font-medium">{p.jumlah_ritase} Rit</TableCell>
                  <TableCell className="text-xs text-right font-medium">{formatCurrency(Number(p.tarif_per_ritase))}</TableCell>
                  <TableCell className="text-xs text-right">
                    <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">+{formatCurrency(Number(p.bonus))}</div>
                    <div className="text-rose-600 dark:text-rose-400 text-[10px]">-{formatCurrency(Number(p.potongan))}</div>
                  </TableCell>
                  <TableCell className="text-xs text-right font-extrabold text-foreground">{formatCurrency(Number(p.total_gaji))}</TableCell>
                  <TableCell className="text-xs text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        p.status === "Paid"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
                          : "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </TableCell>
                  {isManager && (
                    <TableCell className="text-xs text-right space-x-1">
                      <Button onClick={() => openEditDialog(p)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Edit2 size={14} />
                      </Button>
                      <Button onClick={() => handleDelete(p.id)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredPayrolls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isManager ? 9 : 8} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada slip gaji driver dalam periode terpilih.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPayrolls.length)} dari {filteredPayrolls.length} slip
              </span>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-8"
                >
                  Prev
                </Button>
                {getPaginationGroup().showLeftEllipsis && <span className="text-xs text-muted-foreground px-1">...</span>}
                {getPaginationGroup().pages.map((p) => (
                  <Button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    variant={currentPage === p ? "default" : "outline"}
                    size="sm"
                    className={`text-xs px-2.5 py-1 h-8 ${currentPage === p ? "bg-orange-500 text-white hover:bg-orange-600" : ""}`}
                  >
                    {p}
                  </Button>
                ))}
                {getPaginationGroup().showRightEllipsis && <span className="text-xs text-muted-foreground px-1">...</span>}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editPay ? "Edit Slip Gaji Driver" : "Buat Slip Gaji Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kalkulasi gaji total driver berdasarkan data ritase yang tervalidasi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Driver</label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue placeholder="Pilih Driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Bulan</label>
                <Select value={String(bulan)} onValueChange={(val) => setBulan(Number(val))}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {getMonthName(i + 1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tahun</label>
                <Select value={String(tahun)} onValueChange={(val) => setTahun(Number(val))}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Banyaknya Ritase</label>
                  <button
                    type="button"
                    onClick={pullIncentive}
                    disabled={isPulling}
                    className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50"
                  >
                    <Sparkles size={10} /> Auto-Pull
                  </button>
                </div>
                <Input
                  type="number"
                  value={jumlahRitase}
                  onChange={(e) => setJumlahRitase(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tarif per-Ritase (Rp)</label>
                <Input
                  type="number"
                  value={tarifPerRitase}
                  onChange={(e) => setTarifPerRitase(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Bonus (Rp)</label>
                <Input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Potongan (Rp)</label>
                <Input
                  type="number"
                  value={potongan}
                  onChange={(e) => setPotongan(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Status Pembayaran</label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft (Belum Dibayar)</SelectItem>
                  <SelectItem value="Paid">Paid (Sudah Ditransfer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Total Take Home Pay</span>
                <span className="font-extrabold text-sm text-foreground">
                  {formatCurrency(computedTotal)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan..." : "Simpan Slip"}
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
        title="Hapus Slip Gaji"
        description="Apakah Anda yakin ingin menghapus slip gaji ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
