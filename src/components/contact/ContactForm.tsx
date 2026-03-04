"use client";

import { useState, useRef } from "react";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Server error");

      setStatus({
        type: "success",
        message:
          "Thank you for your message! We'll get back to you within 24 hours (during business hours).",
      });
      formRef.current?.reset();
    } catch {
      setStatus({
        type: "error",
        message:
          "Sorry, there was an error sending your message. Please try again or contact us directly at info@fabdefense.co.uk",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-content-text uppercase tracking-wide mb-6">
        Send Us a Message
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-content-text mb-2"
            >
              First Name *
            </label>
            <input
              type="text"
              id="first-name"
              name="firstName"
              required
              className="w-full px-4 py-3 border border-content-border bg-white text-content-text focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors"
              placeholder="John"
            />
          </div>
          <div>
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-content-text mb-2"
            >
              Last Name *
            </label>
            <input
              type="text"
              id="last-name"
              name="lastName"
              required
              className="w-full px-4 py-3 border border-content-border bg-white text-content-text focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-content-text mb-2"
          >
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-content-border bg-white text-content-text focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors"
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-content-text mb-2"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full px-4 py-3 border border-content-border bg-white text-content-text focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors"
            placeholder="+44 20 1234 5678"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-content-text mb-2"
          >
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            required
            className="w-full px-4 py-3 border border-content-border bg-white text-content-text focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors appearance-none"
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="product">Product Question</option>
            <option value="order">Order Status</option>
            <option value="technical">Technical Support</option>
            <option value="wholesale">Wholesale/B2B</option>
            <option value="warranty">Warranty Claim</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-content-text mb-2"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full px-4 py-3 border border-content-border bg-white text-content-text focus:outline-none focus:border-fab-aqua focus:ring-1 focus:ring-fab-aqua/30 transition-colors resize-none"
            placeholder="Tell us how we can help you..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-4 bg-fab-aqua hover:bg-fab-aqua-hover text-fab-white font-bold uppercase tracking-wider text-sm transition-colors duration-300 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status && (
        <div className="mt-4">
          <div
            className={`p-4 rounded-lg border ${
              status.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {status.message}
          </div>
        </div>
      )}
    </div>
  );
}
