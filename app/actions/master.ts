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
// PELANGGAN (Customers)
// =============================================================
export async function getPelanggan() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pelanggan")
    .select("*")
    .order("nama_perusahaan", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createPelanggan(formData: {
  nama_perusahaan: string;
  pic: string;
  nomor_hp: string;
  alamat: string;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pelanggan")
    .insert(formData)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Menambahkan Pelanggan baru: ${formData.nama_perusahaan}`, formData);
  revalidatePath("/protected/master");
  return data;
}

export async function updatePelanggan(id: string, formData: {
  nama_perusahaan: string;
  pic: string;
  nomor_hp: string;
  alamat: string;
}) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pelanggan")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  await writeAuditLog(`Mengubah data Pelanggan: ${formData.nama_perusahaan}`, formData);
  revalidatePath("/protected/master");
  return data;
}

export async function deletePelanggan(id: string, name: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { error } = await supabase.from("pelanggan").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Pelanggan: ${name}`, { id });
  revalidatePath("/protected/master");
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
  revalidatePath("/protected/master");
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
  revalidatePath("/protected/master");
  return data;
}

export async function deleteLokasiLoading(id: string, name: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { error } = await supabase.from("lokasi_loading").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Lokasi Loading: ${name}`, { id });
  revalidatePath("/protected/master");
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
  revalidatePath("/protected/master");
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
  revalidatePath("/protected/master");
  return data;
}

export async function deleteLokasiDumping(id: string, name: string) {
  await verifyManagerRole();
  const supabase = await createClient();
  const { error } = await supabase.from("lokasi_dumping").delete().eq("id", id);
  if (error) throw error;
  await writeAuditLog(`Menghapus Lokasi Dumping: ${name}`, { id });
  revalidatePath("/protected/master");
  return true;
}
