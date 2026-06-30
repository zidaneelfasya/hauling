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

  if (!profile || !["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Tindakan memerlukan hak akses manajemen");
  }
  return user.id;
}

export async function getTransactionsData() {
  const supabase = await createClient();

  // 1. Fetch all cash flow logs joined with contracts
  const { data: cashFlows, error: cashErr } = await supabase
    .from("cash_flow")
    .select(`
      *,
      kontrak_hauling (id, kode_kontrak, perusahaan)
    `)
    .order("tanggal", { ascending: false });
  if (cashErr) throw cashErr;

  // 2. Fetch all contracts for dropdown filters and selectors
  const { data: contracts, error: contractErr } = await supabase
    .from("kontrak_hauling")
    .select("id, kode_kontrak, perusahaan")
    .order("kode_kontrak", { ascending: true });
  if (contractErr) throw contractErr;

  // 3. Fetch all time balance
  const { data: balanceData, error: balanceErr } = await supabase
    .from("cash_flow")
    .select("jenis, nominal");
  if (balanceErr) throw balanceErr;

  let totalRunningBalance = 0;
  balanceData?.forEach((cf) => {
    if (cf.jenis === "Pemasukan") {
      totalRunningBalance += Number(cf.nominal || 0);
    } else {
      totalRunningBalance -= Number(cf.nominal || 0);
    }
  });

  return {
    cashFlows: cashFlows || [],
    contracts: contracts || [],
    totalRunningBalance,
  };
}

export async function createCashFlow(formData: {
  tanggal: string;
  jenis: "Pemasukan" | "Pengeluaran";
  kategori: string;
  nominal: number;
  keterangan?: string;
  kontrak_hauling_id?: string | null;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  const insertData = {
    tanggal: formData.tanggal,
    jenis: formData.jenis,
    kategori: formData.kategori,
    nominal: formData.nominal,
    keterangan: formData.keterangan || null,
    kontrak_hauling_id: formData.kontrak_hauling_id || null,
    source_type: "Manual",
    source_id: null,
  };

  const { data, error } = await supabase
    .from("cash_flow")
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;

  await writeAuditLog(
    `Mencatat Cash Flow Manual: [${formData.jenis}] Kategori ${formData.kategori}, Nominal Rp${formData.nominal.toLocaleString()}`,
    insertData
  );

  revalidatePath("/dashboard/financial");
  return data;
}

export async function updateCashFlow(
  id: string,
  formData: {
    tanggal: string;
    jenis: "Pemasukan" | "Pengeluaran";
    kategori: string;
    nominal: number;
    keterangan?: string;
    kontrak_hauling_id?: string | null;
  }
) {
  await verifyManagerRole();
  const supabase = await createClient();

  // Make sure it's a manual entry before updating
  const { data: existing, error: fetchError } = await supabase
    .from("cash_flow")
    .select("source_type")
    .eq("id", id)
    .single();

  if (fetchError || !existing) throw new Error("Data Cash Flow tidak ditemukan");
  if (existing.source_type !== "Manual") {
    throw new Error("Forbidden: Hanya data cash flow Manual yang dapat diedit langsung");
  }

  const updateData = {
    tanggal: formData.tanggal,
    jenis: formData.jenis,
    kategori: formData.kategori,
    nominal: formData.nominal,
    keterangan: formData.keterangan || null,
    kontrak_hauling_id: formData.kontrak_hauling_id || null,
  };

  const { data, error } = await supabase
    .from("cash_flow")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  await writeAuditLog(
    `Mengubah Cash Flow Manual ID ${id}: [${formData.jenis}] Rp${formData.nominal.toLocaleString()}`,
    updateData
  );

  revalidatePath("/dashboard/financial");
  return data;
}

export async function deleteCashFlow(id: string) {
  await verifyManagerRole();
  const supabase = await createClient();

  // Make sure it's a manual entry before deleting
  const { data: existing, error: fetchError } = await supabase
    .from("cash_flow")
    .select("source_type")
    .eq("id", id)
    .single();

  if (fetchError || !existing) throw new Error("Data Cash Flow tidak ditemukan");
  if (existing.source_type !== "Manual") {
    throw new Error("Forbidden: Hanya data cash flow Manual yang dapat dihapus langsung");
  }

  const { error } = await supabase.from("cash_flow").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog(`Menghapus Cash Flow Manual ID ${id}`);
  revalidatePath("/dashboard/financial");
  return true;
}
