"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} from "@/app/actions/maintenance";
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
import { Plus, Search, Edit2, Trash2, Loader2, CheckCircle2, AlertTriangle, Hammer, Filter } from "lucide-react";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [userProfile, setUserProfile] = useState<any>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editMaint, setEditMaint] = useState<any>(null);

  // Form Fields
  const [tanggal, setTanggal] = useState("");
  const [unitId, setUnitId] = useState("");
  const [jenisMaintenance, setJenisMaintenance] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [biaya, setBiaya] = useState(0);
  const [vendor, setVendor] = useState("");
  const [kilometer, setKilometer] = useState(0);
  const [status, setStatus] = useState<"Scheduled" | "In Progress" | "Completed">("Scheduled");

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

  const isSupervisorOrAbove = userProfile && ["Owner", "Full Access", "Admin", "Supervisor"].includes(userProfile.role);
  const isManager = userProfile && ["Owner", "Full Access", "Admin"].includes(userProfile.role);

  // Queries
  const { data: maintLogs = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: getMaintenance,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units-active"],
    queryFn: getUnits, // Allow selecting even non-active units since they might be in maintenance!
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast({ title: "Sukses", description: "Perbaikan baru berhasil dijadwalkan", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menjadwalkan perbaikan", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast({ title: "Sukses", description: "Log perbaikan berhasil diperbarui", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui log", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast({ title: "Sukses", description: "Log perbaikan berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus log", type: "error" });
    }
  });

  const openAddDialog = () => {
    setEditMaint(null);
    setTanggal(new Date().toISOString().substring(0, 10));
    setUnitId(units[0]?.id || "");
    setJenisMaintenance("");
    setDeskripsi("");
    setBiaya(0);
    setVendor("");
    setKilometer(0);
    setStatus("Scheduled");
    setIsOpen(true);
  };

  const openEditDialog = (m: any) => {
    setEditMaint(m);
    setTanggal(m.tanggal);
    setUnitId(m.unit_id);
    setJenisMaintenance(m.jenis_maintenance);
    setDeskripsi(m.deskripsi);
    setBiaya(Number(m.biaya));
    setVendor(m.vendor);
    setKilometer(Number(m.kilometer));
    setStatus(m.status);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !unitId || !jenisMaintenance || !vendor) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }

    const payload = {
      tanggal,
      unit_id: unitId,
      jenis_maintenance: jenisMaintenance,
      deskripsi,
      biaya: Number(biaya),
      vendor,
      kilometer: Number(kilometer),
      status,
    };

    if (editMaint) {
      updateMutation.mutate({ id: editMaint.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus log maintenance ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredLogs = useMemo(() => {
    return maintLogs.filter((m) => {
      const matchSearch =
        m.unit?.kode_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.jenis_maintenance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [maintLogs, searchTerm, statusFilter]);

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
          <h1 className="text-2xl font-extrabold tracking-tight">Perawatan & Perbaikan (Maintenance)</h1>
          <p className="text-xs text-muted-foreground">Kendalikan jadwal reparasi dan pengeluaran bengkel armada</p>
        </div>
        {isManager && (
          <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
            <Plus size={16} /> Jadwalkan Perbaikan
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari unit DT, jenis maintenance, atau bengkel vendor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] text-xs h-9 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
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
                <TableHead className="text-xs">Jenis Maintenance</TableHead>
                <TableHead className="text-xs">Vendor</TableHead>
                <TableHead className="text-xs text-right">Odometer (Km)</TableHead>
                <TableHead className="text-xs text-right">Biaya Perbaikan</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                {isSupervisorOrAbove && <TableHead className="text-xs text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((m) => {
                const canEdit = isSupervisorOrAbove;
                const canDelete = isManager;

                return (
                  <TableRow key={m.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono">{m.tanggal}</TableCell>
                    <TableCell className="text-xs font-bold text-orange-500">{m.unit?.kode_unit}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{m.jenis_maintenance}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={m.deskripsi}>
                        {m.deskripsi}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{m.vendor}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{Number(m.kilometer).toLocaleString()} Km</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-rose-400">
                      Rp{Number(m.biaya).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            m.status === "Completed"
                              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                              : m.status === "In Progress"
                              ? "bg-amber-950/40 border-amber-800 text-amber-400"
                              : "bg-blue-950/40 border-blue-800 text-blue-400"
                          }`}
                        >
                          {m.status}
                        </span>
                        {m.status === "Completed" && m.profiles && (
                          <span className="text-[8px] text-muted-foreground uppercase">
                            Approved: {m.profiles.nama}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {isSupervisorOrAbove && (
                      <TableCell className="text-xs text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button onClick={() => openEditDialog(m)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <Edit2 size={14} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button onClick={() => handleDelete(m.id)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isSupervisorOrAbove ? 8 : 7} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada log maintenance yang sesuai.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} perbaikan
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editMaint ? `Ubah Maintenance Unit: ${editMaint.unit?.kode_unit}` : "Jadwalkan Maintenance Unit DT"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mencatat riwayat service, penggantian sparepart, dan log kilometer odometer armada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* If Supervisor, lock fields except Status */}
            {userProfile?.role === "Supervisor" && editMaint ? (
              <div className="p-3 bg-muted rounded-lg text-xs space-y-1 mb-2">
                <div><span className="font-semibold text-muted-foreground">Jenis:</span> {jenisMaintenance}</div>
                <div><span className="font-semibold text-muted-foreground">Odometer:</span> {kilometer.toLocaleString()} Km</div>
                <div><span className="font-semibold text-muted-foreground">Biaya:</span> Rp{biaya.toLocaleString()}</div>
                <div><span className="font-semibold text-muted-foreground">Deskripsi:</span> {deskripsi}</div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Service</label>
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
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Bengkel Vendor</label>
                    <Input
                      placeholder="Hino Service Center"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Jenis Perbaikan</label>
                    <Input
                      placeholder="Ganti Ban / Oli filter"
                      value={jenisMaintenance}
                      onChange={(e) => setJenisMaintenance(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">Kilometer (Odometer)</label>
                    <Input
                      type="number"
                      value={kilometer}
                      onChange={(e) => setKilometer(Math.max(0, Number(e.target.value)))}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Total Biaya Perbaikan (Rp)</label>
                  <Input
                    type="number"
                    value={biaya}
                    onChange={(e) => setBiaya(Math.max(0, Number(e.target.value)))}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Deskripsi Kerusakan / Service</label>
                  <Input
                    placeholder="Tuliskan keterangan detail sparepart..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Status Perbaikan</label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan..." : "Simpan Log"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
