import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminUserService, AuditLogItem } from '@/services/adminUserService';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [actionFilter, setActionFilter] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminUserService.fetchAuditLogs({
        page,
        limit: 20,
        action: actionFilter || undefined,
      });
      setLogs(res.logs);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to load security audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'USER_CREATED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            Account Created
          </span>
        );
      case 'ROLE_CHANGED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
            Role Changed
          </span>
        );
      case 'USER_DEACTIVATED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">
            Deactivated
          </span>
        );
      case 'USER_ACTIVATED':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800">
            Reactivated
          </span>
        );
      case 'PASSWORD_RESET':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
            Password Reset
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-800">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#246B45]/10 text-[#246B45] rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252A27]">
              Security & Audit Logs
            </h1>
            <p className="text-sm text-[#5C645F] mt-0.5">
              Immutable record of administrative actions, staff alterations, and security events.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-[#F5F4EF] hover:bg-[#EAE8DE] text-[#252A27] rounded-lg transition-colors border border-[#D5D3C8]"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#5C645F]">Filter by Event:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg text-[#252A27] focus:outline-none focus:border-[#246B45]"
          >
            <option value="">All Events</option>
            <option value="USER_CREATED">Account Created</option>
            <option value="ROLE_CHANGED">Role Changed</option>
            <option value="USER_ACTIVATED">Account Activated</option>
            <option value="USER_DEACTIVATED">Account Deactivated</option>
            <option value="PASSWORD_RESET">Password Reset</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E2E0D8] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#246B45] animate-spin mb-3" />
            <p className="text-sm text-[#5C645F]">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileText className="w-12 h-12 text-[#88918C] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-[#252A27]">No audit logs recorded</h3>
            <p className="text-sm text-[#5C645F] mt-1">
              No administrative security events recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E2E0D8] text-xs font-semibold text-[#5C645F] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4">Target User</th>
                  <th className="py-3.5 px-4 sm:px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6 text-xs text-[#5C645F] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#88918C]" />
                        <span>{new Date(log.createdAt).toLocaleString('en-GB')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-4 px-4">
                      {log.actor ? (
                        <div>
                          <div className="font-medium text-[#252A27]">{log.actor.name}</div>
                          <div className="text-xs text-[#5C645F]">{log.actor.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#88918C] italic">System</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {log.target ? (
                        <div>
                          <div className="font-medium text-[#252A27]">{log.target.name}</div>
                          <div className="text-xs text-[#5C645F]">{log.target.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#88918C]">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-xs text-[#5C645F]">
                      {log.details ? (
                        <pre className="font-mono bg-[#F5F4EF] p-1.5 rounded border border-[#E2E0D8] max-w-xs overflow-x-auto text-[11px]">
                          {JSON.stringify(log.details, null, 1)}
                        </pre>
                      ) : (
                        <span className="text-[#88918C]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E2E0D8] bg-[#FAF9F5] flex items-center justify-between text-xs text-[#5C645F]">
            <div>
              Page <span className="font-semibold text-[#252A27]">{page}</span> of{' '}
              <span className="font-semibold text-[#252A27]">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded bg-white border border-[#D5D3C8] text-[#252A27] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded bg-white border border-[#D5D3C8] text-[#252A27] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
