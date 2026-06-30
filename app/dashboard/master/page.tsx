"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKontrakHauling,
  createKontrakHauling,
  updateKontrakHauling,
  deleteKontrakHauling,
  getLokasiLoading,
  createLokasiLoading,
  updateLokasiLoading,
  deleteLokasiLoading,
  getLokasiDumping,
  createLokasiDumping,
  updateLokasiDumping,
  deleteLokasiDumping
} from "@/app/actions/master";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Building,
  MapPin,
  Landmark,
  FileText,
  Calendar,
  Truck,
  TrendingUp
} from "lucide-react";

export default function MasterDataPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("contracts");

  // Search filters
  const [searchKontrak, setSearchKontrak] = useState("");
  const [searchLoading, setSearchLoading] = useState("");
  const [searchDumping, setSearchDumping] = useState("");

  // Modals state
  const [isCustOpen, setIsCustOpen] = useState(false);
  const [isLoadingOpen, setIsLoadingOpen] = useState(false);
  const [isDumpingOpen, setIsDumpingOpen] = useState(false);

  // Edit references
  const [editCust, setEditCust] = useState<any>(null);
  const [editLoading, setEditLoading] = useState<any>(null);
  const [editDumping, setEditDumping] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: "contract" | "loading" | "dumping";
  } | null>(null);

  // Form fields for Hauling Contracts
  const [kodeKontrak, setKodeKontrak] = useState("");
  const [perusahaan, setPerusahaan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [statusKontrak, setStatusKontrak] = useState("Aktif");

  // Form fields for Locations
  const [namaLokasi, setNamaLokasi] = useState("");

  // Queries
  const { data: kontrakHauling = [], isLoading: loadKontrak } = useQuery({
    queryKey: ["kontrak_hauling"],
    queryFn: getKontrakHauling,
  });

  const { data: loadingLocs = [], isLoading: loadLoad } = useQuery({
    queryKey: ["loading-locations"],
    queryFn: getLokasiLoading,
  });

  const { data: dumpingLocs = [], isLoading: loadDump } = useQuery({
    queryKey: ["dumping-locations"],
    queryFn: getLokasiDumping,
  });

  // Kontrak Hauling Mutators
  const mutateKontrakCreate = useMutation({
    mutationFn: createKontrakHauling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kontrak_hauling"] });
      toast({ title: "Sukses", description: "Kontrak hauling baru ditambahkan", type: "success" });
      setIsCustOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menambahkan kontrak hauling", type: "error" });
    }
  });

  const mutateKontrakUpdate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateKontrakHauling(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kontrak_hauling"] });
      toast({ title: "Sukses", description: "Kontrak hauling diperbarui", type: "success" });
      setIsCustOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui kontrak hauling", type: "error" });
    }
  });

  const mutateKontrakDelete = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => deleteKontrakHauling(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kontrak_hauling"] });
      toast({ title: "Sukses", description: "Kontrak hauling berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus kontrak hauling", type: "error" });
    }
  });

  // Loading Locs Mutators
  const mutateLoadCreate = useMutation({
    mutationFn: createLokasiLoading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loading-locations"] });
      toast({ title: "Sukses", description: "Lokasi loading ditambahkan", type: "success" });
      setIsLoadingOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menambahkan lokasi", type: "error" });
    }
  });

  const mutateLoadUpdate = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateLokasiLoading(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loading-locations"] });
      toast({ title: "Sukses", description: "Lokasi loading diperbarui", type: "success" });
      setIsLoadingOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui lokasi", type: "error" });
    }
  });

  const mutateLoadDelete = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => deleteLokasiLoading(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loading-locations"] });
      toast({ title: "Sukses", description: "Lokasi loading berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus lokasi", type: "error" });
    }
  });

  // Dumping Locs Mutators
  const mutateDumpCreate = useMutation({
    mutationFn: createLokasiDumping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dumping-locations"] });
      toast({ title: "Sukses", description: "Lokasi dumping ditambahkan", type: "success" });
      setIsDumpingOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menambahkan lokasi", type: "error" });
    }
  });

  const mutateDumpUpdate = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateLokasiDumping(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dumping-locations"] });
      toast({ title: "Sukses", description: "Lokasi dumping diperbarui", type: "success" });
      setIsDumpingOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui lokasi", type: "error" });
    }
  });

  const mutateDumpDelete = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => deleteLokasiDumping(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dumping-locations"] });
      toast({ title: "Sukses", description: "Lokasi dumping berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus lokasi", type: "error" });
    }
  });

  // Dialogue Openers
  const openAddKontrak = () => {
    setEditCust(null);
    setKodeKontrak("");
    setPerusahaan("");
    setTanggalMulai("");
    setTanggalSelesai("");
    setStatusKontrak("Aktif");
    setIsCustOpen(true);
  };

  const openEditKontrak = (k: any) => {
    setEditCust(k);
    setKodeKontrak(k.kode_kontrak);
    setPerusahaan(k.perusahaan);
    setTanggalMulai(k.tanggal_mulai);
    setTanggalSelesai(k.tanggal_selesai);
    setStatusKontrak(k.status);
    setIsCustOpen(true);
  };

  const openAddLoading = () => {
    setEditLoading(null);
    setNamaLokasi("");
    setIsLoadingOpen(true);
  };

  const openEditLoading = (l: any) => {
    setEditLoading(l);
    setNamaLokasi(l.nama_lokasi);
    setIsLoadingOpen(true);
  };

  const openAddDumping = () => {
    setEditDumping(null);
    setNamaLokasi("");
    setIsDumpingOpen(true);
  };

  const openEditDumping = (d: any) => {
    setEditDumping(d);
    setNamaLokasi(d.nama_lokasi);
    setIsDumpingOpen(true);
  };

  // Submit Handlers
  const handleCustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeKontrak || !perusahaan || !tanggalMulai || !tanggalSelesai || !statusKontrak) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }
    const payload = {
      kode_kontrak: kodeKontrak,
      perusahaan,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      status: statusKontrak,
    };
    if (editCust) {
      mutateKontrakUpdate.mutate({ id: editCust.id, data: payload });
    } else {
      mutateKontrakCreate.mutate(payload);
    }
  };

  const handleLoadingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLokasi) {
      toast({ title: "Peringatan", description: "Nama lokasi wajib diisi", type: "warning" });
      return;
    }
    if (editLoading) {
      mutateLoadUpdate.mutate({ id: editLoading.id, name: namaLokasi });
    } else {
      mutateLoadCreate.mutate(namaLokasi);
    }
  };

  const handleDumpingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLokasi) {
      toast({ title: "Peringatan", description: "Nama lokasi wajib diisi", type: "warning" });
      return;
    }
    if (editDumping) {
      mutateDumpUpdate.mutate({ id: editDumping.id, name: namaLokasi });
    } else {
      mutateDumpCreate.mutate(namaLokasi);
    }
  };

  // Helper formats
  const formatRupiah = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Filter Lists
  const filteredKontrak = useMemo(() => {
    return kontrakHauling.filter((k) =>
      k.kode_kontrak.toLowerCase().includes(searchKontrak.toLowerCase()) ||
      k.perusahaan.toLowerCase().includes(searchKontrak.toLowerCase())
    );
  }, [kontrakHauling, searchKontrak]);

  const filteredLoading = useMemo(() => {
    return loadingLocs.filter((l) =>
      l.nama_lokasi.toLowerCase().includes(searchLoading.toLowerCase())
    );
  }, [loadingLocs, searchLoading]);

  const filteredDumping = useMemo(() => {
    return dumpingLocs.filter((d) =>
      d.nama_lokasi.toLowerCase().includes(searchDumping.toLowerCase())
    );
  }, [dumpingLocs, searchDumping]);

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Master Data Operasional</h1>
        <p className="text-xs text-muted-foreground">Kelola daftar kontrak hauling, pit loading, dan jetty dumping tambang</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border h-10 p-1 flex">
          <TabsTrigger value="contracts" className="flex-1 text-xs gap-1.5 h-8">
            <FileText size={14} className="text-orange-500" /> Kontrak Hauling
          </TabsTrigger>
          <TabsTrigger value="loading" className="flex-1 text-xs gap-1.5 h-8">
            <MapPin size={14} /> Lokasi Loading (Pit)
          </TabsTrigger>
          <TabsTrigger value="dumping" className="flex-1 text-xs gap-1.5 h-8">
            <Landmark size={14} /> Lokasi Dumping (Jetty)
          </TabsTrigger>
        </TabsList>

        {/* 1. KONTRAK HAULING TAB */}
        <TabsContent value="contracts" className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kode kontrak atau perusahaan..."
                value={searchKontrak}
                onChange={(e) => setSearchKontrak(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Button onClick={openAddKontrak} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs h-9">
              <Plus size={16} /> Tambah Kontrak
            </Button>
          </div>

          {loadKontrak ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKontrak.map((k) => (
                <div key={k.id} className="relative overflow-hidden border rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-200 border-muted-foreground/10 hover:border-orange-500/30 flex flex-col justify-between group">
                  {/* Card Header */}
                  <div className="p-5 border-b border-muted-foreground/10 flex justify-between items-start bg-muted/20">
                    <div>
                      <h3 className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5">
                        <FileText size={15} className="text-orange-500 shrink-0" />
                        Kontrak {k.kode_kontrak}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium leading-none">
                        ID: <span className="font-mono">{k.id.substring(0, 8)}...</span>
                      </p>
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      k.status === 'Aktif'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                        : k.status === 'Selesai'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400'
                    }`}>
                      {k.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1 text-xs">
                    {/* Perusahaan */}
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Perusahaan</div>
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <Building size={14} className="text-muted-foreground/80 shrink-0" />
                        {k.perusahaan}
                      </div>
                    </div>

                    {/* Periode */}
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Periode</div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground/80 shrink-0" />
                        {formatDateIndo(k.tanggal_mulai)} - {formatDateIndo(k.tanggal_selesai)}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 border-t border-muted-foreground/10 pt-4 -mx-5 px-5 py-3 -mb-5 bg-muted/10">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5 font-semibold">Jumlah Unit Ditugaskan</div>
                        <div className="font-extrabold text-orange-500 text-xs flex items-center gap-1 leading-none">
                          <Truck size={13} className="shrink-0 text-orange-500" />
                          {k.unit?.length || 0} Unit Dump Truck
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="p-4 border-t border-muted-foreground/10 bg-muted/5 flex justify-end gap-1.5">
                    <Button onClick={() => openEditKontrak(k)} variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1">
                      <Edit2 size={13} /> Edit
                    </Button>
                    <Button onClick={() => setDeleteTarget({ id: k.id, name: k.kode_kontrak, type: "contract" })} variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1">
                      <Trash2 size={13} /> Hapus
                    </Button>
                  </div>
                </div>
              ))}
              {filteredKontrak.length === 0 && (
                <div className="col-span-full border border-dashed rounded-xl p-12 text-center text-xs text-muted-foreground">
                  Tidak ada kontrak hauling terdaftar.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* 2. LOKASI LOADING TAB */}
        <TabsContent value="loading" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pit loading..."
                value={searchLoading}
                onChange={(e) => setSearchLoading(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Button onClick={openAddLoading} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs h-9">
              <Plus size={16} /> Tambah Pit Loading
            </Button>
          </div>

          {loadLoad ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden max-w-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nama Lokasi Loading (Pit Tambang)</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoading.map((l) => (
                    <TableRow key={l.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold text-foreground">{l.nama_lokasi}</TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button onClick={() => openEditLoading(l)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit2 size={14} />
                        </Button>
                        <Button onClick={() => setDeleteTarget({ id: l.id, name: l.nama_lokasi, type: "loading" })} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLoading.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-10 text-xs text-muted-foreground">Tidak ada lokasi loading.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* 3. LOKASI DUMPING TAB */}
        <TabsContent value="dumping" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari stockpile/jetty dumping..."
                value={searchDumping}
                onChange={(e) => setSearchDumping(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Button onClick={openAddDumping} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs h-9">
              <Plus size={16} /> Tambah Jetty/Stockpile
            </Button>
          </div>

          {loadDump ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden max-w-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nama Lokasi Dumping (Jetty / Stockpile)</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDumping.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold text-foreground">{d.nama_lokasi}</TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button onClick={() => openEditDumping(d)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit2 size={14} />
                        </Button>
                        <Button onClick={() => setDeleteTarget({ id: d.id, name: d.nama_lokasi, type: "dumping" })} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDumping.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-10 text-xs text-muted-foreground">Tidak ada lokasi dumping.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 1a. Kontrak Hauling Form Dialog */}
      <Dialog open={isCustOpen} onOpenChange={setIsCustOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">{editCust ? "Ubah Kontrak Hauling" : "Tambah Kontrak Hauling Baru"}</DialogTitle>
            <DialogDescription className="text-xs">Input data kontrak hauling pengangkutan nikel.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCustSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Kode Kontrak</label>
                <Input placeholder="HK-2026-001" value={kodeKontrak} onChange={(e) => setKodeKontrak(e.target.value)} className="text-xs h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nama Perusahaan</label>
                <Input placeholder="PT Tambang Nikel Indonesia" value={perusahaan} onChange={(e) => setPerusahaan(e.target.value)} className="text-xs h-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Mulai</label>
                <Input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="text-xs h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Selesai</label>
                <Input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="text-xs h-9" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Status Kontrak</label>
              <Select value={statusKontrak} onValueChange={setStatusKontrak}>
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCustOpen(false)} className="text-xs h-9">Batal</Button>
              <Button type="submit" disabled={mutateKontrakCreate.isPending || mutateKontrakUpdate.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2a. Loading Location Form Dialog */}
      <Dialog open={isLoadingOpen} onOpenChange={setIsLoadingOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">{editLoading ? "Ubah Pit Loading" : "Tambah Pit Loading Baru"}</DialogTitle>
            <DialogDescription className="text-xs">Catat pit penambangan baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoadingSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Nama Pit Loading</label>
              <Input placeholder="Pit Sorowako Barat" value={namaLokasi} onChange={(e) => setNamaLokasi(e.target.value)} className="text-xs h-9" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLoadingOpen(false)} className="text-xs h-9">Batal</Button>
              <Button type="submit" disabled={mutateLoadCreate.isPending || mutateLoadUpdate.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3a. Dumping Location Form Dialog */}
      <Dialog open={isDumpingOpen} onOpenChange={setIsDumpingOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">{editDumping ? "Ubah Stockpile/Jetty" : "Tambah Stockpile/Jetty Baru"}</DialogTitle>
            <DialogDescription className="text-xs">Catat lokasi stockpile/jetty pemuatan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDumpingSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Nama Stockpile / Jetty</label>
              <Input placeholder="Jetty Pomalaa Utama" value={namaLokasi} onChange={(e) => setNamaLokasi(e.target.value)} className="text-xs h-9" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDumpingOpen(false)} className="text-xs h-9">Batal</Button>
              <Button type="submit" disabled={mutateDumpCreate.isPending || mutateDumpUpdate.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === "contract") {
              mutateKontrakDelete.mutate({ id: deleteTarget.id, name: deleteTarget.name });
            } else if (deleteTarget.type === "loading") {
              mutateLoadDelete.mutate({ id: deleteTarget.id, name: deleteTarget.name });
            } else if (deleteTarget.type === "dumping") {
              mutateDumpDelete.mutate({ id: deleteTarget.id, name: deleteTarget.name });
            }
            setDeleteTarget(null);
          }
        }}
        title={
          deleteTarget?.type === "contract"
            ? "Hapus Kontrak Hauling"
            : deleteTarget?.type === "loading"
            ? "Hapus Lokasi Loading"
            : "Hapus Lokasi Dumping"
        }
        description={`Apakah Anda yakin ingin menghapus ${
          deleteTarget?.type === "contract"
            ? `kontrak ${deleteTarget?.name}`
            : deleteTarget?.type === "loading"
            ? `lokasi loading ${deleteTarget?.name}`
            : `lokasi dumping ${deleteTarget?.name}`
        }? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
