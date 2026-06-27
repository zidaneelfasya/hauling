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
  return { user, profile };
}

export async function getMaintenance() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance")
    .select(`
      *,
      unit (id, kode_unit, nomor_polisi),
      profiles:approved_by (id, nama)
    `)
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMaintenance(formData: {
  tanggal: string;
  unit_id: string;
  jenis_maintenance: string;
  deskripsi: string;
  biaya: number;
  vendor: string;
  kilometer: number;
  status: "Scheduled" | "In Progress" | "Completed";
}) {
  const { profile } = await getUserInfo();
  if (!["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Tindakan memerlukan hak akses manajemen");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance")
    .insert(formData)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mencatat Maintenance baru: Unit ${formData.unit_id}, Biaya Rp${Number(formData.biaya).toLocaleString()}`, formData);
  revalidatePath("/dashboard/maintenance");
  return data;
}

export async function updateMaintenance(
  id: string,
  formData: {
    tanggal: string;
    unit_id: string;
    jenis_maintenance: string;
    deskripsi: string;
    biaya: number;
    vendor: string;
    kilometer: number;
    status: "Scheduled" | "In Progress" | "Completed";
  }
) {
  const { profile } = await getUserInfo();
  if (!["Owner", "Full Access", "Admin", "Supervisor"].includes(profile.role)) {
    throw new Error("Forbidden: Tindakan memerlukan hak akses supervisor atau manajemen");
  }

  const supabase = await createClient();
  
  let updateData: any = { ...formData };
  if (profile.role === "Supervisor") {
    const { data: existing } = await supabase
      .from("maintenance")
      .select("*")
      .eq("id", id)
      .single();
    
    if (existing) {
      updateData = {
        ...existing,
        status: formData.status,
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
      };
    }
  }

  const { data, error } = await supabase
    .from("maintenance")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mengubah data Maintenance ID ${id}: Status ${formData.status}`, updateData);
  revalidatePath("/dashboard/maintenance");
  return data;
}

export async function deleteMaintenance(id: string) {
  const { profile } = await getUserInfo();
  if (!["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Tindakan memerlukan hak akses manajemen");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("maintenance").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog(`Menghapus Maintenance ID ${id}`);
  revalidatePath("/dashboard/maintenance");
  return true;
}
