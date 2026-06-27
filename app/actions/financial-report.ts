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
export async function getCashFlow(startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase.from("cash_flow").select("*").order("tanggal", { ascending: false });
  if (startDate) {
    query = query.gte("tanggal", startDate);
  }
  if (endDate) {
    query = query.lte("tanggal", endDate);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export async function createCashFlow(formData: {
  tanggal: string;
  jenis: "Pemasukan" | "Pengeluaran";
  kategori: string;
  nominal: number;
  keterangan?: string;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  const insertData = {
    ...formData,
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
  revalidatePath("/dashboard/financial-report");
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
  const { data, error } = await supabase
    .from("cash_flow")
    .update(formData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  await writeAuditLog(
    `Mengubah Cash Flow Manual ID ${id}: [${formData.jenis}] Rp${formData.nominal.toLocaleString()}`,
    formData
  );
  revalidatePath("/dashboard/financial-report");
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
  revalidatePath("/dashboard/financial-report");
  return true;
}
export async function getFinancialReportData(startDate: string, endDate: string) {
  const supabase = await createClient();
  // 1. Fetch Approved Ritase within date range
  const { data: ritases, error: ritaseErr } = await supabase
    .from("ritase")
    .select("jumlah_ritase, tonase, tarif_per_ritase, biaya_bbm")
    .eq("status", "Approved")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  if (ritaseErr) throw ritaseErr;
  let totalRitaseCount = 0;
  let totalTonaseCount = 0;
  let revenue = 0;
  let fuelHpp = 0;
  let driverSalaryHpp = 0;
  ritases?.forEach((r) => {
    totalRitaseCount += Number(r.jumlah_ritase || 0);
    totalTonaseCount += Number(r.tonase || 0);
    revenue += Number(r.jumlah_ritase || 0) * Number(r.tarif_per_ritase || 0);
    fuelHpp += Number(r.biaya_bbm || 0);
    driverSalaryHpp += Number(r.jumlah_ritase || 0) * 50000; // Default rate per ritase for driver
  });
  // 2. Fetch Completed Maintenance within date range
  const { data: maintenances, error: maintErr } = await supabase
    .from("maintenance")
    .select("biaya")
    .eq("status", "Completed")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  if (maintErr) throw maintErr;
  let maintenanceHpp = 0;
  maintenances?.forEach((m) => {
    maintenanceHpp += Number(m.biaya || 0);
  });
  const totalHpp = fuelHpp + driverSalaryHpp + maintenanceHpp;
  const { data: cashFlows, error: cashErr } = await supabase
    .from("cash_flow")
    .select("*")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: false });
  if (cashErr) throw cashErr;
  let cashIn = 0;
  let cashOut = 0;
  cashFlows?.forEach((cf) => {
    if (cf.jenis === "Pemasukan") {
      cashIn += Number(cf.nominal || 0);
    } else {
      cashOut += Number(cf.nominal || 0);
    }
  });
  const netCashFlow = cashIn - cashOut;
  // 4. Fetch Other Operational Expenses (Indirect Costs)
  const { data: operations, error: opErr } = await supabase
    .from("pengeluaran_operasional")
    .select("nominal")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);
  if (opErr) throw opErr;
  let indirectExpenses = 0;
  operations?.forEach((op) => {
    indirectExpenses += Number(op.nominal || 0);
  });
  const grossProfit = revenue - (fuelHpp + driverSalaryHpp); // Revenue - Direct Ritase Costs
  const netProfit = grossProfit - maintenanceHpp - indirectExpenses; // Gross - Maintenance - Office/Indirect ops
  return {
    revenueBlock: {
      totalRitase: totalRitaseCount,
      totalTonase: totalTonaseCount,
      revenue,
    },
    hppBlock: {
      fuelHpp,
      driverSalaryHpp,
      maintenanceHpp,
      totalHpp,
    },
    cashFlowBlock: {
      cashIn,
      cashOut,
      netCashFlow,
      transactions: cashFlows || [],
    },
    profitBlock: {
      grossProfit,
      netProfit,
    },
  };
}
