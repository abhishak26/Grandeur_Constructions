import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, type ReactNode } from "react";
import { sendConsultation, sendEnquiry } from "@/lib/forms.functions";
import { track } from "@/lib/format";
import {
  consultationSchema,
  enquirySchema,
  type ConsultationData,
  type ConsultationInput,
  type EnquiryData,
  type EnquiryInput,
} from "@/lib/schemas";

const METHODS = [
  ["phone", "Phone"],
  ["email", "Email"],
  ["whatsapp", "WhatsApp"],
] as const;

function IndiaFlag() {
  return (
    <svg className="india-flag" viewBox="0 0 24 16" role="img" aria-label="India">
      <rect width="24" height="16" rx="2" fill="#fff" />
      <path d="M1 1h22v4H1z" fill="#f97316" />
      <path d="M1 11h22v4H1z" fill="#16a34a" />
      <circle cx="12" cy="8" r="2" fill="none" stroke="#1d4ed8" strokeWidth=".7" />
      <circle cx="12" cy="8" r=".45" fill="#1d4ed8" />
    </svg>
  );
}

function Field({
  label,
  error,
  hideLabel = false,
  children,
}: {
  label: string;
  error?: string;
  hideLabel?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className={hideLabel ? "sr-only" : "text-sm font-medium text-secondary"}>{label}</span>
      {children}
      {error ? <span className="block text-sm text-danger">{error}</span> : null}
    </label>
  );
}

function CompactLeadForm() {
  const [done, setDone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<EnquiryInput, unknown, EnquiryData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "", email: "", phone: "", projectType: "General enquiry",
      projectLocation: "Not provided", estimatedBudget: "",
      projectDescription: "Website quote enquiry", preferredContact: "phone", privacyConsent: true,
    },
  });
  if (done) {
    return (
      <div className="status-banner compact-enquiry-success" role="status">
        <p>Enquiry received</p>
        <strong>Thank you. We will be in touch shortly.</strong>
        <button type="button" onClick={() => setDone(null)}>Send another enquiry</button>
      </div>
    );
  }
  return (
    <form className="compact-enquiry-form" noValidate onSubmit={form.handleSubmit(async (values) => {
      setFormError(null);
      const result = await sendEnquiry({ data: values });
      if (!result.ok) {
        setFormError(result.message);
        if ("fieldErrors" in result) {
          for (const [key, message] of Object.entries(result.fieldErrors)) {
            form.setError(key as keyof EnquiryInput, { message });
          }
        }
        return;
      }
      track("enquiry_submit");
      setDone(result.reference);
      form.reset();
    })}>
      <Field label="Name *" error={form.formState.errors.fullName?.message}>
        <input className="compact-enquiry-control" placeholder="Enter your Name" autoComplete="name" {...form.register("fullName")} />
      </Field>
      <Field label="Mobile Number *" error={form.formState.errors.phone?.message}>
        <span className="compact-phone-control"><IndiaFlag /><input className="compact-phone-input" placeholder="Enter mobile number" type="tel" autoComplete="tel" {...form.register("phone")} /></span>
      </Field>
      <Field label="Email ID *" error={form.formState.errors.email?.message}>
        <input className="compact-enquiry-control" placeholder="Enter your Email ID" type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      {formError ? <p className="compact-enquiry-error" role="alert">{formError}</p> : null}
      <button type="submit" className="compact-enquiry-submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Submit"}</button>
    </form>
  );
}

export function EnquiryForm({ projectTypes, compact = false }: { projectTypes: string[]; compact?: boolean }) {
  if (compact) return <CompactLeadForm />;
  return <StandardEnquiryForm projectTypes={projectTypes} />;
}

function StandardEnquiryForm({ projectTypes }: { projectTypes: string[] }) {
  const [done, setDone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<EnquiryInput, unknown, EnquiryData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      projectType: "",
      projectLocation: "Not provided",
      estimatedBudget: "",
      projectDescription: "General contact enquiry",
      preferredContact: "phone",
      privacyConsent: false,
    },
  });

  if (done) {
    return (
      <div className="status-banner rounded-3xl bg-surface p-8" role="status">
        <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Enquiry received</p>
        <h2 className="mt-3 font-display text-3xl text-secondary">Thank you! Our studio team will review your brief within 24 hours.</h2>
        <p className="mt-3 text-ink-soft">
          Your reference is <span className="font-semibold text-secondary">{done}</span>. The studio will use the contact
          method you chose. This is not a confirmed appointment.
        </p>
        <button type="button" className="mt-6 text-sm font-semibold text-secondary underline" onClick={() => setDone(null)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      className="enquire-form"
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);
        const result = await sendEnquiry({ data: values });
        if (!result.ok) {
          setFormError(result.message);
          if ("fieldErrors" in result) {
            for (const [key, message] of Object.entries(result.fieldErrors)) {
              form.setError(key as keyof EnquiryInput, { message });
            }
          }
          return;
        }
        track("enquiry_submit");
        setDone(result.reference);
        form.reset();
      })}
    >
      <h2 className="enquire-form-title">Enquire Now</h2>
      <div className="enquire-form-grid">
        <div className="enquire-form-column">
          <Field label="Name *" error={form.formState.errors.fullName?.message}>
            <input className="input enquire-form-control" aria-label="Name" placeholder="Enter your name" aria-invalid={Boolean(form.formState.errors.fullName)} autoComplete="name" {...form.register("fullName")} />
          </Field>
          <Field label="Mobile Number *" error={form.formState.errors.phone?.message}>
            <span className="enquire-phone-control">
              <span className="enquire-country" aria-label="India country code">
                <IndiaFlag />
              </span>
              <input className="enquire-phone-input" aria-label="Mobile Number" placeholder="Enter your mobile number" aria-invalid={Boolean(form.formState.errors.phone)} type="tel" autoComplete="tel" {...form.register("phone")} />
            </span>
          </Field>
          <Field label="Email ID *" error={form.formState.errors.email?.message}>
            <input className="input enquire-form-control" aria-label="Email ID" placeholder="Enter your email ID" aria-invalid={Boolean(form.formState.errors.email)} type="email" autoComplete="email" {...form.register("email")} />
          </Field>
        </div>
      </div>
      <label className="enquire-consent">
        <input type="checkbox" {...form.register("privacyConsent")} />
        <span>I agree that Grandeur Constructions may store these details to reply to this enquiry.</span>
      </label>
      {form.formState.errors.privacyConsent ? (
        <p className="text-sm text-danger">{form.formState.errors.privacyConsent.message}</p>
      ) : null}
      {formError ? <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{formError}</p> : null}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="enquire-submit"
      >
        {form.formState.isSubmitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

export function ConsultationForm({ projectTypes }: { projectTypes: string[] }) {
  const [done, setDone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ConsultationInput, unknown, ConsultationData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      projectType: projectTypes[0] ?? "Residential Construction",
      projectLocation: "",
      preferredWindow: "",
      message: "",
      preferredContact: "phone",
      privacyConsent: false,
    },
  });

  if (done) {
    return (
      <div className="status-banner rounded-3xl bg-surface p-8" role="status">
        <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">Request logged</p>
        <h2 className="mt-3 font-display text-3xl text-secondary">Thank you! Our studio team will review your brief within 24 hours.</h2>
        <p className="mt-3 text-ink-soft">
          Reference <span className="font-semibold text-secondary">{done}</span>. This is a request, not a confirmed
          appointment. Grandeur Constructions will contact you if they can take the conversation further.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);
        const result = await sendConsultation({ data: values });
        if (!result.ok) {
          setFormError(result.message);
          return;
        }
        track("consultation_request");
        setDone(result.reference);
        form.reset();
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" error={form.formState.errors.fullName?.message}>
          <input className="input" autoComplete="name" {...form.register("fullName")} />
        </Field>
        <Field label="Email address" error={form.formState.errors.email?.message}>
          <input className="input" type="email" autoComplete="email" {...form.register("email")} />
        </Field>
        <Field label="Phone number" error={form.formState.errors.phone?.message}>
          <input className="input" type="tel" autoComplete="tel" {...form.register("phone")} />
        </Field>
        <Field label="Project type" error={form.formState.errors.projectType?.message}>
          <select className="input" {...form.register("projectType")}>
            {projectTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
            <option>Not sure yet</option>
          </select>
        </Field>
        <Field label="Project location (optional)" error={form.formState.errors.projectLocation?.message}>
          <input className="input" {...form.register("projectLocation")} />
        </Field>
        <Field label="When should we reach you? (optional)" error={form.formState.errors.preferredWindow?.message}>
          <input className="input" placeholder="For example, weekday mornings" {...form.register("preferredWindow")} />
        </Field>
      </div>
      <Field label="What would you like to discuss?" error={form.formState.errors.message?.message}>
        <textarea className="input min-h-32" {...form.register("message")} />
      </Field>
      <fieldset>
        <legend className="text-sm font-medium text-secondary">Preferred contact method</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {METHODS.map(([value, label]) => (
            <label key={value} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4">
              <input type="radio" value={value} {...form.register("preferredContact")} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm text-ink">
        <input type="checkbox" className="mt-1" {...form.register("privacyConsent")} />
        <span>I agree that these details may be stored so the studio can respond. This does not book a slot.</span>
      </label>
      {form.formState.errors.privacyConsent ? (
        <p className="text-sm text-danger">{form.formState.errors.privacyConsent.message}</p>
      ) : null}
      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex min-h-11 items-center rounded-full bg-secondary px-6 font-semibold text-background disabled:opacity-60"
      >
        {form.formState.isSubmitting ? "Sending…" : "Get a Quote"}
      </button>
    </form>
  );
}
