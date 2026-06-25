"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnits, createUnit, updateUnit, deleteUnit } from "@/app/actions/unit";
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
import { Plus, Search, Edit2, Trash2, Loader2, Filter } from "lucide-react";

export default function UnitsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isOpen, setIsOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<any>(null);

  const [kodeUnit, setKodeUnit] = useState("");
  const [nomorPolisi, setNomorPolisi] = useState("");
  const [merk, setMerk] = useState("");
  const [tipe, setTipe] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [kapasitas, setKapasitas] = useState(24);
  const [status, setStatus] = useState<"Aktif" | "Maintenance" | "Rusak" | "Nonaktif">("Aktif");

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast({ title: "Sukses", description: "Unit baru berhasil ditambahkan", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menambahkan unit", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast({ title: "Sukses", description: "Data unit berhasil diperbarui", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui unit", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) => deleteUnit(id, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast({ title: "Sukses", description: "Unit berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus unit", type: "error" });
    }
  });

  const openAddDialog = () => {
    setEditUnit(null);
    setKodeUnit("");
    setNomorPolisi("");
    setMerk("");
    setTipe("");
    setTahun(new Date().getFullYear());
    setKapasitas(24);
    setStatus("Aktif");
    setIsOpen(true);
  };

  const openEditDialog = (u: any) => {
    setEditUnit(u);
    setKodeUnit(u.kode_unit);
    setNomorPolisi(u.nomor_polisi);
    setMerk(u.merk);
    setTipe(u.tipe);
    setTahun(u.tahun);
    setKapasitas(Number(u.kapasitas_ton));
    setStatus(u.status);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeUnit || !nomorPolisi || !merk || !tipe) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }

    const payload = {
      kode_unit: kodeUnit.toUpperCase(),
      nomor_polisi: nomorPolisi.toUpperCase(),
      merk,
      tipe,
      tahun: Number(tahun),
      kapasitas_ton: Number(kapasitas),
      status,
    };

    if (editUnit) {
      updateMutation.mutate({ id: editUnit.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus unit ${code}?`)) {
      deleteMutation.mutate({ id, code });
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const matchSearch =
        u.kode_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nomor_polisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.tipe.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchFilter = statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchFilter;
    });
  }, [units, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUnits.slice(start, start + itemsPerPage);
  }, [filteredUnits, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manajemen Unit DT</h1>
          <p className="text-xs text-muted-foreground">Kelola armada dump truck nikel perusahaan</p>
        </div>
        <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
          <Plus size={16} /> Tambah Unit DT
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode unit, nopol, merk, tipe..."
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
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Rusak">Rusak</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <TableHead className="text-xs">Kode Unit</TableHead>
                <TableHead className="text-xs">Nomor Polisi</TableHead>
                <TableHead className="text-xs">Merk & Tipe</TableHead>
                <TableHead className="text-xs">Tahun</TableHead>
                <TableHead className="text-xs text-right">Kapasitas (Ton)</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUnits.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-semibold text-orange-500">{u.kode_unit}</TableCell>
                  <TableCell className="text-xs font-mono">{u.nomor_polisi}</TableCell>
                  <TableCell className="text-xs">{u.merk} {u.tipe}</TableCell>
                  <TableCell className="text-xs">{u.tahun}</TableCell>
                  <TableCell className="text-xs text-right">{u.kapasitas_ton} T</TableCell>
                  <TableCell className="text-xs text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === "Aktif"
                          ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                          : u.status === "Maintenance"
                          ? "bg-amber-950/40 border-amber-800 text-amber-400"
                          : u.status === "Rusak"
                          ? "bg-rose-950/40 border-rose-800 text-rose-400"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {u.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-right space-x-1">
                    <Button onClick={() => openEditDialog(u)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Edit2 size={14} />
                    </Button>
                    <Button onClick={() => handleDelete(u.id, u.kode_unit)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUnits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada unit DT yang cocok dengan filter / pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUnits.length)} dari {filteredUnits.length} unit
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editUnit ? `Edit Unit DT ${editUnit.kode_unit}` : "Tambah Unit DT Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Isi data detail spesifikasi dump truck nikel secara lengkap.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Kode Unit</label>
                <Input
                  placeholder="DT-001"
                  value={kodeUnit}
                  onChange={(e) => setKodeUnit(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">No. Polisi</label>
                <Input
                  placeholder="DD 8122 XY"
                  value={nomorPolisi}
                  onChange={(e) => setNomorPolisi(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Merk</label>
                <Input
                  placeholder="Hino"
                  value={merk}
                  onChange={(e) => setMerk(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tipe</label>
                <Input
                  placeholder="Ranger FM 260 JD"
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tahun Pembuatan</label>
                <Input
                  type="number"
                  placeholder="2022"
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Kapasitas (Ton)</label>
                <Input
                  type="number"
                  placeholder="24"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Status Operasional</label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
              >
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Rusak">Rusak</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
