"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getRitase,
  createRitase,
  updateRitase,
  deleteRitase,
  approveRitase,
  rejectRitase
} from "@/app/actions/ritase";
import { getUnits } from "@/app/actions/unit";
import { getDrivers } from "@/app/actions/driver";
import { getLokasiLoading, getLokasiDumping } from "@/app/actions/master";
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
import { Plus, Search, Edit2, Trash2, Loader2, Check, X, AlertCircle } from "lucide-react";

export default function RitasePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role verification state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [linkedDriver, setLinkedDriver] = useState<any>(null);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [editRitase, setEditRitase] = useState<any>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [unitId, setUnitId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [lokasiLoadingId, setLokasiLoadingId] = useState("");
  const [lokasiDumpingId, setLokasiDumpingId] = useState("");
  const [jumlahRitase, setJumlahRitase] = useState(1);
  const [tonase, setTonase] = useState(24);
  const [tarifPerRitase, setTarifPerRitase] = useState(180000);

  // Fetch Session Profile Client-Side
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setUserProfile(data);
            if (data?.role === "Driver") {
              // Find matching driver ID
              supabase
                .from("driver")
                .select("*")
                .eq("profile_id", user.id)
                .single()
                .then(({ data: d }) => {
                  setLinkedDriver(d);
                });
            }
          });
      }
    });
  }, []);

  // Queries
  const { data: ritaseList = [], isLoading } = useQuery({
    queryKey: ["ritase"],
    queryFn: getRitase,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units-active"],
    queryFn: async () => {
      const all = await getUnits();
      return all.filter((u) => u.status === "Aktif");
    }
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers-active"],
    queryFn: async () => {
      const all = await getDrivers();
      return all.filter((d) => d.status === "Aktif");
    }
  });

  const { data: loadingLocs = [] } = useQuery({
    queryKey: ["loading-locations"],
    queryFn: getLokasiLoading,
  });

  const { data: dumpingLocs = [] } = useQuery({
    queryKey: ["dumping-locations"],
    queryFn: getLokasiDumping,
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: createRitase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritase"] });
      toast({ title: "Sukses", description: "Catatan ritase berhasil dimasukkan", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menyimpan ritase", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRitase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritase"] });
      toast({ title: "Sukses", description: "Catatan ritase berhasil diupdate", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal mengupdate ritase", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRitase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritase"] });
      toast({ title: "Sukses", description: "Catatan ritase berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus ritase", type: "error" });
    }
  });

  const approveMutation = useMutation({
    mutationFn: approveRitase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritase"] });
      toast({ title: "Approved", description: "Ritase disetujui untuk operasional dan payroll", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menyetujui ritase", type: "error" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectRitase(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritase"] });
      toast({ title: "Rejected", description: "Ritase ditolak", type: "info" });
      setIsRejectOpen(false);
      setRejectReason("");
      setRejectId(null);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memproses penolakan", type: "error" });
    }
  });

  const isDriver = userProfile?.role === "Driver";
  const isSupervisorOrAbove = userProfile && ["Owner", "Full Access", "Admin", "Supervisor"].includes(userProfile.role);
  const isManager = userProfile && ["Owner", "Full Access", "Admin"].includes(userProfile.role);

  const openAddDialog = () => {
    setEditRitase(null);
    setTanggal(new Date().toISOString().substring(0, 10));
    setUnitId(units[0]?.id || "");
    setDriverId(isDriver ? linkedDriver?.id || "" : drivers[0]?.id || "");
    setLokasiLoadingId(loadingLocs[0]?.id || "");
    setLokasiDumpingId(dumpingLocs[0]?.id || "");
    setJumlahRitase(1);
    setTonase(24);
    setTarifPerRitase(180000);
    setIsOpen(true);
  };

  const openEditDialog = (r: any) => {
    setEditRitase(r);
    setTanggal(r.tanggal);
    setUnitId(r.unit_id);
    setDriverId(r.driver_id);
    setLokasiLoadingId(r.lokasi_loading_id);
    setLokasiDumpingId(r.lokasi_dumping_id);
    setJumlahRitase(r.jumlah_ritase);
    setTonase(Number(r.tonase));
    setTarifPerRitase(Number(r.tarif_per_ritase));
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !unitId || !driverId || !lokasiLoadingId || !lokasiDumpingId) {
      toast({ title: "Peringatan", description: "Kolom bertanda wajib harus dipilih", type: "warning" });
      return;
    }

    const payload = {
      tanggal,
      unit_id: unitId,
      driver_id: driverId,
      lokasi_loading_id: lokasiLoadingId,
      lokasi_dumping_id: lokasiDumpingId,
      jumlah_ritase: Number(jumlahRitase),
      tonase: Number(tonase),
      tarif_per_ritase: Number(tarifPerRitase),
    };

    if (editRitase) {
      updateMutation.mutate({ id: editRitase.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan ritase ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const triggerApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const triggerReject = (id: string) => {
    setRejectId(id);
    setRejectReason("");
    setIsRejectOpen(true);
  };

  const submitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) {
      toast({ title: "Peringatan", description: "Alasan penolakan wajib diisi", type: "warning" });
      return;
    }
    if (rejectId) {
      rejectMutation.mutate({ id: rejectId, reason: rejectReason });
    }
  };

  // Real-time calculated total income in form
  const computedTotal = useMemo(() => {
    return jumlahRitase * tarifPerRitase;
  }, [jumlahRitase, tarifPerRitase]);

  // Search & Filter List
  const filteredList = useMemo(() => {
    return ritaseList.filter((r) => {
      const matchSearch =
        r.unit?.kode_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.driver?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lokasi_loading?.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lokasi_dumping?.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [ritaseList, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Ritase Angkutan Nikel</h1>
          <p className="text-xs text-muted-foreground">Catat dan validasikan hauling dump truck harian</p>
        </div>
        <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
          <Plus size={16} /> Input Ritase
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari unit DT, nama driver, atau lokasi pit..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Filter Status:</span>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] text-xs h-9 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
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
                <TableHead className="text-xs">Tanggal</TableHead>
                <TableHead className="text-xs">Unit DT</TableHead>
                <TableHead className="text-xs">Driver</TableHead>
                <TableHead className="text-xs">Loading/Dumping</TableHead>
                <TableHead className="text-xs text-right">Ritase</TableHead>
                <TableHead className="text-xs text-right">Tonase</TableHead>
                <TableHead className="text-xs text-right">Tarif / Rit</TableHead>
                <TableHead className="text-xs text-right">Total Pendapatan</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.map((r) => {
                const canEdit =
                  isManager ||
                  (isDriver && r.status === "Draft" && linkedDriver?.id === r.driver_id) ||
                  (!isDriver && !isSupervisorOrAbove); // Fallback
                
                const showSupervisorApproval = isSupervisorOrAbove && r.status === "Draft";

                return (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono">{r.tanggal}</TableCell>
                    <TableCell className="text-xs font-bold text-orange-500">{r.unit?.kode_unit}</TableCell>
                    <TableCell className="text-xs">{r.driver?.nama}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{r.lokasi_loading?.nama_lokasi}</div>
                      <div className="text-[10px] text-muted-foreground">Ke {r.lokasi_dumping?.nama_lokasi}</div>
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">{r.jumlah_ritase} Rit</TableCell>
                    <TableCell className="text-xs text-right font-medium">{r.tonase} T</TableCell>
                    <TableCell className="text-xs text-right">Rp{Number(r.tarif_per_ritase).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-emerald-500">
                      Rp{Number(r.total_pendapatan).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            r.status === "Approved"
                              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                              : r.status === "Rejected"
                              ? "bg-rose-950/40 border-rose-800 text-rose-400"
                              : "bg-zinc-900 border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.status === "Rejected" && r.rejected_reason && (
                          <span className="text-[9px] text-rose-400 italic max-w-[100px] truncate" title={r.rejected_reason}>
                            "{r.rejected_reason}"
                          </span>
                        )}
                        {r.status === "Approved" && r.profiles && (
                          <span className="text-[8px] text-muted-foreground uppercase">
                            by {r.profiles.nama}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      <div className="flex items-center justify-end gap-1">
                        {showSupervisorApproval && (
                          <>
                            <Button onClick={() => triggerApprove(r.id)} variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/10" title="Setujui">
                              <Check size={14} />
                            </Button>
                            <Button onClick={() => triggerReject(r.id)} variant="ghost" size="icon" className="h-7 w-7 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10" title="Tolak">
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        {canEdit && (
                          <Button onClick={() => openEditDialog(r)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <Edit2 size={14} />
                          </Button>
                        )}
                        {isManager && (
                          <Button onClick={() => handleDelete(r.id)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada log ritase yang sesuai.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} ritase
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

      {/* Input / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editRitase ? "Ubah Log Ritase Hauling" : "Catat Ritase Hauling Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mencatat data volume ritase dan tonase nikel dari Pit (Loading) ke Jetty/Stockpile (Dumping).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Operasional</label>
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
                        {u.kode_unit} ({u.nomor_polisi})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Driver</label>
                {isDriver ? (
                  <Input
                    value={linkedDriver?.nama || "Sedang memuat..."}
                    disabled
                    className="text-xs h-9 bg-muted"
                  />
                ) : (
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
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Lokasi Loading (Pit)</label>
                <Select value={lokasiLoadingId} onValueChange={setLokasiLoadingId}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Pilih Pit" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingLocs.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.nama_lokasi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Lokasi Dumping (Jetty)</label>
                <Select value={lokasiDumpingId} onValueChange={setLokasiDumpingId}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Pilih Jetty/Stockpile" />
                  </SelectTrigger>
                  <SelectContent>
                    {dumpingLocs.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nama_lokasi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Jumlah Rit</label>
                <Input
                  type="number"
                  min="1"
                  value={jumlahRitase}
                  onChange={(e) => setJumlahRitase(Math.max(1, Number(e.target.value)))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tonase (Ton)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={tonase}
                  onChange={(e) => setTonase(Math.max(0.1, Number(e.target.value)))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tarif / Rit</label>
                <Input
                  type="number"
                  value={tarifPerRitase}
                  onChange={(e) => setTarifPerRitase(Math.max(0, Number(e.target.value)))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Estimasi Total Pendapatan</span>
                <span className="font-extrabold text-sm text-emerald-500">
                  Rp{computedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-rose-500">
              <AlertCircle size={18} /> Tolak Catatan Ritase
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan alasan penolakan ritase ini. Alasan akan ditampilkan kepada driver untuk perbaikan data.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReject} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Alasan Penolakan</label>
              <Input
                placeholder="Contoh: Tonase tidak sesuai dengan slip timbangan jetty."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={rejectMutation.isPending} className="bg-rose-500 hover:bg-rose-600 text-white text-xs h-9">
                {rejectMutation.isPending ? "Memproses..." : "Tolak Ritase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
