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
    throw new Error("Forbidden: Action requires management permissions");
  }
  return user.id;
}

// =============================================================
// KONTRAK HAULING (Hauling Contracts)
// =============================================================
export async function getKontrakHauling() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kontrak_hauling")
    .select("*")
    .order("kode_kontrak", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createKontrakHauling(formData: {
  kode_kontrak: string;
  perusahaan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_unit: number;
  status: string;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kontrak_hauling")
    .insert(formData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Kode kontrak "${formData.kode_kontrak}" sudah digunakan. Silakan gunakan kode kontrak lain.`);
    }
    throw error;
  }
  await writeAuditLog(`Menambahkan Kontrak Hauling baru: ${formData.kode_kontrak}`, formData);
  revalidatePath("/dashboard/master");
  return data;
}

export async function updateKontrakHauling(id: string, formData: {
  kode_kontrak: string;
  perusahaan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_unit: number;
  status: string;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kontrak_hauling")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Kode kontrak "${formData.kode_kontrak}" sudah digunakan. Silakan gunakan kode kontrak lain.`);
    }
    throw error;
  }
  await writeAuditLog(`Mengubah data Kontrak Hauling: ${formData.kode_kontrak}`, formData);
  revalidatePath("/dashboard/master");
  return data;
}

export async function deleteKontrakHauling(id: string, name: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { error } = await supabase.from("kontrak_hauling").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Kontrak Hauling: ${name}`, { id });
  revalidatePath("/dashboard/master");
  return true;
}

// =============================================================
// LOKASI LOADING
// =============================================================
export async function getLokasiLoading() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lokasi_loading")
    .select("*")
    .order("nama_lokasi", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createLokasiLoading(nama_lokasi: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lokasi_loading")
    .insert({ nama_lokasi })
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Menambahkan Lokasi Loading baru: ${nama_lokasi}`, { nama_lokasi });
  revalidatePath("/dashboard/master");
  return data;
}

export async function updateLokasiLoading(id: string, nama_lokasi: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lokasi_loading")
    .update({ nama_lokasi })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Mengubah Lokasi Loading: ${nama_lokasi}`, { id, nama_lokasi });
  revalidatePath("/dashboard/master");
  return data;
}

export async function deleteLokasiLoading(id: string, name: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { error } = await supabase.from("lokasi_loading").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Lokasi Loading: ${name}`, { id });
  revalidatePath("/dashboard/master");
  return true;
}

// =============================================================
// LOKASI DUMPING
// =============================================================
export async function getLokasiDumping() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lokasi_dumping")
    .select("*")
    .order("nama_lokasi", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createLokasiDumping(nama_lokasi: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lokasi_dumping")
    .insert({ nama_lokasi })
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Menambahkan Lokasi Dumping baru: ${nama_lokasi}`, { nama_lokasi });
  revalidatePath("/dashboard/master");
  return data;
}

export async function updateLokasiDumping(id: string, nama_lokasi: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lokasi_dumping")
    .update({ nama_lokasi })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Mengubah Lokasi Dumping: ${nama_lokasi}`, { id, nama_lokasi });
  revalidatePath("/dashboard/master");
  return data;
}

export async function deleteLokasiDumping(id: string, name: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { error } = await supabase.from("lokasi_dumping").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Lokasi Dumping: ${name}`, { id });
  revalidatePath("/dashboard/master");
  return true;
}

export async function getContractKpis(contractId: string) {
  const supabase = await createClient();

  // 1. Fetch Contract details
  const { data: contract, error: contractErr } = await supabase
    .from("kontrak_hauling")
    .select("*")
    .eq("id", contractId)
    .single();

  if (contractErr || !contract) {
    throw new Error("Contract not found");
  }

  // 2. Fetch assigned units
  const { data: units, error: unitsErr } = await supabase
    .from("unit")
    .select("id, kode_unit, biaya_sewa, durasi_sewa_bulan")
    .eq("kontrak_hauling_id", contractId);

  if (unitsErr) throw unitsErr;

  // 3. Fetch assigned drivers
  const { data: drivers, error: driversErr } = await supabase
    .from("driver")
    .select("id, nama")
    .eq("kontrak_hauling_id", contractId);

  if (driversErr) throw driversErr;

  const unitIds = units ? units.map((u: any) => u.id) : [];
  const driverIds = drivers ? drivers.map((d: any) => d.id) : [];

  // 4. Fetch payrolls for assigned drivers
  let payrolls: any[] = [];
  if (driverIds.length > 0) {
    const { data, error } = await supabase
      .from("payroll")
      .select("id, driver_id, bulan, tahun, total_gaji, created_at, status")
      .in("driver_id", driverIds);
    if (error) throw error;
    payrolls = data || [];
  }

  // 5. Fetch BBM logs for assigned units
  let bbmLogs: any[] = [];
  if (unitIds.length > 0) {
    const { data, error } = await supabase
      .from("bbm")
      .select("id, unit_id, tanggal, liter, total_biaya")
      .in("unit_id", unitIds);
    if (error) throw error;
    bbmLogs = data || [];
  }

  // 6. Fetch Maintenance logs for assigned units
  let maintLogs: any[] = [];
  if (unitIds.length > 0) {
    const { data, error } = await supabase
      .from("maintenance")
      .select("id, unit_id, tanggal, biaya, jenis_maintenance, status")
      .in("unit_id", unitIds);
    if (error) throw error;
    maintLogs = data || [];
  }

  // Calculations
  const start = new Date(contract.tanggal_mulai);
  const end = new Date(contract.tanggal_selesai);
  const anchor = new Date("2026-06-25"); // Evaluate up to evaluation date anchor

  const evalDate = anchor < end ? anchor : end;

  const elapsedMonths = Math.max(
    1,
    (evalDate.getFullYear() - start.getFullYear()) * 12 + (evalDate.getMonth() - start.getMonth()) + 1
  );

  // A. Unit Rental Costs Calculation
  let actualRentalCost = 0;
  let projectedRentalCost = 0;
  const rentalDetails: any[] = [];

  if (units && units.length > 0) {
    units.forEach((unit: any) => {
      const monthlyRental = Number(unit.biaya_sewa || 0) / Math.max(1, Number(unit.durasi_sewa_bulan || 1));
      const actualUnitCost = monthlyRental * elapsedMonths;
      actualRentalCost += actualUnitCost;
      projectedRentalCost += monthlyRental * 12;

      for (let m = 0; m < elapsedMonths; m++) {
        const itemDate = new Date(start.getTime());
        itemDate.setMonth(start.getMonth() + m);
        const monthLabel = itemDate.toLocaleString("id-ID", { month: "long", year: "numeric" });
        const dateString = itemDate.toISOString().substring(0, 10);
        rentalDetails.push({
          id: `rental-${unit.id}-${m}`,
          tanggal: dateString,
          kategori: "Sewa Unit",
          deskripsi: `Sewa Unit ${unit.kode_unit} - ${monthLabel}`,
          jumlah: monthlyRental,
        });
      }
    });
  }

  // B. Driver Payroll Costs Calculation
  const actualPayrollCost = payrolls.reduce((sum, p) => sum + Number(p.total_gaji || 0), 0);
  const projectedPayrollCost = (actualPayrollCost / elapsedMonths) * 12;

  const payrollDetails = payrolls.map((p: any) => {
    const driverName = drivers?.find((d: any) => d.id === p.driver_id)?.nama || "Driver";
    const monthLabel = new Date(p.tahun, p.bulan - 1, 28).toLocaleString("id-ID", { month: "long", year: "numeric" });
    return {
      id: `payroll-${p.id}`,
      tanggal: `${p.tahun}-${String(p.bulan).padStart(2, "0")}-28`,
      kategori: "Gaji Driver",
      deskripsi: `Gaji Driver ${driverName} - ${monthLabel} (${p.status})`,
      jumlah: Number(p.total_gaji || 0),
    };
  });

  // C. BBM Costs Calculation
  const actualBbmCost = bbmLogs.reduce((sum, b) => sum + Number(b.total_biaya || 0), 0);
  const projectedBbmCost = (actualBbmCost / elapsedMonths) * 12;

  const bbmDetails = bbmLogs.map((b: any) => {
    const unitCode = units?.find((u: any) => u.id === b.unit_id)?.kode_unit || "DT";
    return {
      id: `bbm-${b.id}`,
      tanggal: b.tanggal,
      kategori: "Bahan Bakar",
      deskripsi: `BBM Solar Unit ${unitCode} (${b.liter} L)`,
      jumlah: Number(b.total_biaya || 0),
    };
  });

  // D. Maintenance Costs Calculation
  const actualMaintCost = maintLogs.reduce((sum, m) => sum + Number(m.biaya || 0), 0);
  const projectedMaintCost = (actualMaintCost / elapsedMonths) * 12;

  const maintDetails = maintLogs.map((m: any) => {
    const unitCode = units?.find((u: any) => u.id === m.unit_id)?.kode_unit || "DT";
    return {
      id: `maint-${m.id}`,
      tanggal: m.tanggal,
      kategori: "Perawatan",
      deskripsi: `${m.jenis_maintenance} Unit ${unitCode} (${m.status})`,
      jumlah: Number(m.biaya || 0),
    };
  });

  // E. Summaries
  const totalActualExpenditure = actualRentalCost + actualPayrollCost + actualBbmCost + actualMaintCost;
  const totalProjectedExpenditure = projectedRentalCost + projectedPayrollCost + projectedBbmCost + projectedMaintCost;
  const estimatedProfit = Number(contract.nilai_kontrak || 0) - totalProjectedExpenditure;

  const isWithinBudget = totalProjectedExpenditure <= Number(contract.budget_operasional || 0);

  const allExpenditures = [
    ...rentalDetails,
    ...payrollDetails,
    ...bbmDetails,
    ...maintDetails,
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return {
    contract,
    unitsCount: units?.length || 0,
    driversCount: drivers?.length || 0,
    elapsedMonths,
    actuals: {
      rental: actualRentalCost,
      payroll: actualPayrollCost,
      bbm: actualBbmCost,
      maint: actualMaintCost,
      total: totalActualExpenditure,
    },
    projected: {
      rental: projectedRentalCost,
      payroll: projectedPayrollCost,
      bbm: projectedBbmCost,
      maint: projectedMaintCost,
      total: totalProjectedExpenditure,
    },
    estimatedProfit,
    isWithinBudget,
    allExpenditures,
  };
}

