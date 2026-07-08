import { useEffect, useState } from "react";
import { apiClient } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import type { DashboardData } from "@crm/shared";

function SkeletonRow() {
  return (
    <div className="contact-row">
      <div className="flex-1 space-y-2">
        <div className="skel h-3 w-40 rounded" />
        <div className="skel h-2 w-24 rounded" />
      </div>
      <div className="skel h-7 w-16 rounded" />
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  return `${diff} days ago`;
}

const typeSymbol: Record<string, string> = {
  call: "Call", email: "Email", meeting: "Meeting", coffee: "Coffee", other: "Note",
};

export default function Dashboard() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/dashboard")
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-void px-10 py-10">

      {/* ── Page heading ── */}
      <div className="mb-10 animate-fade-up">
        <h1 className="display-heading">Dashboard</h1>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-3 gap-px border border-line mb-12 animate-fade-up stagger-1">
        {loading ? (
          <>
            {[1, 2, 3].map(n => (
              <div key={n} className="stat-box">
                <div className="skel h-14 w-16 mb-2" />
                <div className="skel h-2 w-24" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="stat-box">
              <span className="stat-number">{data?.needsFollowUp.length ?? 0}</span>
              <span className="label-xs">Needs follow up</span>
            </div>
            <div className="stat-box border-l border-line">
              <span className="stat-number">{data?.recentInteractions.length ?? 0}</span>
              <span className="label-xs">Recent interactions</span>
            </div>
            <div className="stat-box border-l border-line">
              <span className="stat-number">—</span>
              <span className="label-xs">Total contacts</span>
            </div>
          </>
        )}
      </div>

      {/* ── Main two-col ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border border-line animate-fade-up stagger-2">

        {/* Follow up */}
        <div className="bg-void">
          <div className="px-6 pt-6 pb-4 border-b border-line flex items-baseline justify-between">
            <span className="label-xs">Needs Follow Up</span>
            {!loading && data && data.needsFollowUp.length > 0 && (
              <span className="label-xs text-cream-faint">{data.needsFollowUp.length} overdue</span>
            )}
          </div>

          <div className="px-6">
            {loading ? (
              <>{[1,2,3,4].map(n => <SkeletonRow key={n} />)}</>
            ) : !data || data.needsFollowUp.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-display font-light text-2xl text-cream/20 mb-1">All clear</p>
                <p className="label-xs">No follow-ups overdue</p>
              </div>
            ) : (
              data.needsFollowUp.map((c, i) => (
                <div key={c.id} className={`contact-row animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-cream text-sm font-light tracking-wide uppercase truncate">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="label-xs mt-0.5">
                      {c.lastInteractionDate
                        ? `Last contact · ${timeAgo(c.lastInteractionDate)}`
                        : "Never contacted"
                      }
                      {c.stayInTouchInterval ? ` · every ${c.stayInTouchInterval}d` : ""}
                    </p>
                  </div>
                  <Link to={`/contacts/${c.id}`}>
                    <button className="arrow-btn flex-shrink-0">Log &nbsp;→</button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-void border-l border-line">
          <div className="px-6 pt-6 pb-4 border-b border-line">
            <span className="label-xs">Recent Activity</span>
          </div>

          <div className="px-6 py-6">
            {loading ? (
              <div className="timeline-track space-y-6">
                {[1,2,3].map(n => (
                  <div key={n} className="relative">
                    <div className="timeline-node" />
                    <div className="space-y-1.5">
                      <div className="skel h-2 w-16" />
                      <div className="skel h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data || data.recentInteractions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-display font-light text-2xl text-cream/20 mb-1">Quiet</p>
                <p className="label-xs">No interactions logged yet</p>
              </div>
            ) : (
              <div className="timeline-track space-y-6">
                {data.recentInteractions.map((ix, i) => (
                  <div key={ix.id} className={`relative animate-fade-up stagger-${Math.min(i+1,5)}`}>
                    <div className="timeline-node" />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="label-xs">{typeSymbol[ix.type] ?? ix.type}</span>
                        <span className="label-xs text-cream-faint">
                          {new Date(ix.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <Link to={`/contacts/${ix.contactId}`}>
                        <p className="text-sm font-light text-cream hover:text-cream-muted transition-colors tracking-wide">
                          {ix.contactFirstName} {ix.contactLastName}
                        </p>
                      </Link>
                      {ix.notes && (
                        <p className="mt-1 text-xs text-cream-faint font-light italic leading-relaxed line-clamp-2">
                          "{ix.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
