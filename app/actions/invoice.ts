"use server";

import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import { revalidatePath } from "next/cache";

async function verifyManagerRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Owner", "Full Access", "Admin", "Supervisor"].includes(profile.role)) {
    throw new Error("Forbidden: Action requires management or supervisor permissions");
  }
  
  return profile.role;
}

export async function getInvoices() {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice")
    .select(`
      *,
      kontrak_hauling (id, kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai)
    `)
    .order("tanggal_invoice", { ascending: false });

  if (error) throw error;
  return data;
}

export async function calculateInvoiceData(kontrakHaulingId: string, startDate: string, endDate: string) {
  await verifyManagerRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ritase")
    .select("jumlah_ritase, tarif_per_ritase")
    .eq("kontrak_hauling_id", kontrakHaulingId)
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .eq("status", "Approved");

  if (error) throw error;

  let totalRitase = 0;
  let grossTotal = 0;

  data.forEach((rit) => {
    totalRitase += rit.jumlah_ritase;
    grossTotal += (rit.jumlah_ritase * Number(rit.tarif_per_ritase));
  });

  return { totalRitase, grossTotal };
}

export async function createInvoice(formData: {
  nomor_invoice: string;
  tanggal_invoice: string;
  kontrak_hauling_id: string;
  periode: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_ritase: number;
  potongan: number;
  total_tagihan: number;
  status: "Draft" | "Sent" | "Paid";
}) {
  const role = await verifyManagerRole();
  if (role === "Supervisor") {
    throw new Error("Forbidden: Supervisor tidak diperbolehkan membuat invoice.");
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoice")
    .insert(formData)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Membuat Invoice baru ${formData.nomor_invoice} untuk kontrak ID ${formData.kontrak_hauling_id}: Total Rp${Number(formData.total_tagihan).toLocaleString()}`, formData);
  revalidatePath("/dashboard/invoices");
  return data;
}

export async function updateInvoice(
  id: string,
  formData: {
    nomor_invoice: string;
    tanggal_invoice: string;
    kontrak_hauling_id: string;
    periode: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    total_ritase: number;
    potongan: number;
    total_tagihan: number;
    status: "Draft" | "Sent" | "Paid";
  }
) {
  const role = await verifyManagerRole();
  if (role === "Supervisor") {
    throw new Error("Forbidden: Supervisor tidak diperbolehkan mengubah invoice.");
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoice")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mengubah Invoice ID ${id}: Nomor ${formData.nomor_invoice}, Status ${formData.status}`, formData);
  revalidatePath("/dashboard/invoices");
  return data;
}

export async function deleteInvoice(id: string, nomor: string) {
  const role = await verifyManagerRole();
  if (role === "Supervisor") {
    throw new Error("Forbidden: Supervisor tidak diperbolehkan menghapus invoice.");
  }
  const supabase = await createClient();

  const { error } = await supabase.from("invoice").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog(`Menghapus Invoice: ${nomor}`, { id });
  revalidatePath("/dashboard/invoices");
  return true;
}

export async function getNextInvoiceNumber() {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  
  const { data, error } = await supabase
    .from("invoice")
    .select("nomor_invoice")
    .like("nomor_invoice", `INV/HMS/${year}/%`)
    .order("nomor_invoice", { ascending: false })
    .limit(1);
    
  if (error) return `INV/HMS/${year}/0001`;
  if (!data || data.length === 0) return `INV/HMS/${year}/0001`;
  
  const lastNum = data[0].nomor_invoice;
  const parts = lastNum.split("/");
  const seq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = String(seq + 1).padStart(4, "0");
  return `INV/HMS/${year}/${nextSeq}`;
}
