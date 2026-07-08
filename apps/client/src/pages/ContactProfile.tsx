import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InteractionCreateSchema, type InteractionCreate } from "@crm/shared";

const TYPES = ["call", "email", "meeting", "coffee", "other"] as const;

const typeLabel: Record<string, string> = {
  call: "Call", email: "Email", meeting: "Meeting", coffee: "Coffee", other: "Note",
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

export default function ContactProfile() {
  const { id } = useParams<{ id: string }>();
  const [contact,      setContact]      = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<InteractionCreate>({
    resolver: zodResolver(InteractionCreateSchema),
    defaultValues: { type: "call", notes: "", date: "" },
  });

  const selectedType = watch("type");

  const fetchData = async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        apiClient.get(`/contacts/${id}`),
        apiClient.get(`/contacts/${id}/interactions`),
      ]);
      setContact(cRes.data);
      setInteractions(iRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const onSubmit = async (data: InteractionCreate) => {
    try {
      await apiClient.post(`/contacts/${id}/interactions`, data);
      reset({ type: "call", notes: "", date: "" });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (iid: string) => {
    if (!confirm("Delete this interaction?")) return;
    try {
      await apiClient.delete(`/contacts/${id}/interactions/${iid}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleEdit = async (iid: string, notes: string) => {
    const n = prompt("Edit notes:", notes ?? "");
    if (n === null) return;
    try {
      await apiClient.put(`/contacts/${id}/interactions/${iid}`, { notes: n });
      fetchData();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void px-10 py-10">
        <div className="skel h-2 w-40 mb-10" />
        <div className="skel h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-line">
          <div className="p-8 space-y-4">
            {[1,2,3].map(n=><div key={n} className="skel h-3 w-full rounded"/>)}
          </div>
          <div className="p-8 col-span-2 space-y-4 border-l border-line">
            {[1,2,3,4].map(n=><div key={n} className="skel h-3 w-full rounded"/>)}
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-light text-4xl text-cream/20 mb-2">Not found</p>
          <Link to="/contacts" className="label-xs hover:text-cream transition-colors underline">← Contacts</Link>
        </div>
      </div>
    );
  }

  const fullName = `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-void px-10 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 animate-fade-in">
        <Link to="/contacts" className="label-xs hover:text-cream transition-colors">Contacts</Link>
        <span className="label-xs text-cream-faint">/</span>
        <span className="label-xs text-cream-muted">{fullName}</span>
      </div>

      {/* Name */}
      <div className="mb-10 animate-fade-up">
        <h1 className="display-heading">{fullName}</h1>
        <div className="flex flex-wrap items-center gap-6 mt-3">
          {contact.email && <span className="label-xs">{contact.email}</span>}
          {contact.phone && <span className="label-xs">{contact.phone}</span>}
          {contact.stayInTouchInterval && (
            <span className="label-xs">Every {contact.stayInTouchInterval} days</span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-line animate-fade-up stagger-1">

        {/* ── Log Form ── */}
        <div className="bg-void p-8">
          <p className="label-xs mb-8">Log Interaction</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

            {/* Type pills */}
            <div>
              <label className="label-xs block mb-4">Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TYPES.map(t => (
                  <div key={t} className="type-radio">
                    <input
                      type="radio"
                      id={`type-${t}`}
                      value={t}
                      {...register("type")}
                    />
                    <label htmlFor={`type-${t}`}>
                      <span className="text-base leading-none">
                        {t === "call" ? "📞" : t === "email" ? "📧" : t === "meeting" ? "🤝" : t === "coffee" ? "☕" : "💬"}
                      </span>
                      {typeLabel[t]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="label-xs block mb-3">Date (optional)</label>
              <input
                type="datetime-local"
                {...register("date")}
                className="input-bloom text-xs"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="label-xs block mb-3">Notes</label>
              <textarea
                {...register("notes")}
                className="input-bloom resize-none leading-relaxed"
                rows={5}
                placeholder="What did you talk about?"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center"
            >
              {isSubmitting ? "Saving…" : `Log ${typeLabel[selectedType] ?? "Interaction"} →`}
            </button>
          </form>
        </div>

        {/* ── Timeline ── */}
        <div className="bg-void border-l border-line col-span-2 p-8">
          <div className="flex items-baseline justify-between mb-8">
            <p className="label-xs">Interaction History</p>
            <span className="label-xs text-cream-faint">{interactions.length} entries</span>
          </div>

          {interactions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display font-light text-4xl text-cream/10 mb-2">Nothing yet</p>
              <p className="label-xs">Log your first interaction using the form.</p>
            </div>
          ) : (
            <div className="timeline-track space-y-8">
              {interactions.map((ix, i) => (
                <div key={ix.id} className={`relative group animate-fade-up stagger-${Math.min(i+1,5)}`}>
                  <div className="timeline-node" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="tag-bloom">{typeLabel[ix.type] ?? ix.type}</span>
                        <span className="label-xs text-cream-faint">
                          {new Date(ix.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          &nbsp;·&nbsp;{timeAgo(ix.date)}
                        </span>
                      </div>

                      {/* Notes */}
                      {ix.notes && (
                        <p className="text-sm font-light text-cream-muted leading-relaxed italic">
                          "{ix.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleEdit(ix.id, ix.notes ?? "")}
                        className="arrow-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ix.id)}
                        className="arrow-btn border-red-900/30 text-red-400/50 hover:text-red-400 hover:border-red-400/40"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
