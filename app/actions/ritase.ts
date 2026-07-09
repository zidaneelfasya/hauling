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
      profiles:approved_by (id, nama),
      bbm!ritase_id (id, liter, harga_per_liter)
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
  kontrak_hauling_id: string;
  unit_id: string;
  driver_id: string;
  lokasi_loading_id: string;
  lokasi_dumping_id: string;
  jumlah_ritase: number;
  tonase: number;
  tarif_per_ritase: number;
  jenis_pengiriman: string;
  volume_bbm: number;
  harga_per_liter_bbm: number;
  km_awal?: number;
  km_akhir?: number;
  hm_awal?: number;
  hm_akhir?: number;
  keterangan_tarif?: string;
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

  const biaya_bbm = Number(formData.volume_bbm || 0) * Number(formData.harga_per_liter_bbm || 0);
  const total_pendapatan = Number(formData.jumlah_ritase) * Number(formData.tarif_per_ritase);

  const insertData = {
    tanggal: formData.tanggal,
    kontrak_hauling_id: formData.kontrak_hauling_id,
    unit_id: formData.unit_id,
    driver_id: finalDriverId,
    lokasi_loading_id: formData.lokasi_loading_id,
    lokasi_dumping_id: formData.lokasi_dumping_id,
    jumlah_ritase: formData.jumlah_ritase,
    tonase: formData.tonase,
    tarif_per_ritase: formData.tarif_per_ritase,
    jenis_pengiriman: formData.jenis_pengiriman,
    biaya_bbm,
    km_awal: formData.km_awal || null,
    km_akhir: formData.km_akhir || null,
    hm_awal: formData.hm_awal || null,
    hm_akhir: formData.hm_akhir || null,
    keterangan_tarif: formData.keterangan_tarif || null,
    status: finalStatus,
  };

  const { data: ritaseData, error: ritaseErr } = await supabase
    .from("ritase")
    .insert(insertData)
    .select()
    .single();

  if (ritaseErr) throw ritaseErr;

  if (Number(formData.volume_bbm || 0) > 0 && Number(formData.harga_per_liter_bbm || 0) > 0) {
    const { error: bbmErr } = await supabase
      .from("bbm")
      .insert({
        tanggal: formData.tanggal,
        unit_id: formData.unit_id,
        liter: formData.volume_bbm,
        harga_per_liter: formData.harga_per_liter_bbm,
        total_biaya: biaya_bbm,
        lokasi_pengisian: "Ritase BBM",
        ritase_id: ritaseData.id,
      });
    if (bbmErr) throw bbmErr;
  }

  await writeAuditLog(`Mencatat Ritase baru: Unit ${formData.unit_id}, Total Pendapatan Rp${total_pendapatan.toLocaleString()}`, insertData);
  revalidatePath("/dashboard/ritase");
  return ritaseData;
}

export async function updateRitase(
  id: string,
  formData: {
    tanggal: string;
    kontrak_hauling_id: string;
    unit_id: string;
    driver_id: string;
    lokasi_loading_id: string;
    lokasi_dumping_id: string;
    jumlah_ritase: number;
    tonase: number;
    tarif_per_ritase: number;
    jenis_pengiriman: string;
    volume_bbm: number;
    harga_per_liter_bbm: number;
    km_awal?: number;
    km_akhir?: number;
    hm_awal?: number;
    hm_akhir?: number;
    keterangan_tarif?: string;
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

  const biaya_bbm = Number(formData.volume_bbm || 0) * Number(formData.harga_per_liter_bbm || 0);
  const total_pendapatan = Number(formData.jumlah_ritase) * Number(formData.tarif_per_ritase);

  const updateData: any = {
    tanggal: formData.tanggal,
    kontrak_hauling_id: formData.kontrak_hauling_id,
    unit_id: formData.unit_id,
    driver_id: formData.driver_id,
    lokasi_loading_id: formData.lokasi_loading_id,
    lokasi_dumping_id: formData.lokasi_dumping_id,
    jumlah_ritase: formData.jumlah_ritase,
    tonase: formData.tonase,
    tarif_per_ritase: formData.tarif_per_ritase,
    jenis_pengiriman: formData.jenis_pengiriman,
    biaya_bbm,
    km_awal: formData.km_awal || null,
    km_akhir: formData.km_akhir || null,
    hm_awal: formData.hm_awal || null,
    hm_akhir: formData.hm_akhir || null,
    keterangan_tarif: formData.keterangan_tarif || null,
    status: formData.status || existing.status,
  };

  if (profile.role === "Driver") {
    if (!driverRecord) {
      throw new Error("Profil Driver Anda belum terhubung ke master data Driver");
    }
    updateData.status = "Draft";
    updateData.driver_id = driverRecord.id;
  }

  const { data: ritaseData, error: ritaseErr } = await supabase
    .from("ritase")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (ritaseErr) throw ritaseErr;

  if (Number(formData.volume_bbm || 0) > 0 && Number(formData.harga_per_liter_bbm || 0) > 0) {
    const { data: existingBbm } = await supabase
      .from("bbm")
      .select("id")
      .eq("ritase_id", id)
      .maybeSingle();

    if (existingBbm) {
      const { error: bbmUpdateErr } = await supabase
        .from("bbm")
        .update({
          tanggal: formData.tanggal,
          unit_id: formData.unit_id,
          liter: formData.volume_bbm,
          harga_per_liter: formData.harga_per_liter_bbm,
          total_biaya: biaya_bbm,
        })
        .eq("id", existingBbm.id);
      if (bbmUpdateErr) throw bbmUpdateErr;
    } else {
      const { error: bbmInsertErr } = await supabase
        .from("bbm")
        .insert({
          tanggal: formData.tanggal,
          unit_id: formData.unit_id,
          liter: formData.volume_bbm,
          harga_per_liter: formData.harga_per_liter_bbm,
          total_biaya: biaya_bbm,
          lokasi_pengisian: "Ritase BBM",
          ritase_id: id,
        });
      if (bbmInsertErr) throw bbmInsertErr;
    }
  } else {
    await supabase.from("bbm").delete().eq("ritase_id", id);
  }

  await writeAuditLog(`Mengubah Ritase ID ${id}: Rp${total_pendapatan.toLocaleString()}`, updateData);
  revalidatePath("/dashboard/ritase");
  return ritaseData;
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
  revalidatePath("/dashboard/ritase");
  return true;
}

export async function deleteMultipleRitase(ids: string[]) {
  const { profile } = await getUserInfo();
  const supabase = await createClient();

  if (!["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Hanya Admin yang dapat menghapus data ritase.");
  }

  const { error } = await supabase.from("ritase").delete().in("id", ids);
  if (error) throw error;

  await writeAuditLog(`Menghapus Beberapa Ritase ID: ${ids.join(", ")}`);
  revalidatePath("/dashboard/ritase");
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
  revalidatePath("/dashboard/ritase");
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
  revalidatePath("/dashboard/ritase");
  return data;
}
