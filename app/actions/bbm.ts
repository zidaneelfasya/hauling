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

export async function getBBM() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bbm")
    .select(`
      *,
      unit (id, kode_unit, nomor_polisi)
    `)
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createBBM(formData: {
  tanggal: string;
  unit_id: string;
  liter: number;
  harga_per_liter: number;
  lokasi_pengisian: string;
}) {
  await verifyManagerRole();
  const supabase = await createClient();

  const total_biaya = Number(formData.liter) * Number(formData.harga_per_liter);

  const insertData = {
    ...formData,
    total_biaya,
  };

  const { data, error } = await supabase
    .from("bbm")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mencatat BBM baru: Unit ${formData.unit_id}, Total Biaya Rp${total_biaya.toLocaleString()}`, insertData);
  revalidatePath("/protected/bbm");
  return data;
}

export async function updateBBM(
  id: string,
  formData: {
    tanggal: string;
    unit_id: string;
    liter: number;
    harga_per_liter: number;
    lokasi_pengisian: string;
  }
) {
  await verifyManagerRole();
  const supabase = await createClient();

  const total_biaya = Number(formData.liter) * Number(formData.harga_per_liter);

  const updateData = {
    ...formData,
    total_biaya,
  };

  const { data, error } = await supabase
    .from("bbm")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mengubah BBM ID ${id}: Rp${total_biaya.toLocaleString()}`, updateData);
  revalidatePath("/protected/bbm");
  return data;
}

export async function deleteBBM(id: string) {
  await verifyManagerRole();
  const supabase = await createClient();

  const { error } = await supabase.from("bbm").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog(`Menghapus BBM ID ${id}`);
  revalidatePath("/protected/bbm");
  return true;
}
