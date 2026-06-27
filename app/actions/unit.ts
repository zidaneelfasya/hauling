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
    throw new Error("Forbidden: Action requires management permissions");
  }
  return user.id;
}

export async function getUnits() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unit")
    .select(`
      *,
      kontrak_hauling (
        id,
        kode_kontrak,
        perusahaan
      )
    `)
    .order("kode_unit", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createUnit(formData: {
  kode_unit: string;
  nomor_polisi: string;
  merk: string;
  tipe: string;
  tahun: number;
  kapasitas_ton: number;
  status: "Aktif" | "Maintenance" | "Rusak" | "Nonaktif";
  kontrak_hauling_id?: string | null;
  biaya_sewa: number;
  durasi_sewa_bulan: number;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  
  const insertData = {
    ...formData,
    kontrak_hauling_id: formData.kontrak_hauling_id || null,
  };

  const { data, error } = await supabase
    .from("unit")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Menambahkan Unit Baru: ${formData.kode_unit}`, formData);
  revalidatePath("/dashboard/units");
  return data;
}

export async function updateUnit(
  id: string,
  formData: {
    kode_unit: string;
    nomor_polisi: string;
    merk: string;
    tipe: string;
    tahun: number;
    kapasitas_ton: number;
    status: "Aktif" | "Maintenance" | "Rusak" | "Nonaktif";
    kontrak_hauling_id?: string | null;
    biaya_sewa: number;
    durasi_sewa_bulan: number;
  }
) {
  await verifyManagerRole();
  const supabase = await createClient();
  
  const updateData = {
    ...formData,
    kontrak_hauling_id: formData.kontrak_hauling_id || null,
  };

  const { data, error } = await supabase
    .from("unit")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Mengubah Unit: ${formData.kode_unit}`, formData);
  revalidatePath("/dashboard/units");
  return data;
}

export async function deleteUnit(id: string, kode_unit: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Deletes are only allowed for Owner, Full Access, Admin (excluding Supervisor)
  if (!profile || !["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Deleting units requires higher administration credentials");
  }

  const { error } = await supabase.from("unit").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Unit: ${kode_unit}`, { id });
  revalidatePath("/dashboard/units");
  return true;
}
