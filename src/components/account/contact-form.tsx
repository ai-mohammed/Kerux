"use client";

import { useState } from "react";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

const TOPICS = [
  { value: "question", label: "Une question" },
  { value: "reclamation", label: "Une réclamation" },
  { value: "suggestion", label: "Une suggestion" },
];

export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const { user } = useUser();
  const [form, setForm] = useState({ topic: TOPICS.some((t) => t.value === initialTopic) ? initialTopic! : "question", name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (sent) {
    return (
      <div className="board flex flex-col items-start gap-3 p-6 sm:p-8">
        <p className="display text-3xl">Message envoyé</p>
        <p className="text-ink-600">Merci ! L’équipe Kerux vous répond dès que possible.</p>
        <Button variant="secondary" onClick={() => { setSent(false); setForm((f) => ({ ...f, subject: "", message: "" })); }}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form
      className="board flex flex-col gap-4 p-5 sm:p-6"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await fetchJson("/api/contact", {
            method: "POST",
            json: { ...form, name: form.name.trim() || user?.name || "", email: form.email.trim() || user?.email || "" },
          });
          setSent(true);
        } catch (err) {
          setError(err instanceof RequestFailed ? err.message : "Envoi impossible pour le moment.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Objet" htmlFor="topic" required>
        <Select id="topic" value={form.topic} onChange={update("topic")}>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" htmlFor="name" required>
          <Input id="name" value={form.name || user?.name || ""} onChange={update("name")} autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" type="email" value={form.email || user?.email || ""} onChange={update("email")} autoComplete="email" required />
        </Field>
      </div>
      <Field label="Sujet" htmlFor="subject" required>
        <Input id="subject" value={form.subject} onChange={update("subject")} required maxLength={120} />
      </Field>
      <Field label="Message" htmlFor="message" required>
        <Textarea id="message" value={form.message} onChange={update("message")} required maxLength={2000} rows={6} />
      </Field>
      {error ? (
        <p role="alert" className="rounded-xl border border-alert bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={busy} className="self-start" disabled={!form.subject.trim() || !form.message.trim()}>
        Envoyer
      </Button>
    </form>
  );
}
