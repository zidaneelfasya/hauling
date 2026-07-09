"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber,
  calculateInvoiceData
} from "@/app/actions/invoice";
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
import { Plus, Search, Edit2, Trash2, Loader2, Download, FileText, Filter } from "lucide-react";
import { jsPDF } from "jspdf";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [userProfile, setUserProfile] = useState<any>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteNomor, setDeleteNomor] = useState("");

  // Form Fields
  const [nomorInvoice, setNomorInvoice] = useState("");
  const [tanggalInvoice, setTanggalInvoice] = useState("");
  const [kontrakHaulingId, setKontrakHaulingId] = useState("");
  const [periode, setPeriode] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [totalRitase, setTotalRitase] = useState(0);
  const [grossTotal, setGrossTotal] = useState(0);
  const [potongan, setPotongan] = useState<string>("0");
  const [totalTagihan, setTotalTagihan] = useState<string>("0");
  const [status, setStatus] = useState<"Draft" | "Sent" | "Paid">("Draft");
  const [isCalculating, setIsCalculating] = useState(false);

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
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const { data: kontrakList = [] } = useQuery({
    queryKey: ["kontrak_hauling"],
    queryFn: getKontrakHauling,
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Sukses", description: "Invoice baru berhasil dibuat", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal membuat invoice", type: "error" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Sukses", description: "Invoice berhasil diperbarui", type: "success" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal memperbarui invoice", type: "error" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, nomor }: { id: string; nomor: string }) => deleteInvoice(id, nomor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Sukses", description: "Invoice berhasil dihapus", type: "success" });
    },
    onError: (err: any) => {
      toast({ title: "Gagal", description: err.message || "Gagal menghapus invoice", type: "error" });
    }
  });

  const openAddDialog = async () => {
    setEditInvoice(null);
    try {
      const nextNum = await getNextInvoiceNumber();
      setNomorInvoice(nextNum);
    } catch {
      setNomorInvoice(`INV/HMS/${new Date().getFullYear()}/0001`);
    }
    setTanggalInvoice(new Date().toISOString().substring(0, 10));
    setKontrakHaulingId(kontrakList[0]?.id || "");
    setPeriode("");
    setTanggalMulai("");
    setTanggalSelesai("");
    setTotalRitase(0);
    setGrossTotal(0);
    setPotongan("0");
    setTotalTagihan("0");
    setStatus("Draft");
    setIsOpen(true);
  };

  const openEditDialog = (inv: any) => {
    setEditInvoice(inv);
    setNomorInvoice(inv.nomor_invoice);
    setTanggalInvoice(inv.tanggal_invoice);
    setKontrakHaulingId(inv.kontrak_hauling_id);
    setPeriode(inv.periode);
    setTanggalMulai(inv.tanggal_mulai || "");
    setTanggalSelesai(inv.tanggal_selesai || "");
    setTotalRitase(inv.total_ritase || 0);
    setPotongan(String(inv.potongan || 0));
    setGrossTotal((Number(inv.total_tagihan) || 0) + (Number(inv.potongan) || 0));
    setTotalTagihan(String(inv.total_tagihan));
    setStatus(inv.status);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleCalculate = async () => {
    if (!kontrakHaulingId || !tanggalMulai || !tanggalSelesai) {
      toast({ title: "Peringatan", description: "Pilih kontrak, tanggal mulai, dan tanggal selesai terlebih dahulu.", type: "warning" });
      return;
    }
    
    setIsCalculating(true);
    try {
      const data = await calculateInvoiceData(kontrakHaulingId, tanggalMulai, tanggalSelesai);
      setTotalRitase(data.totalRitase);
      setGrossTotal(data.grossTotal);
      
      const p = Number(potongan) || 0;
      setTotalTagihan(String(data.grossTotal - p));
      
      // Auto-generate periode text
      const dateStart = new Date(tanggalMulai);
      const dateEnd = new Date(tanggalSelesai);
      const mStart = dateStart.toLocaleString('id-ID', { month: 'short' });
      const mEnd = dateEnd.toLocaleString('id-ID', { month: 'short' });
      const y = dateEnd.getFullYear();
      setPeriode(`${dateStart.getDate()} ${mStart} - ${dateEnd.getDate()} ${mEnd} ${y}`);
      
      toast({ title: "Berhasil", description: `Ditemukan ${data.totalRitase} ritase dengan total kotor Rp${data.grossTotal.toLocaleString('id-ID')}`, type: "success" });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message || "Gagal menghitung invoice", type: "error" });
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-update total tagihan when potongan changes
  useEffect(() => {
    const p = Number(potongan) || 0;
    setTotalTagihan(String(grossTotal - p));
  }, [potongan, grossTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorInvoice || !tanggalInvoice || !kontrakHaulingId || !periode || !tanggalMulai || !tanggalSelesai) {
      toast({ title: "Peringatan", description: "Semua kolom wajib diisi", type: "warning" });
      return;
    }

    const payload = {
      nomor_invoice: nomorInvoice,
      tanggal_invoice: tanggalInvoice,
      kontrak_hauling_id: kontrakHaulingId,
      periode,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      total_ritase: totalRitase,
      potongan: Number(potongan) || 0,
      total_tagihan: Number(totalTagihan) || 0,
      status,
    };

    if (editInvoice) {
      updateMutation.mutate({ id: editInvoice.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, nomor: string) => {
    setDeleteId(id);
    setDeleteNomor(nomor);
  };

  // PDF Generation Function
  const handleGeneratePDF = (inv: any) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Styling parameters
      const leftMargin = 20;
      const rightMargin = 190;
      let y = 20;

      // Title & Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22); // Orange Accent
      doc.text("HAULING MANAGEMENT SYSTEM", leftMargin, y);
      
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Muted slate color
      doc.text("Kawasan Tambang Nikel Pomalaa & Morowali, Indonesia", leftMargin, y);
      
      // Divider
      y += 10;
      doc.setDrawColor(214, 219, 225);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, y, rightMargin, y);

      // Invoice metadata
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text("FAKTUR INVOICE", leftMargin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`No. Invoice: ${inv.nomor_invoice}`, rightMargin - 60, y);

      y += 6;
      doc.text(`Tanggal: ${inv.tanggal_invoice}`, rightMargin - 60, y);
      doc.text(`Periode: ${inv.periode}`, leftMargin, y);

      // Customer Details card
      y += 12;
      doc.setFillColor(248, 250, 252); // Light background
      doc.rect(leftMargin, y, 170, 32, "F");
      doc.rect(leftMargin, y, 170, 32, "S");

      doc.setFont("helvetica", "bold");
      doc.text("DITAGIHKAN KEPADA (CUSTOMER):", leftMargin + 5, y + 6);
      doc.setFont("helvetica", "normal");
      doc.text(`Perusahaan: ${inv.kontrak_hauling?.perusahaan}`, leftMargin + 5, y + 12);
      doc.text(`Kode Kontrak: ${inv.kontrak_hauling?.kode_kontrak}`, leftMargin + 5, y + 18);
      doc.text(`Periode Kontrak: ${inv.kontrak_hauling?.tanggal_mulai} s.d. ${inv.kontrak_hauling?.tanggal_selesai}`, leftMargin + 5, y + 24);

      // Billing Item Table headers
      y += 45;
      doc.setFillColor(30, 41, 59); // Slate table header
      doc.rect(leftMargin, y, 170, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Deskripsi Layanan Jasa", leftMargin + 4, y + 7);
      doc.text("Total Tagihan (IDR)", rightMargin - 40, y + 7);

      // Billing Item Row
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.rect(leftMargin, y, 170, 35, "S");
      
      doc.text(`Jasa Angkutan Hauling Material Bijih Nikel`, leftMargin + 4, y + 8);
      doc.text(`Periode: ${inv.periode}`, leftMargin + 4, y + 14);
      doc.text(`Total Ritase: ${inv.total_ritase || 0} Rit`, leftMargin + 4, y + 20);

      // Gross Amount
      const gross = (Number(inv.total_tagihan) || 0) + (Number(inv.potongan) || 0);
      doc.text(`Subtotal:`, rightMargin - 60, y + 14);
      doc.text(`Rp ${gross.toLocaleString("id-ID")}`, rightMargin - 40, y + 14);
      
      // Deduction
      if (Number(inv.potongan) > 0) {
        doc.text(`Potongan:`, rightMargin - 60, y + 20);
        doc.setTextColor(220, 38, 38); // Red for deduction
        doc.text(`- Rp ${Number(inv.potongan).toLocaleString("id-ID")}`, rightMargin - 40, y + 20);
      }

      doc.setDrawColor(214, 219, 225);
      doc.line(leftMargin + 2, y + 25, rightMargin - 2, y + 25);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`TOTAL KESELURUHAN:`, leftMargin + 4, y + 31);
      doc.text(`Rp ${Number(inv.total_tagihan).toLocaleString("id-ID")}`, rightMargin - 40, y + 31);
      
      y += 20;

      // Bottom Watermark for Status
      y += 30;
      doc.setFontSize(16);
      if (inv.status === "Paid") {
        doc.setTextColor(16, 185, 129); // Green Paid stamp
        doc.rect(leftMargin, y, 40, 12, "S");
        doc.text("LUNAS / PAID", leftMargin + 5, y + 8);
      } else {
        doc.setTextColor(249, 115, 22); // Orange Draft/Sent
        doc.rect(leftMargin, y, 40, 12, "S");
        doc.text("TERUTANG", leftMargin + 4, y + 8);
      }

      // Signatures
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Dibuat Oleh,", rightMargin - 50, y);
      doc.line(rightMargin - 50, y + 20, rightMargin - 10, y + 20);
      doc.text("Finance & Operations HMS", rightMargin - 50, y + 24);

      // Save PDF
      doc.save(`Invoice-${inv.nomor_invoice.replace(/\//g, "-")}.pdf`);
      toast({ title: "Unduh Berhasil", description: "Berkas PDF Invoice siap dicetak", type: "success" });
    } catch (err: any) {
      toast({ title: "Gagal PDF", description: err.message || "Gagal mengexport PDF", type: "error" });
    }
  };

  const formatCurrency = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.nomor_invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.kontrak_hauling?.perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.kontrak_hauling?.kode_kontrak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.periode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

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
          <h1 className="text-2xl font-extrabold tracking-tight">Invoice Customer</h1>
          <p className="text-xs text-muted-foreground">Faktur penagihan jasa angkutan nikel kepada pelanggan</p>
        </div>
        {isManager && (
          <Button onClick={openAddDialog} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs">
            <Plus size={16} /> Buat Invoice
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor invoice, perusahaan pelanggan, periode..."
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
            <SelectTrigger className="w-[150px] text-xs h-9 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
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
                <TableHead className="text-xs">Nomor Invoice</TableHead>
                <TableHead className="text-xs">Tanggal</TableHead>
                <TableHead className="text-xs">Pelanggan</TableHead>
                <TableHead className="text-xs">Periode Penagihan</TableHead>
                <TableHead className="text-xs text-right">Total Tagihan</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-semibold text-orange-500">{inv.nomor_invoice}</TableCell>
                  <TableCell className="text-xs font-mono">{inv.tanggal_invoice}</TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold text-foreground">{inv.kontrak_hauling?.perusahaan}</div>
                    <div className="text-[10px] text-muted-foreground">Kontrak: {inv.kontrak_hauling?.kode_kontrak}</div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{inv.periode}</TableCell>
                  <TableCell className="text-xs text-right font-extrabold text-foreground">{formatCurrency(Number(inv.total_tagihan))}</TableCell>
                  <TableCell className="text-xs text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        inv.status === "Paid"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400"
                          : inv.status === "Sent"
                          ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400"
                          : "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => handleGeneratePDF(inv)} variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10" title="Export PDF">
                        <Download size={14} />
                      </Button>
                      {isManager && (
                        <>
                          <Button onClick={() => openEditDialog(inv)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <Edit2 size={14} />
                          </Button>
                          <Button onClick={() => handleDelete(inv.id, inv.nomor_invoice)} variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada invoice customer yang sesuai.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} dari {filteredInvoices.length} invoice
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
              {editInvoice ? `Ubah Faktur ${editInvoice.nomor_invoice}` : "Buat Faktur Invoice Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Menerbitkan invoice pembayaran hauling nickel bagi customer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Nomor Invoice</label>
                <Input
                  placeholder="INV/HMS/2026/0001"
                  value={nomorInvoice}
                  onChange={(e) => setNomorInvoice(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Faktur</label>
                <Input
                  type="date"
                  value={tanggalInvoice}
                  onChange={(e) => setTanggalInvoice(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Kontrak Hauling</label>
                <Select value={kontrakHaulingId} onValueChange={setKontrakHaulingId}>
                  <SelectTrigger className="text-xs h-9 bg-card">
                    <SelectValue placeholder="Pilih Kontrak" />
                  </SelectTrigger>
                  <SelectContent>
                    {kontrakList.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.kode_kontrak} - {k.perusahaan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Selesai</label>
                <Input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Periode Penagihan</label>
                <Input
                  placeholder="Juni 2026"
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="text-xs h-9"
                  readOnly
                />
              </div>
              <Button type="button" onClick={handleCalculate} disabled={isCalculating} className="h-9 text-xs bg-indigo-500 hover:bg-indigo-600 text-white w-full">
                {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hitung Otomatis"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Total Ritase</label>
                <Input
                  type="number"
                  value={totalRitase}
                  readOnly
                  className="text-xs h-9 bg-muted/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Subtotal Kotor (Rp)</label>
                <Input
                  type="text"
                  value={grossTotal.toLocaleString('id-ID')}
                  readOnly
                  className="text-xs h-9 bg-muted/50 font-mono"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Potongan (Rp)</label>
                <Input
                  type="number"
                  value={potongan}
                  onChange={(e) => setPotongan(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Total Tagihan Bersih (Rp)</label>
                <Input
                  type="text"
                  value={Number(totalTagihan).toLocaleString('id-ID')}
                  readOnly
                  className="text-xs h-9 bg-muted/50 font-bold font-mono text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Status Tagihan</label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="text-xs h-9 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft (Belum Dikirim)</SelectItem>
                  <SelectItem value="Sent">Sent (Sudah Dikirim)</SelectItem>
                  <SelectItem value="Paid">Paid (Lunas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="text-xs h-9">
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                {(createMutation.isPending || updateMutation.isPending) ? "Menerbitkan..." : "Simpan Invoice"}
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
            deleteMutation.mutate({ id: deleteId, nomor: deleteNomor });
            setDeleteId(null);
          }
        }}
        title="Hapus Invoice"
        description={`Apakah Anda yakin ingin menghapus invoice ${deleteNomor}? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
