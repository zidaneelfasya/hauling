"use server";

import { createClient } from "@/lib/supabase/server";

export async function writeAuditLog(aktivitas: string, detail: any = null) {
  try {
    const supabase = await createClient();
    
    // We get the user and profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("nama, role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "Driver";
    const nama = profile?.nama || user.email;

    // Write to audit log table
    await supabase.from("audit_log").insert({
      user_id: user.id,
      email: user.email,
      role: role,
      aktivitas: `${nama} (${role}): ${aktivitas}`,
      detail: detail,
      waktu: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export async function getAuditLogs() {
  const supabase = await createClient();
  
  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["Owner", "Full Access", "Admin"].includes(profile.role)) {
    throw new Error("Forbidden: Access denied to Audit Logs");
  }

  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("waktu", { ascending: false });

  if (error) throw error;
  return data;
}
