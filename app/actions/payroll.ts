"use server";

import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import { revalidatePath } from "next/cache";

async function getUserInfo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, nama")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  let driverRecord = null;
  if (profile.role === "Driver") {
    const { data: driver } = await supabase
      .from("driver")
      .select("id")
      .eq("profile_id", user.id)
      .single();
    driverRecord = driver;
  }

  return { user, profile, driverRecord };
}

async function verifyManagerRole() {
  const { profile } = await getUserInfo();
  if (!["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Tindakan memerlukan hak akses manajemen");
  }
}

export async function getPayroll() {
  const supabase = await createClient();
  const { profile, driverRecord } = await getUserInfo();

  let query = supabase
    .from("payroll")
    .select(`
      *,
      driver (id, nama, nik)
    `)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (profile.role === "Driver") {
    if (!driverRecord) return [];
    query = query.eq("driver_id", driverRecord.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function calculateDriverIncentive(driverId: string, bulan: number, tahun: number) {
  await verifyManagerRole();
  const supabase = await createClient();

  const { data: ritaseList, error } = await supabase
    .from("ritase")
    .select("total_pendapatan, tanggal")
    .eq("driver_id", driverId)
    .eq("status", "Approved");

  if (error) throw error;

  const filtered = ritaseList.filter(item => {
    const parts = item.tanggal.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return y === tahun && m === bulan;
  });

  const totalIncentive = filtered.reduce((sum, item) => sum + Number(item.total_pendapatan), 0);
  return totalIncentive;
}

export async function createPayroll(formData: {
  driver_id: string;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  insentif_ritase: number;
  bonus: number;
  potongan: number;
  status: "Draft" | "Paid";
}) {
  await verifyManagerRole();
  const supabase = await createClient();

  const total_gaji = Number(formData.gaji_pokok) + Number(formData.insentif_ritase) + Number(formData.bonus) - Number(formData.potongan);

  const insertData = {
    ...formData,
    total_gaji,
  };

  const { data, error } = await supabase
    .from("payroll")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Membuat Payroll Driver ID ${formData.driver_id} Periode ${formData.bulan}/${formData.tahun}: Gaji Rp${total_gaji.toLocaleString()}`, insertData);
  revalidatePath("/protected/payroll");
  return data;
}

export async function updatePayroll(
  id: string,
  formData: {
    driver_id: string;
    bulan: number;
    tahun: number;
    gaji_pokok: number;
    insentif_ritase: number;
    bonus: number;
    potongan: number;
    status: "Draft" | "Paid";
  }
) {
  await verifyManagerRole();
  const supabase = await createClient();

  const total_gaji = Number(formData.gaji_pokok) + Number(formData.insentif_ritase) + Number(formData.bonus) - Number(formData.potongan);

  const updateData = {
    ...formData,
    total_gaji,
  };

  const { data, error } = await supabase
    .from("payroll")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mengubah Payroll ID ${id}: Total Gaji Rp${total_gaji.toLocaleString()}`, updateData);
  revalidatePath("/protected/payroll");
  return data;
}

export async function deletePayroll(id: string) {
  await verifyManagerRole();
  const supabase = await createClient();

  const { error } = await supabase.from("payroll").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog(`Menghapus Payroll ID ${id}`);
  revalidatePath("/protected/payroll");
  return true;
}
