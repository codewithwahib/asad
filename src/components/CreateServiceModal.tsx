"use client";

import { useState } from "react";

interface Service {
  id: number;
  service_name: string;
  service_price: number;
  created_at: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  service?: Service | null;
}

export default function CreateServiceModal({
  onClose,
  onSuccess,
  service,
}: Props) {
  const isEditing = !!service;

  const [form, setForm] = useState({
    service_name: isEditing ? service.service_name : "",
    service_price: isEditing ? service.service_price.toString() : "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const url = isEditing ? `/api/services?id=${service.id}` : "/api/services";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: form.service_name,
          service_price: parseFloat(form.service_price) || 0,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 px-3 py-1.5 text-xs text-black bg-white outline-none focus:border-black focus:ring-1 focus:ring-black tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl tracking-wider">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black tracking-wider">
            {isEditing ? "Edit Service" : "Create Service"}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-xl leading-none text-gray-400 hover:text-black disabled:opacity-50 tracking-wider"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 tracking-wider">
          <label className="block tracking-wider">
            <span className="mb-1 block text-xs font-medium text-black tracking-wider">
              Service Name <span className="text-red-500">*</span>
            </span>
            <input
              name="service_name"
              value={form.service_name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </label>

          <label className="block tracking-wider">
            <span className="mb-1 block text-xs font-medium text-black tracking-wider">
              Service Price <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="service_price"
              value={form.service_price}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </label>

          <div className="flex justify-end gap-3 pt-2 tracking-wider">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 disabled:opacity-50 tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60 tracking-wider"
            >
              {submitting ? "Saving..." : isEditing ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}