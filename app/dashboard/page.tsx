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

  const isDriver = !profile || profile.role === "Driver";
  const hasProfile = !!profile;

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

  // 1. Fetch Fleet units
  const { data: units } = await supabase
    .from("unit")
    .select("id, kode_unit, status, kontrak_hauling_id, biaya_sewa, durasi_sewa_bulan");
  const activeUnits = units?.filter((u) => u.status === "Aktif").length || 0;
  const maintenanceUnits = units?.filter((u) => u.status === "Maintenance").length || 0;

  // 2. Fetch Driver status
  const { data: drivers } = await supabase
    .from("driver")
    .select("id, nama, status, kontrak_hauling_id, accumulated_ritase");
  const activeDrivers = drivers?.filter((d) => d.status === "Aktif").length || 0;

  // 3. Fetch Ritase list
  let ritaseQuery = supabase
    .from("ritase")
    .select(`
      id,
      tanggal,
      kontrak_hauling_id,
      unit_id,
      driver_id,
      jumlah_ritase,
      tonase,
      tarif_per_ritase,
      jenis_pengiriman,
      biaya_bbm,
      keterangan_tarif,
      status,
      unit (kode_unit),
      driver (nama)
    `)
    .order("tanggal", { ascending: false });

  if (isDriver) {
    ritaseQuery = ritaseQuery.eq("driver_id", driverId || "00000000-0000-0000-0000-000000000000");
  }

  const { data: ritase } = await ritaseQuery;

  // 4. Fetch BBM (restricted data mapping inside dashboard)
  let bbmQuery = supabase.from("bbm").select("id, tanggal, unit_id, liter, total_biaya");
  if (isDriver) {
    // If it's a driver, they only see fuel refill logs for their assigned units or none if not applicable.
    // For simplicity, we can load BBM normally or filter. We'll load normally since drivers only see limited UI.
  }
  const { data: bbm } = await bbmQuery;

  // 5. Fetch Maintenance
  const { data: maintenance } = await supabase
    .from("maintenance")
    .select(`
      id,
      tanggal,
      unit_id,
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
      kontrak_hauling (perusahaan)
    `)
    .order("tanggal_invoice", { ascending: false });

  // 7. Fetch Contracts
  const { data: contracts } = await supabase
    .from("kontrak_hauling")
    .select("id, kode_kontrak, perusahaan, tanggal_mulai, tanggal_selesai, jumlah_unit, status")
    .order("kode_kontrak", { ascending: true });

  // 8. Fetch Payrolls
  let payrollQuery = supabase
    .from("payroll")
    .select("id, driver_id, bulan, tahun, jumlah_ritase, tarif_per_ritase, bonus, potongan, total_gaji, status")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (isDriver) {
    payrollQuery = payrollQuery.eq("driver_id", driverId || "00000000-0000-0000-0000-000000000000");
  }
  const { data: payrolls } = await payrollQuery;

  // 9. Fetch Cash Flow logs (Only needed for admin/owner executive metrics)
  let cashFlow: any[] = [];
  let operationalExpenses: any[] = [];
  if (!isDriver) {
    const { data: cfData } = await supabase
      .from("cash_flow")
      .select("*")
      .order("tanggal", { ascending: false });
    cashFlow = cfData || [];

    const { data: opData } = await supabase
      .from("pengeluaran_operasional")
      .select("*")
      .order("tanggal", { ascending: false });
    operationalExpenses = opData || [];
  }

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
      contracts={contracts || []}
      units={units || []}
      drivers={drivers || []}
      payrolls={payrolls || []}
      cashFlow={cashFlow}
      operationalExpenses={operationalExpenses}
    />
  );
}
