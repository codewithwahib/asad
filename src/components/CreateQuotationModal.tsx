"use client";

import { useState, useEffect } from "react";

interface ServiceItem {
  name: string;
  price: number;
  description: string;
  date: string;
  event: string; // ✅ per-service
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

interface Service {
  id: number;
  service_name: string;
  service_price: number;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  existingQuotations: Quotation[];
  quotation?: Quotation | null;
}

export default function CreateQuotationModal({
  onClose,
  onSuccess,
  existingQuotations,
  quotation,
}: Props) {
  const isEditing = !!quotation;

  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };
    fetchServices();
  }, []);

  let nextQuotationNumber = "0001";
  const safeQuotations = existingQuotations || [];
  if (safeQuotations.length > 0) {
    const maxNumber = Math.max(
      ...safeQuotations.map((q) => parseInt(q.quotation_number) || 0)
    );
    nextQuotationNumber = String(maxNumber + 1).padStart(4, "0");
  }

  const [form, setForm] = useState({
    quotation_number: isEditing
      ? quotation.quotation_number
      : nextQuotationNumber,
    client_name: isEditing ? quotation.client_name : "",
    client_email: isEditing ? quotation.client_email || "" : "",
    client_phone_number: isEditing ? quotation.client_phone_number || "" : "",
    discount: isEditing ? quotation.discount.toString() : "",
  });

  const [selectedServices, setSelectedServices] = useState<
    {
      name: string;
      price: string;
      description: string;
      date: string;
      event: string;
    }[]
  >(
    isEditing && Array.isArray(quotation.services) && quotation.services.length > 0
      ? quotation.services.map((s) => ({
          name: s.name || "",
          price: s.price != null ? String(s.price) : "",
          description: s.description || "",
          date: s.date || "",
          event: s.event || "",
        }))
      : [{ name: "", price: "", description: "", date: "", event: "" }]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleServiceChange = (
    index: number,
    field: "name" | "description" | "date" | "event",
    value: string
  ) => {
    const newServices = [...selectedServices];
    if (field === "name") {
      const serviceObj = services.find((s) => s.service_name === value);
      newServices[index] = {
        ...newServices[index],
        name: value,
        price: serviceObj ? serviceObj.service_price.toString() : "",
      };
    } else {
      newServices[index] = { ...newServices[index], [field]: value };
    }
    setSelectedServices(newServices);
  };

  const addService = () => {
    setSelectedServices([
      ...selectedServices,
      { name: "", price: "", description: "", date: "", event: "" },
    ]);
  };

  const removeService = (index: number) => {
    if (selectedServices.length === 1) return;
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const discount = parseFloat(form.discount) || 0;
  const subTotal = selectedServices.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  const totalPrice = Math.max(subTotal - discount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validServices = selectedServices.filter((s) => s.name && s.price);
    if (validServices.length === 0) {
      setError("Please select at least one service");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing
        ? `/api/quotations?id=${quotation.id}`
        : "/api/quotations";
      const method = isEditing ? "PATCH" : "POST";

      // ✅ event embedded inside each service object
      const servicesJsonb: ServiceItem[] = validServices.map((s) => ({
        name: s.name,
        price: parseFloat(s.price) || 0,
        description: s.description || "",
        date: s.date || "",
        event: s.event || "",
      }));

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotation_number: form.quotation_number,
          client_name: form.client_name,
          client_email: form.client_email,
          client_phone_number: form.client_phone_number,
          services: servicesJsonb,
          sub_total: subTotal,
          discount,
          total_price: totalPrice,
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
    "w-full border border-gray-300 px-3 py-1.5 text-xs text-black bg-white outline-none focus:border-black focus:ring-1 focus:ring-black tracking-wider disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black tracking-wider">
            {isEditing ? "Edit Quotation" : "Create Quotation"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 tracking-wider">
            <Field label="Quotation Number (Auto-generated)" required>
              <input
                name="quotation_number"
                value={form.quotation_number}
                readOnly
                disabled
                className={`${inputClass} bg-gray-100 cursor-not-allowed`}
              />
            </Field>
            <Field label="Client Name" required>
              <input
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Client Email" required>
              <input
                type="email"
                name="client_email"
                value={form.client_email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Client Phone" required>
              <input
                name="client_phone_number"
                value={form.client_phone_number}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
          </div>

          {/* SERVICES */}
          <div className="border-t border-gray-300 pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black tracking-wider">
                Services
              </span>
              <button
                type="button"
                onClick={addService}
                className="text-xs font-semibold text-black hover:underline"
              >
                + Add Service
              </button>
            </div>

            {selectedServices.map((srv, index) => (
              <div
                key={index}
                className="border border-gray-200 p-3 mb-3 bg-gray-50 relative"
              >
                <div className="flex gap-2 items-end mb-2 pr-6">
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Service Name
                    </label>
                    <select
                      value={srv.name}
                      onChange={(e) =>
                        handleServiceChange(index, "name", e.target.value)
                      }
                      required
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select a service...
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.service_name}>
                          {s.service_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/3">
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={srv.price}
                      readOnly
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* ✅ Event per-service */}
                <div className="flex gap-2 mb-2">
                  <div className="w-1/2">
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Event
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wedding, Reception..."
                      value={srv.event}
                      onChange={(e) =>
                        handleServiceChange(index, "event", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={srv.date}
                      onChange={(e) =>
                        handleServiceChange(index, "date", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter details..."
                    value={srv.description}
                    onChange={(e) =>
                      handleServiceChange(index, "description", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {selectedServices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    title="Remove"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-gray-300 pt-4">
            <Field label="Discount">
              <input
                type="number"
                step="0.01"
                min="0"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider">
            <div className="flex justify-between py-1">
              <span className="text-gray-700">Sub Total:</span>
              <span className="font-medium text-black">
                Rs. {subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-700">Discount:</span>
              <span className="font-medium text-black">
                - Rs. {discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 py-1 font-bold text-black">
              <span>Total Price:</span>
              <span>Rs. {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : isEditing
                ? "Update Quotation"
                : "Create Quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block tracking-wider">
      <span className="mb-1 block text-xs font-medium text-black tracking-wider">
        {label}{" "}
        {required && <span className="text-red-500 tracking-wider">*</span>}
      </span>
      {children}
    </label>
  );
}