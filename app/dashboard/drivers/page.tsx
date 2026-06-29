"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDrivers, createDriver, updateDriver, deleteDriver, getUnlinkedProfiles } from "@/app/actions/driver";
import { getKontrakHauling } from "@/app/actions/master";
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
import { Plus, Search, Edit2, Trash2, Loader2, AlertTriangle, UserCheck } from "lucide-react";

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isOpen, setIsOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [nomorSim, setNomorSim] = useState("");
  const [masaBerlakuSim, setMasaBerlakuSim] = useState("");
  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif");
  const [profileId, setProfileId] = useState("");
  const [kontrakHaulingId, setKontrakHaulingId] = useState("");

  const anchorDateStr = "2026-06-25";
  const anchorDate = new Date(anchorDateStr);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });

  const { data: unlinkedProfiles = [] } = useQuery({
    queryKey: ["unlinked-profiles"],
    queryFn: getUnlinkedProfiles,
  });

  const { data: kontrakList = [] } = useQuery({
    queryKey: ["kontrak_hauling"],
    queryFn: getKontrakHauling,
  });

  const createMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["unlinked-profiles"] });
      toast({ title: "Sukses", description: "Driver baru berhasil terdaftar", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal mendaftarkan driver", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDriver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["unlinked-profiles"] });
      toast({ title: "Sukses", description: "Data driver berhasil diperbarui", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui driver", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => deleteDriver(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["unlinked-profiles"] });
      toast({ title: "Sukses", description: "Driver berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus driver", type: "error" });
    }
  });

  const openAddDialog = () => {
    setEditDriver(null);
    setNama("");
    setNik("");
    setNomorHp("");
    setAlamat("");
    setNomorSim("");
    setMasaBerlakuSim("");
    setTanggalMasuk("");
    setStatus("Aktif");
    setProfileId("");
    setKontrakHaulingId("");
    setIsOpen(true);
  };

  const openEditDialog = (d: any) => {
    setEditDriver(d);
    setNama(d.nama);
    setNik(d.nik);
    setNomorHp(d.nomor_hp);
    setAlamat(d.alamat);
    setNomorSim(d.nomor_sim);
    setMasaBerlakuSim(d.masa_berlaku_sim);
    setTanggalMasuk(d.tanggal_masuk);
    setStatus(d.status);
    setProfileId(d.profile_id || "");
    setKontrakHaulingId(d.kontrak_hauling_id || "");
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nik || !nomorHp || !alamat || !nomorSim || !masaBerlakuSim || !tanggalMasuk) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }

    const payload = {
      nama,
      nik,
      nomor_hp: nomorHp,
      alamat,
      nomor_sim: nomorSim,
      masa_berlaku_sim: masaBerlakuSim,
      tanggal_masuk: tanggalMasuk,
      status,
      profile_id: profileId || null,
      kontrak_hauling_id: kontrakHaulingId || null,
    };

    if (editDriver) {
      updateMutation.mutate({ id: editDriver.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const expiringDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (d.status !== "Aktif") return false;
      const simDate = new Date(d.masa_berlaku_sim);
      const diffTime = simDate.getTime() - anchorDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });
  }, [drivers]);

  const getSimExpiryBadge = (dateStr: string) => {
    const simDate = new Date(dateStr);
    const diffTime = simDate.getTime() - anchorDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400">
          EXPIRED ({Math.abs(diffDays)} hari)
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
          EXPIRES SOON ({diffDays} hari)
        </span>
      );
    }
    return <span className="text-xs font-mono">{dateStr}</span>;
  };

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchSearch =
        d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nik.includes(searchTerm) ||
        d.nomor_sim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.alamat.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [drivers, searchTerm]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage]);

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

  const profileOptions = useMemo(() => {
    const list = [...unlinkedProfiles];
    if (editDriver && editDriver.profiles) {
      const exists = list.some((p) => p.id === editDriver.profiles.id);
      if (!exists) {
        list.push(editDriver.profiles);
      }
    }
    return list;
  }, [unlinkedProfiles, editDriver]);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manajemen Driver</h1>
          <p className="text-xs text-muted-foreground">Registrasi dan tracking izin lisensi driver hauling</p>
        </div>
        <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
          <Plus size={16} /> Registrasi Driver
        </Button>
      </div>

      {expiringDrivers.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            Perhatian: {expiringDrivers.length} Driver Memiliki SIM Kadaluwarsa / Segera Habis
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Segera hubungi driver berikut untuk melakukan perpanjangan SIM agar tetap memenuhi standar compliance keselamatan angkutan nikel:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {expiringDrivers.map((d) => (
              <span key={d.id} className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                {d.nama} ({d.nomor_sim})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari driver berdasarkan nama, NIK, SIM, atau alamat..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 text-xs h-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nama</TableHead>
                <TableHead className="text-xs">Kontrak Aktif</TableHead>
                <TableHead className="text-xs">NIK</TableHead>
                <TableHead className="text-xs">No. HP / Alamat</TableHead>
                <TableHead className="text-xs">Nomor SIM</TableHead>
                <TableHead className="text-xs">Masa Berlaku SIM</TableHead>
                <TableHead className="text-xs">Tgl Masuk</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs text-center">Tautan Akun</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDrivers.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-semibold text-foreground">{d.nama}</TableCell>
                  <TableCell className="text-xs">
                    {d.kontrak_hauling ? (
                      <div>
                        <div className="font-bold text-orange-500">{d.kontrak_hauling.kode_kontrak}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={d.kontrak_hauling.perusahaan}>
                          {d.kontrak_hauling.perusahaan}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{d.nik}</TableCell>
                  <TableCell className="text-xs">
                    <div>{d.nomor_hp}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{d.alamat}</div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{d.nomor_sim}</TableCell>
                  <TableCell className="text-xs">
                    {getSimExpiryBadge(d.masa_berlaku_sim)}
                  </TableCell>
                  <TableCell className="text-xs">{d.tanggal_masuk}</TableCell>
                  <TableCell className="text-xs text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === "Aktif"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
                          : "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-center font-mono">
                    {d.profiles ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <UserCheck size={12} /> Linked
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-right space-x-1">
                    <Button onClick={() => openEditDialog(d)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Edit2 size={14} />
                    </Button>
                    <Button onClick={() => handleDelete(d.id, d.nama)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada driver yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredDrivers.length)} dari {filteredDrivers.length} driver
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editDriver ? `Edit Data Driver: ${editDriver.nama}` : "Registrasi Driver Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Isi data berkas personal driver dan tanggal validasi SIM secara teliti.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nama Lengkap</label>
                <Input
                  placeholder="Supriadi"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">NIK KTP</label>
                <Input
                  placeholder="7401021203850001"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nomor HP</label>
                <Input
                  placeholder="0852xxxxxxxx"
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nomor SIM BII</label>
                <Input
                  placeholder="SIM-BII-9012"
                  value={nomorSim}
                  onChange={(e) => setNomorSim(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Alamat Lengkap</label>
              <Input
                placeholder="Bahodopi, Morowali"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Masa Berlaku SIM</label>
                <Input
                  type="date"
                  value={masaBerlakuSim}
                  onChange={(e) => setMasaBerlakuSim(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Masuk Kerja</label>
                <Input
                  type="date"
                  value={tanggalMasuk}
                  onChange={(e) => setTanggalMasuk(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Status Driver</label>
                <Select
                  value={status}
                  onValueChange={(val: any) => setStatus(val)}
                >
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Kontrak Hauling Aktif</label>
              <Select
                value={kontrakHaulingId}
                onValueChange={setKontrakHaulingId}
              >
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue placeholder="Pilih Kontrak Hauling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">- Tidak Ada Kontrak / Nonaktif -</SelectItem>
                  {kontrakList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.kode_kontrak} - {k.perusahaan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tautan Akun Login</label>
                <Select
                  value={profileId}
                  onValueChange={(val) => setProfileId(val)}
                >
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Pilih Akun Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">- Belum Ditautkan -</SelectItem>
                    {profileOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Mendaftarkan..." : "Simpan Data"}
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
            deleteMutation.mutate({ id: deleteId, name: deleteName });
            setDeleteId(null);
          }
        }}
        title="Hapus Data Driver"
        description={`Apakah Anda yakin ingin menghapus driver ${deleteName}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
