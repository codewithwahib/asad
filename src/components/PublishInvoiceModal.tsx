"use client";

import { useState } from "react";

interface ServiceItem {
  name: string;
  price: number;
  description: string;
  date: string;
}

interface Quotation {
  id: number;
  quotation_number: string;
  client_name: string;
  client_email: string | null;
  client_phone_number: string | null;
  services: ServiceItem[];
  sub_total: number;
  discount: number;
  total_price: number;
  created_at: string;
}

interface Props {
  quotation: Quotation;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PublishInvoiceModal({
  quotation,
  onClose,
  onSuccess,
}: Props) {
  const [receivedAmount, setReceivedAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = Number(quotation.total_price);
  const received = parseFloat(receivedAmount) || 0;
  const remaining = Math.max(totalPrice - received, 0);

  const handlePublish = async () => {
    setError(null);

    if (received > totalPrice) {
      setError("Received amount cannot exceed total price");
      return;
    }

    setSubmitting(true);
    try {
      const serviceList = Array.isArray(quotation.services)
        ? quotation.services
        : [];

      // Flatten jsonb back to comma-strings for invoices table
      const serviceNames = serviceList.map((s) => s.name).join(", ");
      const serviceDescriptions = serviceList
        .map((s) => s.description || "")
        .join(", ");
      const serviceDates = serviceList.map((s) => s.date || "").join(", ");

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ---- invoice fields (flat) ----
          quotation_number: quotation.quotation_number,
          client_name: quotation.client_name,
          client_email: quotation.client_email,
          client_phone_number: quotation.client_phone_number,
          service_name: serviceNames,
          service_price: Number(quotation.sub_total),
          service_description: serviceDescriptions || null,
          service_date: serviceDates || null,
          sub_total: Number(quotation.sub_total),
          discount: Number(quotation.discount),
          total_price: totalPrice,
          received_amount: received,
          remaining_amount: remaining,

          // ---- costing fields ----
          // ✅ raw services array → stored in costing.costing jsonb
          services: serviceList,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      onSuccess();
    } catch (err: any) {
      // Friendly message for the unique-constraint error
      if (err.message?.includes("duplicate key")) {
        setError(
          "An invoice with this quotation number already exists. Change the quotation number or remove the unique constraint."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 px-3 py-1.5 text-xs text-black bg-white outline-none focus:border-black focus:ring-1 focus:ring-black tracking-wider rounded-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black tracking-wider">
            Publish to Invoice
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black disabled:opacity-50 tracking-wider transition-colors"
          >
            ×
          </button>
        </div>

        <p className="mb-4 text-xs text-gray-600 tracking-wider">
          This will create an invoice for quotation{" "}
          <span className="font-semibold text-black">
            {quotation.quotation_number}
          </span>{" "}
          for{" "}
          <span className="font-semibold text-black">
            {quotation.client_name}
          </span>
          .
        </p>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 tracking-wider rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-black tracking-wider">
              Total Price
            </label>
            <div className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-black tracking-wider rounded-lg">
              Rs. {totalPrice.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-black tracking-wider">
              Received Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={totalPrice}
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-black tracking-wider">
              Remaining
            </label>
            <div className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-red-600 tracking-wider rounded-lg">
              Rs. {remaining.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 disabled:opacity-50 tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={submitting}
            className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60 tracking-wider transition-colors"
          >
            {submitting ? "Publishing..." : "Confirm & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}