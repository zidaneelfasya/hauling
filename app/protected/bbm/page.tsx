"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getBBM, createBBM, updateBBM, deleteBBM } from "@/app/actions/bbm";
import { getUnits } from "@/app/actions/unit";
import { toast } from "@/hooks/use-toast";
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
import { Plus, Search, Edit2, Trash2, Loader2, Fuel } from "lucide-react";

export default function BBMPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [userProfile, setUserProfile] = useState<any>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editLog, setEditLog] = useState<any>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [unitId, setUnitId] = useState("");
  const [liter, setLiter] = useState(100);
  const [hargaPerLiter, setHargaPerLiter] = useState(13500);
  const [lokasiPengisian, setLokasiPengisian] = useState("");

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

  const isWriteAllowed = userProfile && ["Owner", "Full Access", "Admin"].includes(userProfile.role);

  // Queries
  const { data: bbmLogs = [], isLoading } = useQuery({
    queryKey: ["bbm"],
    queryFn: getBBM,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units-active"],
    queryFn: async () => {
      const all = await getUnits();
      return all.filter((u) => u.status === "Aktif");
    }
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: createBBM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bbm"] });
      toast({ title: "Sukses", description: "Log BBM baru berhasil dicatat", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal mencatat solar", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateBBM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bbm"] });
      toast({ title: "Sukses", description: "Log BBM berhasil diperbarui", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui log", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBBM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bbm"] });
      toast({ title: "Sukses", description: "Log BBM berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus log", type: "error" });
    }
  });

  const openAddDialog = () => {
    setEditLog(null);
    setTanggal(new Date().toISOString().substring(0, 10));
    setUnitId(units[0]?.id || "");
    setLiter(100);
    setHargaPerLiter(13500);
    setLokasiPengisian("SPBU Morowali");
    setIsOpen(true);
  };

  const openEditDialog = (log: any) => {
    setEditLog(log);
    setTanggal(log.tanggal);
    setUnitId(log.unit_id);
    setLiter(Number(log.liter));
    setHargaPerLiter(Number(log.harga_per_liter));
    setLokasiPengisian(log.lokasi_pengisian);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !unitId || !lokasiPengisian) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }

    const payload = {
      tanggal,
      unit_id: unitId,
      liter: Number(liter),
      harga_per_liter: Number(hargaPerLiter),
      lokasi_pengisian: lokasiPengisian,
    };

    if (editLog) {
      updateMutation.mutate({ id: editLog.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus log BBM ini?")) {
      deleteMutation.mutate(id);
    }
  };

  // Real-time computed total biaya
  const computedTotal = useMemo(() => {
    return liter * hargaPerLiter;
  }, [liter, hargaPerLiter]);

  const filteredLogs = useMemo(() => {
    return bbmLogs.filter((log) => {
      const matchSearch =
        log.unit?.kode_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.lokasi_pengisian.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [bbmLogs, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Log BBM Solar</h1>
          <p className="text-xs text-muted-foreground">Catat transaksi pengisian solar armada dump truck</p>
        </div>
        {isWriteAllowed && (
          <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
            <Plus size={16} /> Catat BBM
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari kode unit atau lokasi pengisian solar..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 text-xs h-9"
        />
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
                <TableHead className="text-xs">Tanggal</TableHead>
                <TableHead className="text-xs">Unit DT</TableHead>
                <TableHead className="text-xs">Volume (Liter)</TableHead>
                <TableHead className="text-xs text-right">Harga / Liter</TableHead>
                <TableHead className="text-xs text-right">Total Biaya</TableHead>
                <TableHead className="text-xs">Lokasi Pengisian</TableHead>
                {isWriteAllowed && <TableHead className="text-xs text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-mono">{log.tanggal}</TableCell>
                  <TableCell className="text-xs font-bold text-orange-500">{log.unit?.kode_unit}</TableCell>
                  <TableCell className="text-xs font-medium">{log.liter} L</TableCell>
                  <TableCell className="text-xs text-right">Rp{Number(log.harga_per_liter).toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right font-semibold text-rose-400">
                    Rp{Number(log.total_biaya).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{log.lokasi_pengisian}</TableCell>
                  {isWriteAllowed && (
                    <TableCell className="text-xs text-right space-x-1">
                      <Button onClick={() => openEditDialog(log)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Edit2 size={14} />
                      </Button>
                      <Button onClick={() => handleDelete(log.id)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isWriteAllowed ? 7 : 6} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada log BBM solar yang cocok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} transaksi
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
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={`text-xs px-2.5 py-1 h-8 ${currentPage === i + 1 ? "bg-orange-500 text-white hover:bg-orange-600" : ""}`}
                  >
                    {i + 1}
                  </Button>
                ))}
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editLog ? "Ubah Log Pengisian BBM" : "Catat Transaksi BBM Solar"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mencatat pembelian solar industri/subsidi untuk armada tambang.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Pengisian</label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Unit Dump Truck</label>
                <Select value={unitId} onValueChange={setUnitId}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Pilih DT" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.kode_unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Lokasi Pengisian</label>
                <Input
                  placeholder="SPBU Morowali"
                  value={lokasiPengisian}
                  onChange={(e) => setLokasiPengisian(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Volume (Liter)</label>
                <Input
                  type="number"
                  min="1"
                  value={liter}
                  onChange={(e) => setLiter(Math.max(1, Number(e.target.value)))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Harga / Liter (Rp)</label>
                <Input
                  type="number"
                  value={hargaPerLiter}
                  onChange={(e) => setHargaPerLiter(Math.max(0, Number(e.target.value)))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Total Biaya Solar</span>
                <span className="font-extrabold text-sm text-rose-500">
                  Rp{computedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Mencatat..." : "Simpan Catatan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
