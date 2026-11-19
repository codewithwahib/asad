"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// ✅ per-service (same shape as quotations.services)
interface ServiceItem {
  name: string;
  price: number;
  description: string;
  date: string;
  event: string;
}

interface Invoice {
  id: number;
  quotation_number: string;
  client_name: string;
  client_email: string | null;
  client_phone_number: string | null;
  service_name: string;
  service_price: number;
  service_description: string | null;
  service_date: string | null;
  sub_total: number;
  discount: number;
  total_price: number;
  received_amount: number;
  remaining_amount: number;
  created_at: string;
  services?: ServiceItem[] | null;
}

type FilterMode = "all" | "name" | "date" | "pending" | "paid";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingPayment, setEditingPayment] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterClientName, setFilterClientName] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Helper: get per-service rows for an invoice, preferring `services` jsonb
  const getServiceRows = (
    inv: Invoice
  ): {
    name: string;
    event: string;
    description: string;
    date: string;
    amount: number;
  }[] => {
    if (Array.isArray(inv.services) && inv.services.length > 0) {
      return inv.services.map((s) => ({
        name: s.name || "",
        event: s.event || "",
        description: s.description || "",
        date: s.date || "",
        amount: Number(s.price) || 0,
      }));
    }

    const names = inv.service_name ? inv.service_name.split(", ") : [];
    const descs = inv.service_description
      ? inv.service_description.split(", ")
      : [];
    const dates = inv.service_date ? inv.service_date.split(", ") : [];
    const perPrice =
      names.length > 0 ? Number(inv.service_price) / names.length : 0;

    return names.map((name, idx) => ({
      name,
      event: "",
      description: descs[idx] || "",
      date: dates[idx] || "",
      amount: perPrice,
    }));
  };

  // ✅ Search preview "Service (Event), ..."
  const servicesPreview = (inv: Invoice) => {
    const rows = getServiceRows(inv);
    if (rows.length) {
      return rows
        .map((r) => (r.event ? `${r.name} (${r.event})` : r.name))
        .join(", ");
    }
    return inv.service_name || "";
  };

  // ✅ Check if invoice has any service whose event date matches the picked date
  const hasEventDate = (inv: Invoice, date: string) => {
    if (!date) return true;
    const rows = getServiceRows(inv);
    return rows.some((r) => {
      if (!r.date) return false;
      const d = new Date(r.date).toISOString().slice(0, 10);
      return d === date;
    });
  };

  // ✅ PRINT ALL INVOICES (report) — prints FILTERED invoices
  const handlePrintAll = () => {
    if (filteredInvoices.length === 0) {
      alert("No invoices to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const grandTotal = filteredInvoices.reduce(
      (sum, i) => sum + Number(i.total_price || 0),
      0
    );
    const grandReceived = filteredInvoices.reduce(
      (sum, i) => sum + Number(i.received_amount || 0),
      0
    );
    const grandRemaining = filteredInvoices.reduce(
      (sum, i) => sum + Number(i.remaining_amount || 0),
      0
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Invoices Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
            * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
            body { margin: 0; padding: 8px; color: #000; background: white; font-size: 11px; }
            .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; padding: 20px; min-height: 95vh; display: flex; flex-direction: column; }
            .header-section { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .logo-img { height: 70px; object-fit: contain; }
            .title-section { text-align: right; }
            .main-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
            .sub-title { font-size: 11px; color: #555; margin-top: 4px; }
            .data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
            .data-table th { background: #f0f0f0; padding: 7px 6px; text-align: left; font-weight: bold; border: 1px solid #000; font-size: 9px; text-transform: uppercase; }
            .data-table td { padding: 6px; border: 1px solid #000; vertical-align: top; }
            .numeric-cell { text-align: right; }
            .center-cell { text-align: center; }
            .received-cell { color: #15803d; font-weight: bold; }
            .remaining-cell { color: #dc2626; font-weight: bold; }
            .footer-totals { background: #e8f5e8 !important; font-weight: bold; font-size: 11px; }
            .datetime-footer { text-align: left; padding-top: 10px; margin-top: auto; border-top: 1px solid #ccc; font-size: 10px; color: #555; }
            @media print { body { padding: 0; } .print-container { border: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header-section">
              <div>
                <img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
              </div>
              <div class="title-section">
                <div class="main-title">Invoices Report</div>
                <div class="sub-title">Total ${filteredInvoices.length} invoice(s)</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">S.No</th>
                  <th style="width:80px">Inv.No</th>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Services</th>
                  <th style="width:80px" class="numeric-cell">Sub Total</th>
                  <th style="width:60px" class="numeric-cell">Disc.</th>
                  <th style="width:80px" class="numeric-cell">Total</th>
                  <th style="width:80px" class="numeric-cell">Received</th>
                  <th style="width:80px" class="numeric-cell">Remaining</th>
                  <th style="width:80px">Event Date</th>
                </tr>
              </thead>
              <tbody>
                ${filteredInvoices
                  .map((inv, idx) => {
                    const rows = getServiceRows(inv);
                    const eventDates = rows
                      .map((r) => r.date)
                      .filter(Boolean)
                      .map((d) =>
                        new Date(d)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .replace(/ /g, "-")
                      );
                    const dateStr = eventDates.length
                      ? Array.from(new Set(eventDates)).join(", ")
                      : "-";
                    const preview = servicesPreview(inv) || "-";
                    return `
                      <tr>
                        <td class="center-cell">${idx + 1}</td>
                        <td>${inv.quotation_number}</td>
                        <td>${inv.client_name}</td>
                        <td>${inv.client_phone_number || "-"}</td>
                        <td>${preview}</td>
                        <td class="numeric-cell">${Number(inv.sub_total).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(inv.discount).toFixed(2)}</td>
                        <td class="numeric-cell"><b>${Number(inv.total_price).toFixed(2)}</b></td>
                        <td class="numeric-cell received-cell">${Number(inv.received_amount).toFixed(2)}</td>
                        <td class="numeric-cell remaining-cell">${Number(inv.remaining_amount).toFixed(2)}</td>
                        <td class="center-cell">${dateStr}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
              <tfoot>
                <tr class="footer-totals">
                  <td colspan="5" class="numeric-cell">GRAND TOTALS:</td>
                  <td class="numeric-cell">Rs ${grandTotal.toFixed(2)}</td>
                  <td></td>
                  <td class="numeric-cell">Rs ${grandTotal.toFixed(2)}</td>
                  <td class="numeric-cell received-cell">Rs ${grandReceived.toFixed(2)}</td>
                  <td class="numeric-cell remaining-cell">Rs ${grandRemaining.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div class="datetime-footer">
              Printed on: ${new Date().toLocaleDateString("en-IN")} | ${new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  // ✅ PRINT SINGLE INVOICE (with Terms & Conditions points at the bottom)
  const handlePrint = (inv: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the receipt.");
      return;
    }

    const rows = getServiceRows(inv);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${inv.quotation_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
            * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
            body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
            .print-container { max-width: 1000px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; padding: 20px; }
            .header-section { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .logo-img { height: 80px; object-fit: contain; }
            .title-section { text-align: right; margin-top: 10px; }
            .main-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
            .info-section { margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
            .info-table td { padding: 4px; vertical-align: top; }
            .info-label { font-weight: bold; white-space: nowrap; }
            .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            .data-table th { background: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; border: 1px solid #000; }
            .data-table td { padding: 6px 8px; border: 1px solid #000; }
            .numeric-cell { text-align: right; }
            .center-cell { text-align: center; }
            .total-row { background: #e8f5e8 !important; font-weight: bold; font-size: 12px; }
            .received-row { color: #15803d; font-weight: bold; }
            .remaining-row { color: #dc2626; font-weight: bold; }
            /* ✅ Terms & Conditions — compact, points only */
            .terms-section { margin-top: 14px; padding-top: 10px; border-top: 1px solid #000; }
            .terms-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
            .terms-list { margin: 0; padding-left: 14px; font-size: 9px; line-height: 1.55; color: #222; }
            .terms-list li { margin-bottom: 3px; }
            .datetime-footer { text-align: left; padding-top: 10px; margin-top: auto; border-top: 1px solid #ccc; font-size: 10px; color: #555; }
            @media print { body { padding: 0; } .print-container { border: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header-section">
              <div>
                <img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
              </div>
              <div class="title-section">
                <div class="main-title">Invoice</div>
              </div>
            </div>

            <div class="info-section">
              <table class="info-table"><tbody>
                <tr>
                  <td class="info-label" style="width:15%">Client Name:</td><td style="width:35%">${inv.client_name}</td>
                  <td class="info-label" style="width:15%">Invoice No:</td><td style="width:35%">${inv.quotation_number}</td>
                </tr>
                <tr>
                  <td class="info-label">Phone Number:</td><td>${inv.client_phone_number || "N/A"}</td>
                  <td class="info-label">Date Issued:</td><td>${new Date(inv.created_at)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(/ /g, "-")}</td>
                </tr>
                <tr>
                  <td class="info-label">Email Address:</td><td colspan="3">${inv.client_email || "N/A"}</td>
                </tr>
              </tbody></table>
            </div>

            <div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:50px">S.No</th>
                    <th>Service Description</th>
                    <th style="width:120px">Event</th>
                    <th style="width:120px">Date</th>
                    <th style="width:100px">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map((r, idx) => {
                      const dateStr = r.date
                        ? new Date(r.date)
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            .replace(/ /g, "-")
                        : "-";
                      return `
                      <tr>
                        <td class="center-cell">${idx + 1}</td>
                        <td>
                          <div style="font-weight:bold; font-size:12px;">${r.name}</div>
                          ${
                            r.description
                              ? `<div style="font-size:10px; color:#555; font-style:italic; margin-top:2px;">"${r.description}"</div>`
                              : ""
                          }
                        </td>
                        <td class="center-cell">${r.event || "-"}</td>
                        <td class="center-cell">${dateStr}</td>
                        <td class="numeric-cell">${r.amount.toFixed(2)}</td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="numeric-cell" style="font-weight:bold">Sub Total:</td>
                    <td class="numeric-cell" style="font-weight:bold">Rs ${Number(inv.sub_total).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="4" class="numeric-cell" style="color:red">Discount:</td>
                    <td class="numeric-cell" style="color:red">- Rs ${Number(inv.discount).toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="4" class="numeric-cell">GRAND TOTAL:</td>
                    <td class="numeric-cell">Rs ${Number(inv.total_price).toFixed(2)}</td>
                  </tr>
                  <tr class="received-row">
                    <td colspan="4" class="numeric-cell">RECEIVED:</td>
                    <td class="numeric-cell">Rs ${Number(inv.received_amount).toFixed(2)}</td>
                  </tr>
                  <tr class="remaining-row">
                    <td colspan="4" class="numeric-cell">REMAINING:</td>
                    <td class="numeric-cell">Rs ${Number(inv.remaining_amount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- ✅ Terms & Conditions (compact points, no headings) -->
            <div class="terms-section">
              <div class="terms-title">Terms &amp; Conditions</div>
              <ul class="terms-list">
                <li>A 50% advance payment is required to confirm the booking. The remaining 50% balance must be paid on or before the event day. Booking is confirmed only after receipt of the advance. Advance is non-refundable on client cancellation.</li>
                <li>Photography and videography services will be provided according to the agreed package. Additional hours or extra coverage will be charged separately. The client must inform us in advance about any changes to the event schedule or venue.</li>
                <li>Edited photographs will be delivered within 15–20 working days. Edited videos/highlights will be delivered within 30–45 working days. Final deliverables will be shared via Google Drive or another agreed platform. RAW photos and unedited footage are not included unless agreed separately.</li>
                <li>Any additional services — extra photographers, videographers, albums, prints, or additional editing — will be charged separately. Any changes to the agreed package may result in additional charges.</li>
                <li>In case of cancellation, the advance payment is non-refundable. Rescheduling is subject to availability. Any additional expenses due to rescheduling may be charged separately.</li>
                <li>The client is responsible for providing correct event date, time, and venue details, and for ensuring the photography team has proper access to the venue. Any delay caused by the client or event arrangements may affect coverage time.</li>
                <li>Final edited photos and videos will be retained for up to 60 days after delivery. Clients are responsible for downloading and keeping backups. RAW files and original footage are not guaranteed to be stored permanently.</li>
                <li>All photographs and videos remain the intellectual property of the photographer. Selected photos may be used for portfolio, website, and social media promotion subject to client consent. Commercial use or resale requires prior written permission.</li>
                <li>All payments must be made through the agreed payment method. Any outstanding balance must be cleared before final delivery of the agreed photographs and videos.</li>
              </ul>
            </div>

            <div class="datetime-footer">
              Printed on: ${new Date().toLocaleDateString("en-IN")} | ${new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete invoice");
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice. Check your API route.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterSelect = (mode: FilterMode) => {
    setFilterMode(mode);
    setFilterDate("");
    setFilterClientName("");
    setSearchTerm("");
    setIsFilterOpen(false);
  };

  // ✅ Unique sorted client names for the dropdown
  const uniqueClientNames = useMemo(() => {
    const names = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.client_name) names.add(inv.client_name.trim());
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  // ✅ Filtered invoices (search applies only in "all" mode)
  const filteredInvoices = invoices.filter((inv) => {
    if (filterMode === "name") {
      if (!filterClientName) return true;
      return inv.client_name.trim() === filterClientName;
    }

    // ✅ Filter mode: EVENT DATE (matches any service's date)
    if (filterMode === "date") {
      if (!filterDate) return true;
      return hasEventDate(inv, filterDate);
    }

    if (filterMode === "pending") {
      return Number(inv.remaining_amount) > 0;
    }

    if (filterMode === "paid") {
      return Number(inv.remaining_amount) === 0;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        inv.quotation_number.toLowerCase().includes(term) ||
        inv.client_name.toLowerCase().includes(term) ||
        (inv.client_email && inv.client_email.toLowerCase().includes(term)) ||
        (inv.client_phone_number && inv.client_phone_number.includes(term)) ||
        servicesPreview(inv).toLowerCase().includes(term) ||
        new Date(inv.created_at)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toLowerCase()
          .includes(term);
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 text-black tracking-wider">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-wider text-black">
            Invoices
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
            >
              Quotations
            </Link>

            <Link
              href="/services"
              className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
            >
              Services
            </Link>

            <Link
              href="/bookings"
              className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
            >
              Bookings
            </Link>

            <button
              onClick={handlePrintAll}
              className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              title="Print All Invoices"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                />
              </svg>
              Print All
            </button>

            <button
              onClick={fetchInvoices}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
              title="Refresh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>

            {/* ✅ Search Bar */}
            <div className="relative">
              <div className="flex h-[30px] items-center rounded-full border border-black bg-white px-3 shadow-sm transition focus-within:bg-black focus-within:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 mr-2 text-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-32 bg-transparent text-xs tracking-wider outline-none placeholder:text-gray-500 focus:placeholder:text-gray-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-current hover:opacity-70"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-3 h-3"
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
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
                title="Filter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                  />
                </svg>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 border border-gray-300 bg-white shadow-lg z-10 rounded-xl overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleFilterSelect("all")}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded-lg ${
                        filterMode === "all"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      All Invoices
                    </button>
                    <button
                      onClick={() => handleFilterSelect("name")}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded-lg ${
                        filterMode === "name"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      By Client Name
                    </button>
                    <button
                      onClick={() => handleFilterSelect("date")}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded-lg ${
                        filterMode === "date"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      By Event Date
                    </button>
                    <button
                      onClick={() => handleFilterSelect("pending")}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded-lg ${
                        filterMode === "pending"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      Pending Payment
                    </button>
                    <button
                      onClick={() => handleFilterSelect("paid")}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded-lg ${
                        filterMode === "paid"
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-100"
                      }`}
                    >
                      Fully Paid
                    </button>

                    {filterMode === "name" && (
                      <div className="px-2 pt-2 pb-1">
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">
                          Select client
                        </label>
                        <select
                          value={filterClientName}
                          onChange={(e) => setFilterClientName(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black bg-white"
                        >
                          <option value="">All clients</option>
                          {uniqueClientNames.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* ✅ Event date picker when date mode is active */}
                    {filterMode === "date" && (
                      <div className="px-2 pt-2 pb-1">
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-gray-500">
                          Pick event date
                        </label>
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
                        />
                      </div>
                    )}

                    {(filterMode !== "all" ||
                      filterDate ||
                      filterClientName ||
                      searchTerm) && (
                      <button
                        onClick={() => {
                          setFilterMode("all");
                          setFilterDate("");
                          setFilterClientName("");
                          setSearchTerm("");
                          setIsFilterOpen(false);
                        }}
                        className="mt-1 w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-[11px] tracking-wider">
            <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase tracking-wider text-black">
              <tr>
                <th className="px-2 py-2 tracking-wider">Inv.No</th>
                <th className="px-2 py-2 tracking-wider">Client</th>
                <th className="px-2 py-2 tracking-wider">Email</th>
                <th className="px-2 py-2 tracking-wider">Phone</th>
                <th className="px-2 py-2 tracking-wider">Services / Events</th>
                <th className="px-2 py-2 text-right tracking-wider">
                  Sub Total
                </th>
                <th className="px-2 py-2 text-right tracking-wider">Disc.</th>
                <th className="px-2 py-2 text-right tracking-wider">Total</th>
                <th className="px-2 py-2 text-right tracking-wider">
                  Received
                </th>
                <th className="px-2 py-2 text-right tracking-wider">
                  Remaining
                </th>
                <th className="px-2 py-2 tracking-wider">Event Date</th>
                <th className="px-2 py-2 text-center tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: 12 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-2 py-2">
                        <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src="/no.png"
                        alt="No Invoices"
                        width={192}
                        height={192}
                        className="w-48 h-auto mb-4 object-contain opacity-80"
                        priority
                      />
                      <p className="text-sm font-semibold text-black tracking-wider">
                        {searchTerm ||
                        filterMode !== "all" ||
                        filterClientName ||
                        filterDate
                          ? "No matching invoices"
                          : "No Invoices"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const rowsForDate = getServiceRows(inv);
                  const eventDates = Array.from(
                    new Set(
                      rowsForDate
                        .map((r) => r.date)
                        .filter(Boolean)
                        .map((d) =>
                          new Date(d)
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })
                            .replace(/ /g, "-")
                        )
                    )
                  );
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 font-medium text-black tracking-wider">
                        {inv.quotation_number}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[100px]"
                        title={inv.client_name}
                      >
                        {inv.client_name}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[120px]"
                        title={inv.client_email || ""}
                      >
                        {inv.client_email || "—"}
                      </td>
                      <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                        {inv.client_phone_number || "—"}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[200px]"
                        title={servicesPreview(inv)}
                      >
                        {servicesPreview(inv) || "—"}
                      </td>
                      <td className="px-2 py-2 text-right text-black tracking-wider">
                        {Number(inv.sub_total).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right text-black tracking-wider">
                        {Number(inv.discount).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right font-bold text-black tracking-wider">
                        {Number(inv.total_price).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right text-green-700 font-medium tracking-wider">
                        {Number(inv.received_amount).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right text-red-600 font-medium tracking-wider">
                        {Number(inv.remaining_amount).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700 tracking-wider">
                        {eventDates.length ? eventDates.join(", ") : "—"}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingPayment(inv)}
                            className="text-green-600 hover:text-green-800 transition-colors p-1"
                            title="Update Received"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="text-gray-500 hover:text-black transition-colors p-1"
                            title="View"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handlePrint(inv)}
                            className="text-gray-500 hover:text-black transition-colors p-1"
                            title="Print / PDF"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                              />
                            </svg>
                          </button>

                          {deletingId === inv.id ? (
                            <div className="flex items-center justify-center w-3.5 h-3.5">
                              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-3.5 h-3.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal — inline */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
              <div>
                <h2 className="text-lg font-bold text-black tracking-wider">
                  Invoice {viewingInvoice.quotation_number}
                </h2>
                <p className="text-xs text-gray-500 tracking-wider mt-0.5">
                  Issued on{" "}
                  {new Date(viewingInvoice.created_at)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(/ /g, "-")}
                </p>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black tracking-wider transition-colors"
              >
                ×
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-gray-300 pb-3">
              <div>
                <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Client Name
                </span>
                <span className="text-black font-medium tracking-wider">
                  {viewingInvoice.client_name}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Invoice No
                </span>
                <span className="text-black font-medium tracking-wider">
                  {viewingInvoice.quotation_number}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Email
                </span>
                <span className="text-black tracking-wider">
                  {viewingInvoice.client_email || "—"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Phone
                </span>
                <span className="text-black tracking-wider">
                  {viewingInvoice.client_phone_number || "—"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300">
              <table className="min-w-full text-[11px] tracking-wider">
                <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase text-black">
                  <tr>
                    <th className="px-2 py-2 tracking-wider">Service</th>
                    <th className="px-2 py-2 tracking-wider w-24">Event</th>
                    <th className="px-2 py-2 tracking-wider w-28">Date</th>
                    <th className="px-2 py-2 tracking-wider text-right w-24">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {getServiceRows(viewingInvoice).map((r, idx) => {
                    const dt = r.date;
                    return (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-black tracking-wider">
                          <div className="font-semibold">{r.name}</div>
                          {r.description && (
                            <div className="text-[10px] text-gray-500 italic mt-0.5">
                              &quot;{r.description}&quot;
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                          {r.event || "-"}
                        </td>
                        <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                          {dt
                            ? new Date(dt)
                                .toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                .replace(/ /g, "-")
                            : "-"}
                        </td>
                        <td className="px-2 py-2 text-right text-black tracking-wider">
                          {r.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 ml-auto w-full max-w-xs bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
              <div className="flex justify-between py-1 tracking-wider">
                <span className="text-gray-700 tracking-wider">Sub Total:</span>
                <span className="font-medium text-black tracking-wider">
                  Rs. {Number(viewingInvoice.sub_total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 tracking-wider">
                <span className="text-gray-700 tracking-wider">Discount:</span>
                <span className="font-medium text-red-600 tracking-wider">
                  - Rs. {Number(viewingInvoice.discount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-300 py-1 font-bold text-black tracking-wider">
                <span className="tracking-wider">Total Price:</span>
                <span className="tracking-wider">
                  Rs. {Number(viewingInvoice.total_price).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-green-700 font-medium tracking-wider">
                <span className="tracking-wider">Received:</span>
                <span className="tracking-wider">
                  Rs. {Number(viewingInvoice.received_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-red-600 font-medium tracking-wider">
                <span className="tracking-wider">Remaining:</span>
                <span className="tracking-wider">
                  Rs. {Number(viewingInvoice.remaining_amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewingInvoice(null)}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Update Received Modal — inline */}
      {editingPayment && (
        <UpdateReceivedModal
          invoice={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={() => {
            setEditingPayment(null);
            fetchInvoices();
          }}
        />
      )}
    </main>
  );
}

/* =========================================================
   ✅ UpdateReceivedModal — inline component
   ========================================================= */
function UpdateReceivedModal({
  invoice,
  onClose,
  onSuccess,
}: {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const total = Number(invoice.total_price) || 0;
  const [received, setReceived] = useState<number>(
    Number(invoice.received_amount) || 0
  );
  const [saving, setSaving] = useState(false);

  const remaining = Math.max(total - received, 0);
  const isValid = received >= 0 && received <= total;

  const handleSave = async () => {
    if (!isValid) {
      alert(`Received amount must be between 0 and ${total.toFixed(2)}`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invoice.id,
          received_amount: received,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update received amount");
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update received amount");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white p-6 shadow-xl tracking-wider rounded-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
          <div>
            <h2 className="text-lg font-bold text-black tracking-wider">
              Update Received
            </h2>
            <p className="text-xs text-gray-500 tracking-wider mt-0.5">
              Invoice {invoice.quotation_number} · {invoice.client_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black tracking-wider transition-colors"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs tracking-wider">
          <div className="flex justify-between py-1">
            <span className="text-gray-700">Total Price:</span>
            <span className="font-semibold text-black">
              Rs. {total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-green-700">
            <span>Already Received:</span>
            <span className="font-semibold">
              Rs. {(Number(invoice.received_amount) || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-red-600">
            <span>Current Remaining:</span>
            <span className="font-semibold">
              Rs. {(Number(invoice.remaining_amount) || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
            New Received Amount
          </label>
          <input
            type="number"
            min={0}
            max={total}
            step="0.01"
            value={received}
            onChange={(e) => setReceived(Number(e.target.value))}
            className={`w-full rounded-lg border px-3 py-2 text-sm tracking-wider text-black outline-none ${
              isValid
                ? "border-gray-300 focus:border-black"
                : "border-red-500 focus:border-red-500"
            }`}
          />
          {!isValid && (
            <p className="mt-1 text-[10px] text-red-600 tracking-wider">
              Must be between 0 and {total.toFixed(2)}
            </p>
          )}
        </div>

        <div className="mb-4 flex justify-between bg-white p-3 rounded-xl border border-gray-200 text-xs tracking-wider">
          <span className="text-gray-700">New Remaining:</span>
          <span className="font-bold text-red-600">
            Rs. {remaining.toFixed(2)}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setReceived(0)}
            className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
            disabled={saving}
          >
            Reset to 0
          </button>
          <button
            onClick={() => setReceived(total)}
            className="rounded-full border border-gray-300 px-3 py-1 text-[10px] font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
            disabled={saving}
          >
            Mark Fully Paid
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}