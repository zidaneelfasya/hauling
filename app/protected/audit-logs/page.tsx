"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getAuditLogs } from "@/app/actions/audit";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldAlert, History, Calendar, User, Eye, EyeOff, Search } from "lucide-react";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [visibleDetails, setVisibleDetails] = useState<{ [key: string]: boolean }>({});

  // Fetch session profile
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            setUserProfile(data);
          });
      }
    });
  }, []);

  const isAccessGranted = userProfile && ["Owner", "Full Access", "Admin"].includes(userProfile.role);

  // Queries
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
    enabled: !!isAccessGranted,
  });

  const toggleDetail = (id: string) => {
    setVisibleDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (log.email && log.email.toLowerCase().includes(term)) ||
        (log.role && log.role.toLowerCase().includes(term)) ||
        log.aktivitas.toLowerCase().includes(term);
      return matchSearch;
    });
  }, [logs, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // If user is not authorized
  if (userProfile && !isAccessGranted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-in fade-in duration-300">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-4 opacity-80" />
        <h2 className="text-xl font-bold text-foreground">Akses Ditolak (403)</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Halaman audit log sistem hanya dapat diakses oleh administrator (Owner, Admin, atau Full Access).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Audit Log Sistem</h1>
        <p className="text-xs text-muted-foreground">Catatan jejak aktivitas penulisan dan perubahan data di ERP HMS</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari aktivitas audit, email user, atau role..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 text-xs h-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-xs text-rose-400">
          Gagal mengambil data log: {(error as any).message || "Silakan hubungi administrator"}
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[180px]">Waktu</TableHead>
                <TableHead className="text-xs w-[220px]">User (Email)</TableHead>
                <TableHead className="text-xs w-[100px]">Role</TableHead>
                <TableHead className="text-xs">Aktivitas</TableHead>
                <TableHead className="text-xs text-right w-[100px]">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar size={12} />
                        {formatTimestamp(log.waktu)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold py-3">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <User size={12} className="text-orange-500 shrink-0" />
                        {log.email || "System/Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs py-3">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-wider">
                        {log.role || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground py-3">
                      {log.aktivitas}
                    </TableCell>
                    <TableCell className="text-xs text-right py-3">
                      {log.detail ? (
                        <Button
                          onClick={() => toggleDetail(log.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {visibleDetails[log.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {visibleDetails[log.id] && log.detail && (
                    <TableRow className="bg-muted/10">
                      <TableCell colSpan={5} className="p-4">
                        <pre className="text-[10px] font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-300 max-h-40 overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(log.detail, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                    Tidak ada aktivitas audit log yang tercatat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-xs text-muted-foreground">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} audit
              </span>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-8"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={`text-xs px-2.5 py-1 h-8 ${currentPage === i + 1 ? "bg-orange-500 text-white hover:bg-orange-600" : ""}`}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
