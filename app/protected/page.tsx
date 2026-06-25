export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard-view";

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch current user profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return redirect("/auth/login");
  }

  const isDriver = profile.role === "Driver";

  // Get driver record linked to user
  let driverId = null;
  if (isDriver) {
    const { data: driver } = await supabase
      .from("driver")
      .select("id")
      .eq("profile_id", user.id)
      .single();
    driverId = driver?.id;
  }

  // 1. Fetch Fleet status
  const { data: units } = await supabase.from("unit").select("id, status");
  const activeUnits = units?.filter((u) => u.status === "Aktif").length || 0;
  const maintenanceUnits = units?.filter((u) => u.status === "Maintenance").length || 0;

  // 2. Fetch Driver status
  const { data: drivers } = await supabase.from("driver").select("id, status");
  const activeDrivers = drivers?.filter((d) => d.status === "Aktif").length || 0;

  // 3. Fetch Ritase list (for current month and days)
  let ritaseQuery = supabase
    .from("ritase")
    .select(`
      id,
      tanggal,
      jumlah_ritase,
      tonase,
      tarif_per_ritase,
      total_pendapatan,
      status,
      driver_id,
      unit (kode_unit),
      driver (nama)
    `)
    .order("tanggal", { ascending: false });

  if (isDriver) {
    ritaseQuery = ritaseQuery.eq("driver_id", driverId || "00000000-0000-0000-0000-000000000000");
  }

  const { data: ritase } = await ritaseQuery;

  // 4. Fetch BBM (restricted data mapping inside dashboard)
  const { data: bbm } = await supabase.from("bbm").select("id, tanggal, liter, total_biaya");

  // 5. Fetch Maintenance
  const { data: maintenance } = await supabase
    .from("maintenance")
    .select(`
      id,
      tanggal,
      biaya,
      status,
      jenis_maintenance,
      unit (kode_unit)
    `)
    .order("tanggal", { ascending: false });

  // 6. Fetch Invoices
  const { data: invoices } = await supabase
    .from("invoice")
    .select(`
      id,
      nomor_invoice,
      tanggal_invoice,
      total_tagihan,
      status,
      pelanggan (nama_perusahaan)
    `)
    .order("tanggal_invoice", { ascending: false });

  return (
    <DashboardView
      activeUnits={activeUnits}
      maintenanceUnits={maintenanceUnits}
      activeDrivers={activeDrivers}
      ritase={ritase || []}
      bbm={bbm || []}
      maintenance={maintenance || []}
      invoices={invoices || []}
      isDriver={isDriver}
    />
  );
}
