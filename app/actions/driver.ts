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

export async function getDrivers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("driver")
    .select(`
      *,
      kontrak_hauling (
        id,
        kode_kontrak,
        perusahaan
      ),
      profiles (
        id,
        nama,
        role
      )
    `)
    .order("nama", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createDriver(formData: {
  nama: string;
  nik: string;
  nomor_hp: string;
  alamat: string;
  nomor_sim: string;
  masa_berlaku_sim: string;
  tanggal_masuk: string;
  status: "Aktif" | "Nonaktif";
  profile_id?: string | null;
  kontrak_hauling_id?: string | null;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  
  const insertData = {
    ...formData,
    profile_id: formData.profile_id || null,
    kontrak_hauling_id: formData.kontrak_hauling_id || null,
  };

  const { data, error } = await supabase
    .from("driver")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Menambahkan Driver Baru: ${formData.nama}`, formData);
  revalidatePath("/dashboard/drivers");
  return data;
}

export async function updateDriver(
  id: string,
  formData: {
    nama: string;
    nik: string;
    nomor_hp: string;
    alamat: string;
    nomor_sim: string;
    masa_berlaku_sim: string;
    tanggal_masuk: string;
    status: "Aktif" | "Nonaktif";
    profile_id?: string | null;
    kontrak_hauling_id?: string | null;
  }
) {
  await verifyManagerRole();
  const supabase = await createClient();
  
  const updateData = {
    ...formData,
    profile_id: formData.profile_id || null,
    kontrak_hauling_id: formData.kontrak_hauling_id || null,
  };

  const { data, error } = await supabase
    .from("driver")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Mengubah Driver: ${formData.nama}`, formData);
  revalidatePath("/dashboard/drivers");
  return data;
}

export async function deleteDriver(id: string, nama: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Deleting drivers requires administrator privileges");
  }

  const { error } = await supabase.from("driver").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Driver: ${nama}`, { id });
  revalidatePath("/dashboard/drivers");
  return true;
}

export async function getUnlinkedProfiles() {
  const supabase = await createClient();
  
  // We want to fetch all profiles with role = 'Driver' that are NOT linked to any driver record yet.
  const { data: drivers, error: driverErr } = await supabase
    .from("driver")
    .select("profile_id")
    .is("profile_id", "not.null");
  
  if (driverErr) throw driverErr;
  
  const linkedProfileIds = drivers.map(d => d.profile_id).filter(Boolean);

  let query = supabase
    .from("profiles")
    .select("id, nama, role")
    .eq("role", "Driver");
    
  if (linkedProfileIds.length > 0) {
    query = query.not("id", "in", `(${linkedProfileIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
