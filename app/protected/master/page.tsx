"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPelanggan,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
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
import { Plus, Search, Edit2, Trash2, Loader2, Building, MapPin, Landmark } from "lucide-react";

export default function MasterDataPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("customers");

  // Search filters
  const [searchCust, setSearchCust] = useState("");
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

  // Form fields
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [pic, setPic] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [namaLokasi, setNamaLokasi] = useState("");

  // Queries
  const { data: pelanggan = [], isLoading: loadPel } = useQuery({
    queryKey: ["pelanggan"],
    queryFn: getPelanggan,
  });

  const { data: loadingLocs = [], isLoading: loadLoad } = useQuery({
    queryKey: ["loading-locations"],
    queryFn: getLokasiLoading,
  });

  const { data: dumpingLocs = [], isLoading: loadDump } = useQuery({
    queryKey: ["dumping-locations"],
    queryFn: getLokasiDumping,
  });

  // Pelanggan Mutators
  const mutateCustCreate = useMutation({
    mutationFn: createPelanggan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelanggan"] });
      toast({ title: "Sukses", description: "Pelanggan baru ditambahkan", type: "success" });
      setIsCustOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menambahkan pelanggan", type: "error" });
    }
  });

  const mutateCustUpdate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePelanggan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelanggan"] });
      toast({ title: "Sukses", description: "Pelanggan diperbarui", type: "success" });
      setIsCustOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui pelanggan", type: "error" });
    }
  });

  const mutateCustDelete = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => deletePelanggan(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pelanggan"] });
      toast({ title: "Sukses", description: "Pelanggan berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus pelanggan", type: "error" });
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
  const openAddCust = () => {
    setEditCust(null);
    setNamaPerusahaan("");
    setPic("");
    setNomorHp("");
    setAlamat("");
    setIsCustOpen(true);
  };

  const openEditCust = (p: any) => {
    setEditCust(p);
    setNamaPerusahaan(p.nama_perusahaan);
    setPic(p.pic);
    setNomorHp(p.nomor_hp);
    setAlamat(p.alamat);
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
    if (!namaPerusahaan || !pic || !nomorHp || !alamat) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }
    const payload = { nama_perusahaan: namaPerusahaan, pic, nomor_hp: nomorHp, alamat };
    if (editCust) {
      mutateCustUpdate.mutate({ id: editCust.id, data: payload });
    } else {
      mutateCustCreate.mutate(payload);
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

  // Filter Lists
  const filteredCustomers = useMemo(() => {
    return pelanggan.filter((p) =>
      p.nama_perusahaan.toLowerCase().includes(searchCust.toLowerCase()) ||
      p.pic.toLowerCase().includes(searchCust.toLowerCase()) ||
      p.alamat.toLowerCase().includes(searchCust.toLowerCase())
    );
  }, [pelanggan, searchCust]);

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
        <p className="text-xs text-muted-foreground">Kelola daftar pelanggan, pit loading, dan jetty dumping tambang</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border h-10 p-1 flex">
          <TabsTrigger value="customers" className="flex-1 text-xs gap-1.5 h-8">
            <Building size={14} /> Pelanggan
          </TabsTrigger>
          <TabsTrigger value="loading" className="flex-1 text-xs gap-1.5 h-8">
            <MapPin size={14} /> Lokasi Loading (Pit)
          </TabsTrigger>
          <TabsTrigger value="dumping" className="flex-1 text-xs gap-1.5 h-8">
            <Landmark size={14} /> Lokasi Dumping (Jetty)
          </TabsTrigger>
        </TabsList>

        {/* 1. PELANGGAN TAB */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari perusahaan pelanggan..."
                value={searchCust}
                onChange={(e) => setSearchCust(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Button onClick={openAddCust} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs h-9">
              <Plus size={16} /> Tambah Pelanggan
            </Button>
          </div>

          {loadPel ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nama Perusahaan</TableHead>
                    <TableHead className="text-xs">PIC Utama</TableHead>
                    <TableHead className="text-xs">Nomor HP</TableHead>
                    <TableHead className="text-xs">Alamat Kantor</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold text-foreground">{p.nama_perusahaan}</TableCell>
                      <TableCell className="text-xs">{p.pic}</TableCell>
                      <TableCell className="text-xs font-mono">{p.nomor_hp}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{p.alamat}</TableCell>
                      <TableCell className="text-xs text-right space-x-1">
                        <Button onClick={() => openEditCust(p)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit2 size={14} />
                        </Button>
                        <Button onClick={() => { if(confirm(`Hapus pelanggan ${p.nama_perusahaan}?`)) mutateCustDelete.mutate({ id: p.id, name: p.nama_perusahaan }); }} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-foreground">Tidak ada pelanggan terdaftar.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                        <Button onClick={() => { if(confirm(`Hapus lokasi loading ${l.nama_lokasi}?`)) mutateLoadDelete.mutate({ id: l.id, name: l.nama_lokasi }); }} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
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
                        <Button onClick={() => { if(confirm(`Hapus lokasi dumping ${d.nama_lokasi}?`)) mutateDumpDelete.mutate({ id: d.id, name: d.nama_lokasi }); }} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
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

      {/* 1a. Customer Form Dialog */}
      <Dialog open={isCustOpen} onOpenChange={setIsCustOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">{editCust ? "Ubah Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
            <DialogDescription className="text-xs">Input berkas profil kontraktor tambang.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCustSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Nama Perusahaan</label>
              <Input placeholder="PT Vale Indonesia" value={namaPerusahaan} onChange={(e) => setNamaPerusahaan(e.target.value)} className="text-xs h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">PIC</label>
                <Input placeholder="Bambang Triyono" value={pic} onChange={(e) => setPic(e.target.value)} className="text-xs h-9" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nomor HP PIC</label>
                <Input placeholder="0811xxxxxxxx" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} className="text-xs h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Alamat Kantor</label>
              <Input placeholder="Sorowako, Luwu Timur" value={alamat} onChange={(e) => setAlamat(e.target.value)} className="text-xs h-9" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCustOpen(false)} className="text-xs h-9">Batal</Button>
              <Button type="submit" disabled={mutateCustCreate.isPending || mutateCustUpdate.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">Simpan</Button>
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
    </div>
  );
}
