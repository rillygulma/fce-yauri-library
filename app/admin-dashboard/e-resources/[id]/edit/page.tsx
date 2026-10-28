"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

type Resource = { _id: string; title: string; type: "ebook" | "journal"; author?: string; subject?: string; department?: string; publisher?: string; publicationYear?: number; isbn?: string; issn?: string; volumeNumber?: string; callNumber?: string; edition?: string; totalCopies?: number; coverImage?: string; status: "available" | "unavailable" };
const field = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100";
export default function EditEResourcePage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const [item, setItem] = useState<Resource | null>(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { const controller = new AbortController(); fetch(`/api/e-resources/${id}`, { cache: "no-store", signal: controller.signal }).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.message || "Unable to load resource."); setItem(data.item); }).catch((e: unknown) => { if (e instanceof Error && e.name !== "AbortError") setError(e.message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [id]);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!item) return; setBusy(true); setError(""); const form = new FormData(e.currentTarget); const payload = Object.fromEntries(form.entries()); try { const response = await fetch(`/api/e-resources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, keywords: String(form.get("keywords") ?? "").split(",").map((v) => v.trim()).filter(Boolean) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Update failed."); router.push("/admin-dashboard/e-resources"); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Update failed."); } finally { setBusy(false); } }
  if (loading) return <main className="p-8">Loading resource…</main>;
  if (!item) return <main className="mx-auto max-w-3xl p-8"><p className="rounded-xl bg-red-50 p-4 text-red-800">{error || "Resource not found."}</p><Link href="/admin-dashboard/e-resources" className="mt-4 inline-block text-red-900">Back to resources</Link></main>;
  const values: Record<string, string | number> = {
    title: item.title, type: item.type, author: item.author ?? "", subject: item.subject ?? "",
    department: item.department ?? "", publisher: item.publisher ?? "", publicationYear: item.publicationYear ?? "",
    isbn: item.isbn ?? "", issn: item.issn ?? "", volumeNumber: item.volumeNumber ?? "",
    callNumber: item.callNumber ?? "", edition: item.edition ?? "", totalCopies: item.totalCopies ?? 1,
    coverImage: item.coverImage ?? "", status: item.status,
  };
  const fields: { name: string; label: string; max?: number; full?: boolean; type?: string }[] = [
    { name: "title", label: "Title *", max: 200, full: true }, { name: "type", label: "Resource type", type: "select" },
    { name: "author", label: "Author(s), comma-separated", max: 500 }, { name: "subject", label: "Subject", max: 120 },
    { name: "department", label: "Department", max: 120 }, { name: "publisher", label: "Publisher", max: 200 },
    { name: "publicationYear", label: "Publication year", type: "number" }, { name: "isbn", label: "ISBN", max: 40 },
    { name: "issn", label: "ISSN", max: 40 }, { name: "volumeNumber", label: "Volume number", max: 40 },
    { name: "callNumber", label: "Call number", max: 100 }, { name: "edition", label: "Edition", max: 100 },
    { name: "totalCopies", label: "Total copies", type: "number" }, { name: "coverImage", label: "Cover image URL", max: 1000, full: true },
    { name: "status", label: "Availability", type: "status" },
  ];
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8"><div className="mx-auto max-w-4xl"><Link href="/admin-dashboard/e-resources" className="inline-flex items-center gap-2 text-sm font-semibold text-red-900"><ArrowLeft className="h-4 w-4"/>Back to E-Resources</Link><h1 className="mt-5 text-3xl font-bold text-slate-900">Edit resource</h1><p className="mt-2 text-slate-600">Update metadata and resource availability. The uploaded PDF remains unchanged.</p><form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="grid gap-4 sm:grid-cols-2">{fields.map((f) => <label key={f.name} className={`text-sm font-semibold ${f.full ? "sm:col-span-2" : ""}`}>{f.label}{f.type === "select" ? <select name={f.name} defaultValue={values[f.name]} className={field}><option value="ebook">E-book</option><option value="journal">Academic journal</option></select> : f.type === "status" ? <select name={f.name} defaultValue={values[f.name]} className={field}><option value="available">Available</option><option value="unavailable">Unavailable</option></select> : f.type === "textarea" ? <textarea name={f.name} defaultValue={values[f.name]} maxLength={f.max} rows={4} className={field}/> : <input name={f.name} defaultValue={values[f.name]} required={f.name === "title"} maxLength={f.max} type={f.type ?? "text"} min={f.name === "totalCopies" ? 1 : f.type === "number" ? 1000 : undefined} max={f.type === "number" ? 2100 : undefined} className={field}/>}</label>)}</div>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="mt-6 flex justify-end"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-900 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"><Save className="h-4 w-4"/>{busy ? "Saving…" : "Save changes"}</button></div></form></div></main>;
}
