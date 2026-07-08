import { useEffect, useState } from "react";
import { apiClient } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactCreateSchema, type ContactCreate } from "@crm/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function initials(firstName: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function ContactCard({ contact }: { contact: any }) {
  return (
    <Link to={`/contacts/${contact.id}`} className="block">
      <div className="contact-card group">
        {/* Monogram */}
        <div className="mb-4 flex items-start justify-between">
          <div className="w-10 h-10 border border-line flex items-center justify-center">
            <span className="font-display font-light text-sm tracking-widest text-cream-muted group-hover:text-cream transition-colors">
              {initials(contact.firstName, contact.lastName)}
            </span>
          </div>
          <span className="label-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </div>

        {/* Name */}
        <p className="text-cream text-sm font-light tracking-widest uppercase mb-1 group-hover:text-cream transition-colors">
          {contact.firstName} {contact.lastName}
        </p>

        {/* Meta */}
        {contact.email && (
          <p className="label-xs mb-3 truncate">{contact.email}</p>
        )}

        {/* Tags */}
        {contact.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {contact.tags.map((t: string) => (
              <span key={t} className="tag-bloom">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ContactsList() {
  const [contacts,     setContacts]     = useState<any[]>([]);
  const [query,        setQuery]        = useState("");
  const [loading,      setLoading]      = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchContacts = async (q = "") => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/contacts${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setContacts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchContacts(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactCreate>({
    resolver: zodResolver(ContactCreateSchema),
  });

  const onSubmit = async (data: ContactCreate) => {
    try {
      await apiClient.post("/contacts", data);
      setIsDialogOpen(false);
      reset();
      fetchContacts(query);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-void px-10 py-10">

      {/* Header */}
      <div className="flex items-end justify-between mb-10 animate-fade-up">
        <div>
          <h1 className="display-heading">Contacts</h1>
          <p className="label-xs mt-2">
            {loading ? "Loading…" : `${contacts.length} people`}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary">+ New Contact</button>
          </DialogTrigger>

          <DialogContent className="bg-void border border-line text-cream rounded-none max-w-sm p-8 shadow-none">
            <DialogHeader>
              <DialogTitle className="font-display font-light text-2xl tracking-widest text-cream uppercase mb-6">
                New Contact
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-xs block mb-2">First Name *</label>
                  <input {...register("firstName")} className="input-bloom" placeholder="Jane" />
                  {errors.firstName && <p className="text-xs text-red-400/70 mt-1 tracking-wide">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label-xs block mb-2">Last Name</label>
                  <input {...register("lastName")} className="input-bloom" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="label-xs block mb-2">Email</label>
                <input type="email" {...register("email")} className="input-bloom" placeholder="jane@example.com" />
              </div>

              <div>
                <label className="label-xs block mb-2">Phone</label>
                <input {...register("phone")} className="input-bloom" placeholder="+1 555 000 0000" />
              </div>

              <div>
                <label className="label-xs block mb-2">Follow-up every (days)</label>
                <input
                  type="number"
                  {...register("stayInTouchInterval", { valueAsNumber: true })}
                  className="input-bloom"
                  placeholder="30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? "Saving…" : "Save →"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-10 animate-fade-up stagger-1">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <span className="label-xs text-cream-faint">Search</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a name…"
            className="flex-1 bg-transparent text-sm font-light text-cream placeholder-cream-faint outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="label-xs hover:text-cream transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px border border-line">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className="p-5 space-y-3">
              <div className="skel w-10 h-10" />
              <div className="skel h-2.5 w-32" />
              <div className="skel h-2 w-24" />
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="border border-line py-20 text-center animate-fade-in">
          <p className="font-display font-light text-4xl text-cream/10 mb-3">
            {query ? "No results" : "Empty"}
          </p>
          <p className="label-xs mb-6">
            {query ? "No contacts match your search." : "Start adding people to your network."}
          </p>
          {!query && (
            <button className="btn-ghost" onClick={() => setIsDialogOpen(true)}>
              Add first contact →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px border border-line animate-fade-up stagger-2">
          {contacts.map(c => <ContactCard key={c.id} contact={c} />)}
        </div>
      )}
    </div>
  );
}
