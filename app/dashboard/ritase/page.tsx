"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getRitase,
  createRitase,
  updateRitase,
  deleteRitase,
  deleteMultipleRitase,
  approveRitase,
  rejectRitase
} from "@/app/actions/ritase";
import { getDrivers } from "@/app/actions/driver";
import { getUnits } from "@/app/actions/unit";
import { getLokasiLoading, getLokasiDumping, getKontrakHauling } from "@/app/actions/master";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Search, Edit2, Trash2, Loader2, Check, X, AlertCircle, Clock, Truck, User, Fuel, FileText } from "lucide-react";

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
  const [selectedRitaseDetail, setSelectedRitaseDetail] = useState<any | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [kontrakHaulingId, setKontrakHaulingId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [lokasiLoadingId, setLokasiLoadingId] = useState("");
  const [lokasiDumpingId, setLokasiDumpingId] = useState("");
  const [jumlahRitase, setJumlahRitase] = useState<string>("1");
  const [tonase, setTonase] = useState<string>("24");
  const [tarifPerRitase, setTarifPerRitase] = useState<string>("180000");
  const [keteranganTarif, setKeteranganTarif] = useState("");
  const [jenisPengiriman, setJenisPengiriman] = useState("Pit ke tongkang");
  const [volumeBbm, setVolumeBbm] = useState<string>("0");
  const [hargaPerLiterBbm, setHargaPerLiterBbm] = useState<string>("13500");

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

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ["units-active"],
    queryFn: async () => {
      const all = await getUnits();
      return all.filter((u) => u.status === "Aktif");
    }
  });

  const { data: drivers = [], isLoading: loadingDrivers } = useQuery({
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

  const { data: kontrakList = [], isLoading: loadingKontrak } = useQuery({
    queryKey: ["kontrak_hauling"],
    queryFn: getKontrakHauling,
  });

  // Filtered unit & driver lists based on selected contract
  const filteredUnits = useMemo(() => {
    if (!kontrakHaulingId) return [];
    return units.filter((u: any) => u.kontrak_hauling_id === kontrakHaulingId);
  }, [units, kontrakHaulingId]);

  const filteredDrivers = useMemo(() => {
    if (!kontrakHaulingId) return [];
    return drivers.filter((d: any) => d.kontrak_hauling_id === kontrakHaulingId);
  }, [drivers, kontrakHaulingId]);

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
      // If we deleted the item, remove it from selection if present
      setSelectedIds((prev) => prev.filter((id) => !deleteIds?.includes(id)));
      toast({ title: "Sukses", description: "Catatan ritase berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus ritase", type: "error" });
    }
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteMultipleRitase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritase"] });
      setSelectedIds([]); // Clear all selections
      toast({ title: "Sukses", description: "Beberapa catatan ritase berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus beberapa ritase", type: "error" });
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
    setKontrakHaulingId("");
    setUnitId("");
    setDriverId(isDriver ? linkedDriver?.id || "" : "");
    setLokasiLoadingId(loadingLocs[0]?.id || "");
    setLokasiDumpingId(dumpingLocs[0]?.id || "");
    setJumlahRitase("1");
    setTonase("24");
    setTarifPerRitase("180000");
    setKeteranganTarif("");
    setJenisPengiriman("Pit ke tongkang");
    setVolumeBbm("0");
    setHargaPerLiterBbm("13500");
    setIsOpen(true);
  };

  const openEditDialog = (r: any) => {
    setEditRitase(r);
    setTanggal(r.tanggal);
    setKontrakHaulingId(r.kontrak_hauling_id);
    setUnitId(r.unit_id);
    setDriverId(r.driver_id);
    setLokasiLoadingId(r.lokasi_loading_id);
    setLokasiDumpingId(r.lokasi_dumping_id);
    setJumlahRitase(String(r.jumlah_ritase));
    setTonase(String(r.tonase));
    setTarifPerRitase(String(r.tarif_per_ritase));
    setKeteranganTarif(r.keterangan_tarif || "");
    setJenisPengiriman(r.jenis_pengiriman || "Pit ke tongkang");
    
    const bbmRecord = r.bbm?.[0] || null;
    setVolumeBbm(bbmRecord ? String(bbmRecord.liter) : "0");
    setHargaPerLiterBbm(bbmRecord ? String(bbmRecord.harga_per_liter) : "13500");
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !kontrakHaulingId || !unitId || !driverId || !lokasiLoadingId || !lokasiDumpingId) {
      toast({ title: "Peringatan", description: "Kolom bertanda wajib harus dipilih", type: "warning" });
      return;
    }

    const payload = {
      tanggal,
      kontrak_hauling_id: kontrakHaulingId,
      unit_id: unitId,
      driver_id: driverId,
      lokasi_loading_id: lokasiLoadingId,
      lokasi_dumping_id: lokasiDumpingId,
      jumlah_ritase: Number(jumlahRitase),
      tonase: Number(tonase),
      tarif_per_ritase: Number(tarifPerRitase),
      jenis_pengiriman: jenisPengiriman,
      volume_bbm: Number(volumeBbm),
      harga_per_liter_bbm: Number(hargaPerLiterBbm),
      keterangan_tarif: keteranganTarif,
    };

    if (editRitase) {
      updateMutation.mutate({ id: editRitase.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteIds([id]);
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



  // Search & Filter List
  const filteredList = useMemo(() => {
    return ritaseList.filter((r) => {
      const matchSearch =
        r.unit?.kode_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.driver?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lokasi_loading?.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lokasi_dumping?.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kontrak_hauling?.kode_kontrak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kontrak_hauling?.perusahaan.toLowerCase().includes(searchTerm.toLowerCase());

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

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Ritase </h1>
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
                {isManager && (
                  <TableHead className="w-[40px] text-xs">
                    <Checkbox
                      checked={
                        paginatedList.length > 0 &&
                        paginatedList.every((r) => selectedIds.includes(r.id))
                          ? true
                          : paginatedList.some((r) => selectedIds.includes(r.id))
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const pageIds = paginatedList.map((r) => r.id);
                          setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
                        } else {
                          const pageIds = paginatedList.map((r) => r.id);
                          setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead className="text-xs">Tanggal</TableHead>
                <TableHead className="text-xs">Kontrak</TableHead>
                <TableHead className="text-xs">Unit DT</TableHead>
                <TableHead className="text-xs">Driver</TableHead>
                <TableHead className="text-xs">Loading/Dumping</TableHead>
                <TableHead className="text-xs text-right">Ritase</TableHead>
                <TableHead className="text-xs text-right">Tonase</TableHead>
                <TableHead className="text-xs text-right">Tarif / Rit</TableHead>
                <TableHead className="text-xs text-right">HPP (BBM + Gaji)</TableHead>
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
                  <TableRow
                    key={r.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedRitaseDetail(r)}
                  >
                    {isManager && (
                      <TableCell className="text-xs w-[40px]" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIds((prev) => [...prev, r.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== r.id));
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-xs font-mono">{r.tanggal}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-bold text-foreground">{r.kontrak_hauling?.kode_kontrak}</div>
                      <div className="text-[10px] text-muted-foreground">{r.kontrak_hauling?.perusahaan}</div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-orange-500">{r.unit?.kode_unit}</TableCell>
                    <TableCell className="text-xs">{r.driver?.nama}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{r.lokasi_loading?.nama_lokasi}</div>
                      <div className="text-[10px] text-muted-foreground">Ke {r.lokasi_dumping?.nama_lokasi}</div>
                      <div className="mt-1">
                        <span className="inline-block px-1.5 py-0.5 rounded-[3px] text-[9px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                          {r.jenis_pengiriman}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">{r.jumlah_ritase} Rit</TableCell>
                    <TableCell className="text-xs text-right font-medium">{r.tonase} T</TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      <div className="font-semibold text-foreground">
                        Rp{Number(r.tarif_per_ritase || 0).toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-emerald-500 font-bold">
                        Total: Rp{(Number(r.tarif_per_ritase || 0) * Number(r.jumlah_ritase || 0)).toLocaleString("id-ID")}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      <div className="font-bold text-foreground">
                        Rp{((Number(r.biaya_bbm) || 0) + (Number(r.jumlah_ritase) * 50000)).toLocaleString("id-ID")}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        BBM: Rp{Number(r.biaya_bbm || 0).toLocaleString("id-ID")} | Driver: Rp{Number(r.jumlah_ritase * 50000).toLocaleString("id-ID")}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${r.status === "Approved"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
                              : r.status === "Rejected"
                                ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400"
                                : "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                            }`}
                        >
                          {r.status}
                        </span>
                        {r.status === "Rejected" && r.rejected_reason && (
                          <span className="text-[9px] text-rose-600 dark:text-rose-400 italic max-w-[100px] truncate" title={r.rejected_reason}>
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
                    <TableCell className="text-xs text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {showSupervisorApproval && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerApprove(r.id);
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10"
                              title="Setujui"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerReject(r.id);
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10"
                              title="Tolak"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        {canEdit && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(r);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 size={14} />
                          </Button>
                        )}
                        {isManager && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(r.id);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          >
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
                  <TableCell colSpan={isManager ? 12 : 11} className="text-center py-10 text-xs text-muted-foreground">
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

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Kontrak Hauling</label>
              <Select value={kontrakHaulingId} onValueChange={(val) => {
                setKontrakHaulingId(val);
                setUnitId("");
                if (!isDriver) {
                  setDriverId("");
                }
              }}>
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue placeholder="Pilih Kontrak" />
                </SelectTrigger>
                <SelectContent>
                  {loadingKontrak ? (
                    <SelectItem value="loading" disabled className="text-muted-foreground text-xs italic">
                      Sedang memuat kontrak...
                    </SelectItem>
                  ) : kontrakList.length === 0 ? (
                    <SelectItem value="none" disabled className="text-muted-foreground text-xs italic whitespace-normal max-w-[280px]">
                      Tidak ada kontrak hauling aktif. (Tambahkan kontrak di menu Master Data)
                    </SelectItem>
                  ) : (
                    kontrakList.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.kode_kontrak} - {k.perusahaan}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="space-y-1"
                onClickCapture={(e) => {
                  if (!kontrakHaulingId) {
                    e.stopPropagation();
                    e.preventDefault();
                    toast({ title: "Peringatan", description: "Silakan pilih kontrak hauling terlebih dahulu", type: "warning" });
                  }
                }}
              >
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Unit Dump Truck</label>
                <Select value={unitId} onValueChange={setUnitId} disabled={!kontrakHaulingId}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder={kontrakHaulingId ? "Pilih DT" : "Pilih Kontrak Dulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingUnits ? (
                      <SelectItem value="loading" disabled className="text-muted-foreground text-xs italic">
                        Sedang memuat unit DT...
                      </SelectItem>
                    ) : filteredUnits.length === 0 ? (
                      <SelectItem value="none" disabled className="text-muted-foreground text-xs italic whitespace-normal max-w-[280px]">
                        Tidak ada unit DT aktif yang ditugaskan ke kontrak ini. (Hubungkan unit ke kontrak di menu Unit DT)
                      </SelectItem>
                    ) : (
                      filteredUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.kode_unit} ({u.nomor_polisi})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div
                className="space-y-1"
                onClickCapture={(e) => {
                  if (!isDriver && !kontrakHaulingId) {
                    e.stopPropagation();
                    e.preventDefault();
                    toast({ title: "Peringatan", description: "Silakan pilih kontrak hauling terlebih dahulu", type: "warning" });
                  }
                }}
              >
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Driver</label>
                {isDriver ? (
                  <Input
                    value={linkedDriver?.nama || "Sedang memuat..."}
                    disabled
                    className="text-xs h-9 bg-muted"
                  />
                ) : (
                  <Select value={driverId} onValueChange={setDriverId} disabled={!kontrakHaulingId}>
                    <SelectTrigger className="text-xs h-9 bg-card">
                      <SelectValue placeholder={kontrakHaulingId ? "Pilih Driver" : "Pilih Kontrak Dulu"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingDrivers ? (
                        <SelectItem value="loading" disabled className="text-muted-foreground text-xs italic">
                          Sedang memuat driver...
                        </SelectItem>
                      ) : filteredDrivers.length === 0 ? (
                        <SelectItem value="none" disabled className="text-muted-foreground text-xs italic whitespace-normal max-w-[280px]">
                          Tidak ada driver aktif yang ditugaskan ke kontrak ini. (Hubungkan driver ke kontrak di menu Driver)
                        </SelectItem>
                      ) : (
                        filteredDrivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nama}
                          </SelectItem>
                        ))
                      )}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Jenis Pengiriman</label>
                <Select value={jenisPengiriman} onValueChange={setJenisPengiriman}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pit ke tongkang">Pit ke tongkang</SelectItem>
                    <SelectItem value="Pit ke stockfile">Pit ke stockfile</SelectItem>
                    <SelectItem value="Quary">Quary</SelectItem>
                    <SelectItem value="Stockpile ke tongkang">Stockpile ke tongkang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Volume BBM (Liter)</label>
                <Input
                  type="number"
                  value={volumeBbm}
                  onChange={(e) => setVolumeBbm(e.target.value)}
                  className="text-xs h-9"
                  placeholder="Liter"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Harga / Liter BBM (Rp)</label>
                <Input
                  type="number"
                  value={hargaPerLiterBbm}
                  onChange={(e) => setHargaPerLiterBbm(e.target.value)}
                  className="text-xs h-9"
                  placeholder="Harga per liter"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Total BBM (Otomatis)</label>
                <div className="text-xs h-9 px-3 border rounded-md flex items-center bg-muted/30 font-semibold text-rose-500">
                  Rp{((Number(volumeBbm) || 0) * (Number(hargaPerLiterBbm) || 0)).toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Jumlah Rit</label>
                <Input
                  type="number"
                  min="1"
                  value={jumlahRitase}
                  onChange={(e) => setJumlahRitase(e.target.value)}
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
                  onChange={(e) => setTonase(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Pemasukan / Rit</label>
                <Input
                  type="number"
                  value={tarifPerRitase}
                  onChange={(e) => setTarifPerRitase(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Keterangan Biaya / Pemasukan</label>
              <Input
                placeholder="Contoh: BBM solar Rp100k, toll Rp20k, insentif driver Rp60k"
                value={keteranganTarif}
                onChange={(e) => setKeteranganTarif(e.target.value)}
                className="text-xs h-9"
              />
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

      {/* Detail Ritase Dialog */}
      <Dialog open={!!selectedRitaseDetail} onOpenChange={() => setSelectedRitaseDetail(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-orange-500">
              <Clock size={18} /> Detail Log Ritase Hauling
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detail lengkap log operasional hauling per ritase.
            </DialogDescription>
          </DialogHeader>

          {selectedRitaseDetail && (
            <div className="space-y-4 py-2">
              {/* Status Header Block */}
              <div className={`p-3 rounded-lg border flex flex-col gap-2 ${selectedRitaseDetail.status === "Approved"
                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300"
                  : selectedRitaseDetail.status === "Rejected"
                    ? "bg-rose-50/50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300"
                    : "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-300"
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Status Log</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${selectedRitaseDetail.status === "Approved"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-400"
                        : selectedRitaseDetail.status === "Rejected"
                          ? "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/50 dark:border-rose-800 dark:text-rose-400"
                          : "bg-zinc-200 border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                      }`}>
                      {selectedRitaseDetail.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    ID: <span className="font-mono">{selectedRitaseDetail.id.substring(0, 8)}...</span>
                  </div>
                </div>

                {selectedRitaseDetail.status === "Approved" && (
                  <div className="text-xs flex items-center gap-1.5 mt-1">
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Disetujui oleh <strong className="font-semibold">{selectedRitaseDetail.profiles?.nama || "Sistem"}</strong> pada {new Date(selectedRitaseDetail.approved_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                )}

                {selectedRitaseDetail.status === "Rejected" && (
                  <div className="text-xs flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="font-bold text-rose-700 dark:text-rose-400">Alasan Penolakan:</span>
                    </div>
                    <p className="bg-rose-100/50 dark:bg-rose-950/40 p-2 rounded text-xs italic border border-rose-200/50 dark:border-rose-900/30 text-rose-900 dark:text-rose-200">
                      "{selectedRitaseDetail.rejected_reason || "Tidak ada alasan spesifik."}"
                    </p>
                  </div>
                )}
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Waktu & Lokasi */}
                <div className="p-3 rounded-lg border bg-card/50 space-y-3">
                  <div className="flex items-center gap-1.5 border-b pb-1.5">
                    <Clock size={15} className="text-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-card-foreground">Waktu & Rute Pit</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Kontrak Hauling</div>
                      <div className="text-xs font-bold text-orange-500">
                        {selectedRitaseDetail.kontrak_hauling?.kode_kontrak} - {selectedRitaseDetail.kontrak_hauling?.perusahaan}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Tanggal Operasional</div>
                      <div className="text-xs font-medium">
                        {new Date(selectedRitaseDetail.tanggal).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Rute Perjalanan</div>
                      <div className="text-xs flex items-center gap-1 mt-0.5">
                        <span className="font-bold text-foreground bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded text-[10px]">
                          Pit Loading
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-bold text-foreground bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded text-[10px]">
                          Jetty Dumping
                        </span>
                      </div>
                      <div className="mt-1 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dari:</span>
                          <span className="font-semibold text-right">{selectedRitaseDetail.lokasi_loading?.nama_lokasi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ke:</span>
                          <span className="font-semibold text-right">{selectedRitaseDetail.lokasi_dumping?.nama_lokasi}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detail Unit DT */}
                <div className="p-3 rounded-lg border bg-card/50 space-y-3">
                  <div className="flex items-center gap-1.5 border-b pb-1.5">
                    <Truck size={15} className="text-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-card-foreground">Unit Dump Truck</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kode Unit:</span>
                      <span className="font-bold text-orange-500">{selectedRitaseDetail.unit?.kode_unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nomor Polisi:</span>
                      <span className="font-semibold">{selectedRitaseDetail.unit?.nomor_polisi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Merk / Brand:</span>
                      <span className="font-semibold">{selectedRitaseDetail.unit?.merk || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipe Unit:</span>
                      <span className="font-semibold">{selectedRitaseDetail.unit?.tipe || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Detail Driver */}
                <div className="p-3 rounded-lg border bg-card/50 space-y-3">
                  <div className="flex items-center gap-1.5 border-b pb-1.5">
                    <User size={15} className="text-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-card-foreground">Driver (Pengemudi)</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama Pengemudi:</span>
                      <span className="font-bold">{selectedRitaseDetail.driver?.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NIK Driver:</span>
                      <span className="font-mono font-medium">{selectedRitaseDetail.driver?.nik || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No. Handphone:</span>
                      <span className="font-medium">{selectedRitaseDetail.driver?.nomor_hp || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Volume & Biaya */}
                <div className="p-3 rounded-lg border bg-card/50 space-y-3">
                  <div className="flex items-center gap-1.5 border-b pb-1.5">
                    <Fuel size={15} className="text-orange-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-card-foreground">Volume & Pemasukan</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Ritase:</span>
                      <span className="font-bold text-foreground">{selectedRitaseDetail.jumlah_ritase} Rit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tonase:</span>
                      <span className="font-bold text-foreground">{selectedRitaseDetail.tonase} Ton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rata-rata/Rit:</span>
                      <span className="font-semibold text-muted-foreground">
                        {selectedRitaseDetail.jumlah_ritase > 0
                          ? (selectedRitaseDetail.tonase / selectedRitaseDetail.jumlah_ritase).toFixed(2)
                          : "0"} Ton/Rit
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5">
                      <span className="text-muted-foreground">Pemasukan per Rit:</span>
                      <span className="font-semibold">Rp{Number(selectedRitaseDetail.tarif_per_ritase).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-orange-500 border-t border-dashed pt-1.5">
                      <span>Total Pendapatan:</span>
                      <span>Rp{(selectedRitaseDetail.tarif_per_ritase * selectedRitaseDetail.jumlah_ritase).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Harga Pokok Penjualan (HPP) Breakdown */}
              <div className="p-3 rounded-lg border bg-card/50 space-y-3">
                <div className="flex items-center gap-1.5 border-b pb-1.5">
                  <AlertCircle size={15} className="text-orange-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-card-foreground">Harga Pokok Penjualan (HPP)</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jenis Pengiriman:</span>
                    <span className="font-bold text-foreground">{selectedRitaseDetail.jenis_pengiriman}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biaya BBM:</span>
                    <span className="font-semibold text-foreground">Rp{Number(selectedRitaseDetail.biaya_bbm || 0).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gaji Supir (Trip):</span>
                    <span className="font-semibold text-foreground">
                      Rp{Number(selectedRitaseDetail.jumlah_ritase * 50000).toLocaleString("id-ID")}
                      <span className="text-[10px] text-muted-foreground font-normal"> ({selectedRitaseDetail.jumlah_ritase} Rit x Rp50.000)</span>
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-500 border-t border-dashed pt-1.5">
                    <span>Total HPP Ritase:</span>
                    <span>Rp{((Number(selectedRitaseDetail.biaya_bbm) || 0) + (Number(selectedRitaseDetail.jumlah_ritase) * 50000)).toLocaleString("id-ID")}</span>
                  </div>
                  {(() => {
                    const totalHpp = (Number(selectedRitaseDetail.biaya_bbm) || 0) + (Number(selectedRitaseDetail.jumlah_ritase) * 50000);
                    const hppPerRitase = selectedRitaseDetail.jumlah_ritase > 0 ? (totalHpp / selectedRitaseDetail.jumlah_ritase) : 0;
                    return (
                      <div className="flex justify-between text-[11px] font-bold text-muted-foreground border-t pt-1.5">
                        <span>HPP per Ritase:</span>
                        <span className="text-foreground">Rp{hppPerRitase.toLocaleString("id-ID")} / Rit</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Rincian Tarif / Keterangan */}
              <div className="p-3 rounded-lg border bg-card/50 space-y-2">
                <div className="flex items-center gap-1.5 border-b pb-1.5">
                  <FileText size={15} className="text-orange-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-card-foreground">Keterangan Biaya / Pemasukan</h3>
                </div>
                <p className="text-xs text-foreground bg-muted/30 p-2.5 rounded border leading-relaxed whitespace-pre-wrap">
                  {selectedRitaseDetail.keterangan_tarif || "Tidak ada keterangan atau rincian biaya tambahan yang dicantumkan."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-3 mt-2">
            <Button type="button" onClick={() => setSelectedRitaseDetail(null)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
              Tutup Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Bar for Bulk Actions */}
      {isManager && selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/95 border shadow-xl rounded-full px-4 py-2.5 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-semibold text-muted-foreground">
            {selectedIds.length} item terpilih
          </span>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
            className="text-xs h-8 px-3 rounded-full hover:bg-muted"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteIds(selectedIds)}
            className="text-xs h-8 px-3 rounded-full gap-1.5 bg-rose-500 hover:bg-rose-600 text-white"
          >
            <Trash2 size={13} />
            Hapus Terpilih
          </Button>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteIds && deleteIds.length > 0}
        onOpenChange={(open) => !open && setDeleteIds(null)}
        onConfirm={() => {
          if (deleteIds) {
            if (deleteIds.length === 1) {
              deleteMutation.mutate(deleteIds[0]);
            } else {
              deleteMultipleMutation.mutate(deleteIds);
            }
            setDeleteIds(null);
          }
        }}
        isLoading={deleteMutation.isPending || deleteMultipleMutation.isPending}
        title={deleteIds && deleteIds.length > 1 ? "Hapus Beberapa Catatan Ritase" : "Hapus Catatan Ritase"}
        description={
          deleteIds && deleteIds.length > 1
            ? `Apakah Anda yakin ingin menghapus ${deleteIds.length} catatan ritase yang dipilih? Tindakan ini tidak dapat dibatalkan.`
            : "Apakah Anda yakin ingin menghapus catatan ritase ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}
