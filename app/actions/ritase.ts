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

export async function getRitase() {
  const supabase = await createClient();
  const { profile, driverRecord } = await getUserInfo();

  let query = supabase
    .from("ritase")
    .select(`
      *,
      unit (id, kode_unit, nomor_polisi),
      driver (id, nama, nik),
      lokasi_loading (id, nama_lokasi),
      lokasi_dumping (id, nama_lokasi),
      profiles:approved_by (id, nama)
    `)
    .order("tanggal", { ascending: false });

  if (profile.role === "Driver") {
    if (!driverRecord) {
      return [];
    }
    query = query.eq("driver_id", driverRecord.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createRitase(formData: {
  tanggal: string;
  unit_id: string;
  driver_id: string;
  lokasi_loading_id: string;
  lokasi_dumping_id: string;
  jumlah_ritase: number;
  tonase: number;
  tarif_per_ritase: number;
  status?: "Draft" | "Approved" | "Rejected";
}) {
  const { profile, driverRecord } = await getUserInfo();
  const supabase = await createClient();

  let finalDriverId = formData.driver_id;
  let finalStatus = formData.status || "Draft";

  if (profile.role === "Driver") {
    if (!driverRecord) throw new Error("Profile Driver anda belum ditautkan ke master data Driver");
    finalDriverId = driverRecord.id;
    finalStatus = "Draft";
  }

  const total_pendapatan = Number(formData.jumlah_ritase) * Number(formData.tarif_per_ritase);

  const insertData = {
    ...formData,
    driver_id: finalDriverId,
    status: finalStatus,
    total_pendapatan,
  };

  const { data, error } = await supabase
    .from("ritase")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mencatat Ritase baru: Unit ${formData.unit_id}, Total Pendapatan Rp${total_pendapatan.toLocaleString()}`, insertData);
  revalidatePath("/protected/ritase");
  return data;
}

export async function updateRitase(
  id: string,
  formData: {
    tanggal: string;
    unit_id: string;
    driver_id: string;
    lokasi_loading_id: string;
    lokasi_dumping_id: string;
    jumlah_ritase: number;
    tonase: number;
    tarif_per_ritase: number;
    status?: "Draft" | "Approved" | "Rejected";
  }
) {
  const { profile, driverRecord } = await getUserInfo();
  const supabase = await createClient();

  const { data: existing, error: getErr } = await supabase
    .from("ritase")
    .select("*")
    .eq("id", id)
    .single();

  if (getErr || !existing) throw new Error("Data Ritase tidak ditemukan");

  if (profile.role === "Driver") {
    if (existing.status !== "Draft") {
      throw new Error("Forbidden: Driver hanya dapat mengubah ritase berstatus Draft.");
    }
    if (driverRecord?.id !== existing.driver_id) {
      throw new Error("Forbidden: Driver hanya dapat mengubah ritase miliknya sendiri.");
    }
  }

  const total_pendapatan = Number(formData.jumlah_ritase) * Number(formData.tarif_per_ritase);

  const updateData: any = {
    ...formData,
    total_pendapatan,
  };

  if (profile.role === "Driver") {
    if (!driverRecord) {
      throw new Error("Profil Driver Anda belum terhubung ke master data Driver");
    }
    updateData.status = "Draft";
    updateData.driver_id = driverRecord.id;
  }

  const { data, error } = await supabase
    .from("ritase")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Mengubah Ritase ID ${id}: Rp${total_pendapatan.toLocaleString()}`, updateData);
  revalidatePath("/protected/ritase");
  return data;
}

export async function deleteRitase(id: string) {
  const { profile } = await getUserInfo();
  const supabase = await createClient();

  if (!["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Hanya Admin yang dapat menghapus data ritase.");
  }

  const { error } = await supabase.from("ritase").delete().eq("id", id);
  if (error) throw error;

  await writeAuditLog(`Menghapus Ritase ID ${id}`);
  revalidatePath("/protected/ritase");
  return true;
}

export async function approveRitase(id: string) {
  const { profile } = await getUserInfo();
  const supabase = await createClient();

  if (!["Owner", "Full Access", "Admin", "Supervisor"].includes(profile.role)) {
    throw new Error("Forbidden: Hak akses tidak mencukupi untuk menyetujui ritase.");
  }

  const { data, error } = await supabase
    .from("ritase")
    .update({
      status: "Approved",
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      rejected_reason: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Menyetujui (Approve) Ritase ID ${id}`, data);
  revalidatePath("/protected/ritase");
  return data;
}

export async function rejectRitase(id: string, reason: string) {
  const { profile } = await getUserInfo();
  const supabase = await createClient();

  if (!["Owner", "Full Access", "Admin", "Supervisor"].includes(profile.role)) {
    throw new Error("Forbidden: Hak akses tidak mencukupi untuk menolak ritase.");
  }

  const { data, error } = await supabase
    .from("ritase")
    .update({
      status: "Rejected",
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      rejected_reason: reason,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await writeAuditLog(`Menolak (Reject) Ritase ID ${id} dengan alasan: ${reason}`, data);
  revalidatePath("/protected/ritase");
  return data;
}
