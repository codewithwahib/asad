"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Protection import

// ✅ per-service shape (same as quotations / invoices)
interface ServiceItem {
  name: string;
  price: number;
  description: string;
  date: string;
  event: string;
}

interface Booking {
  id: number;
  invoice_number: string;
  client_name: string;
  event_date: string | null;
  event_location: string | null;
  photographer_videographer: string | null;
  timing: string | null;
  outdoor_location_timing: string | null;
  details: ServiceItem[] | null; // ✅ jsonb array
  created_at: string;
}

type FilterMode = "all" | "name" | "date";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterClientName, setFilterClientName] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking. Check your API route.");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Services preview "Name (Event), ..." from details jsonb
  const servicesPreview = (b: Booking) => {
    if (Array.isArray(b.details) && b.details.length > 0) {
      return b.details
        .map((s) => (s.event ? `${s.name} (${s.event})` : s.name))
        .join(", ");
    }
    return "";
  };

  // ✅ PRINT single booking
  const handlePrint = (b: Booking) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const rows = Array.isArray(b.details) ? b.details : [];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking - ${b.invoice_number}</title>
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
                <div class="main-title">Booking</div>
              </div>
            </div>

            <div class="info-section">
              <table class="info-table"><tbody>
                <tr>
                  <td class="info-label" style="width:15%">Client Name:</td><td style="width:35%">${b.client_name}</td>
                  <td class="info-label" style="width:15%">Invoice No:</td><td style="width:35%">${b.invoice_number}</td>
                </tr>
                <tr>
                  <td class="info-label">Event Date:</td><td>${b.event_date
                    ? new Date(b.event_date)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/ /g, "-")
                    : "N/A"}</td>
                  <td class="info-label">Event Location:</td><td>${b.event_location || "N/A"}</td>
                </tr>
                <tr>
                  <td class="info-label">Photographer / Videographer:</td><td>${b.photographer_videographer || "N/A"}</td>
                  <td class="info-label">Timing:</td><td>${b.timing || "N/A"}</td>
                </tr>
                <tr>
                  <td class="info-label">Outdoor Location / Timing:</td><td colspan="3">${b.outdoor_location_timing || "N/A"}</td>
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
                    .map((srv, idx) => {
                      const dateStr = srv.date
                        ? new Date(srv.date)
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
                          <div style="font-weight:bold; font-size:12px;">${srv.name || ""}</div>
                          ${
                            srv.description
                              ? `<div style="font-size:10px; color:#555; font-style:italic; margin-top:2px;">"${srv.description}"</div>`
                              : ""
                          }
                        </td>
                        <td class="center-cell">${srv.event || "-"}</td>
                        <td class="center-cell">${dateStr}</td>
                        <td class="numeric-cell">${Number(srv.price || 0).toFixed(2)}</td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
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
    bookings.forEach((b) => {
      if (b.client_name) names.add(b.client_name.trim());
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [bookings]);

  // ✅ Filtered bookings (search applies only in "all" mode)
  const filteredBookings = bookings.filter((b) => {
    if (filterMode === "name") {
      if (!filterClientName) return true;
      return b.client_name.trim() === filterClientName;
    }

    if (filterMode === "date") {
      if (!filterDate) return true;
      if (!b.event_date) return false;
      const d = new Date(b.event_date).toISOString().slice(0, 10);
      return d === filterDate;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        b.invoice_number.toLowerCase().includes(term) ||
        b.client_name.toLowerCase().includes(term) ||
        (b.event_location && b.event_location.toLowerCase().includes(term)) ||
        (b.photographer_videographer &&
          b.photographer_videographer.toLowerCase().includes(term)) ||
        (b.timing && b.timing.toLowerCase().includes(term)) ||
        (b.outdoor_location_timing &&
          b.outdoor_location_timing.toLowerCase().includes(term)) ||
        servicesPreview(b).toLowerCase().includes(term) ||
        (b.event_date &&
          new Date(b.event_date)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toLowerCase()
            .includes(term));
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <ProtectedRoute> {/* ✅ Yahan se protection shuru */}
      <main className="min-h-screen bg-white p-4 md:p-6 text-black tracking-wider">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl font-bold tracking-wider text-black">
              Bookings
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Quotations
              </Link>
              <Link
                href="/invoices"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Invoices
              </Link>
              <Link
                href="/costing"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Costing
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Services
              </Link>

              <button
                onClick={fetchBookings}
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
                        All Bookings
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
                  <th className="px-2 py-2 tracking-wider">Event Date</th>
                  <th className="px-2 py-2 tracking-wider">Event Location</th>
                  <th className="px-2 py-2 tracking-wider">Photographer / Videographer</th>
                  <th className="px-2 py-2 tracking-wider">Timing</th>
                  <th className="px-2 py-2 tracking-wider">Outdoor</th>
                  <th className="px-2 py-2 tracking-wider">Services / Events</th>
                  <th className="px-2 py-2 text-center tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {Array.from({ length: 9 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-2 py-2">
                          <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/no.png"
                          alt="No Bookings"
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
                            ? "No matching bookings"
                            : "No Bookings"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 font-medium text-black tracking-wider">
                        {b.invoice_number}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[100px]"
                        title={b.client_name}
                      >
                        {b.client_name}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700 tracking-wider">
                        {b.event_date
                          ? new Date(b.event_date)
                              .toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              })
                              .replace(/ /g, "-")
                          : "—"}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[140px]"
                        title={b.event_location || ""}
                      >
                        {b.event_location || "—"}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[160px]"
                        title={b.photographer_videographer || ""}
                      >
                        {b.photographer_videographer || "—"}
                      </td>
                      <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                        {b.timing || "—"}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[160px]"
                        title={b.outdoor_location_timing || ""}
                      >
                        {b.outdoor_location_timing || "—"}
                      </td>
                      <td
                        className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[200px]"
                        title={servicesPreview(b)}
                      >
                        {servicesPreview(b) || "—"}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingBooking(b)}
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

                          {/* ✅ Edit button */}
                          <button
                            onClick={() => setEditingBooking(b)}
                            className="text-gray-500 hover:text-black transition-colors p-1"
                            title="Edit"
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
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handlePrint(b)}
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

                          {deletingId === b.id ? (
                            <div className="flex items-center justify-center w-3.5 h-3.5">
                              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(b.id)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ View Booking Modal */}
        {viewingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-black tracking-wider">
                    Booking {viewingBooking.invoice_number}
                  </h2>
                  <p className="text-xs text-gray-500 tracking-wider mt-0.5">
                    Created on{" "}
                    {new Date(viewingBooking.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/ /g, "-")}
                  </p>
                </div>
                <button
                  onClick={() => setViewingBooking(null)}
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
                    {viewingBooking.client_name}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                    Invoice No
                  </span>
                  <span className="text-black font-medium tracking-wider">
                    {viewingBooking.invoice_number}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                    Event Date
                  </span>
                  <span className="text-black tracking-wider">
                    {viewingBooking.event_date
                      ? new Date(viewingBooking.event_date)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          .replace(/ /g, "-")
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                    Event Location
                  </span>
                  <span className="text-black tracking-wider">
                    {viewingBooking.event_location || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                    Photographer / Videographer
                  </span>
                  <span className="text-black tracking-wider">
                    {viewingBooking.photographer_videographer || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                    Timing
                  </span>
                  <span className="text-black tracking-wider">
                    {viewingBooking.timing || "—"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
                    Outdoor Location / Timing
                  </span>
                  <span className="text-black tracking-wider">
                    {viewingBooking.outdoor_location_timing || "—"}
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
                    {Array.isArray(viewingBooking.details) &&
                    viewingBooking.details.length > 0 ? (
                      viewingBooking.details.map((srv, idx) => {
                        const dt = srv.date;
                        return (
                          <tr key={idx}>
                            <td className="px-2 py-2 text-black tracking-wider">
                              <div className="font-semibold">{srv.name}</div>
                              {srv.description && (
                                <div className="text-[10px] text-gray-500 italic mt-0.5">
                                  &quot;{srv.description}&quot;
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                              {srv.event || "-"}
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
                              {Number(srv.price || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-2 py-4 text-center text-gray-500 tracking-wider"
                        >
                          No services details
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setViewingBooking(null)}
                  className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Edit Booking Modal */}
        {editingBooking && (
          <EditBookingModal
            booking={editingBooking}
            onClose={() => setEditingBooking(null)}
            onSuccess={() => {
              setEditingBooking(null);
              fetchBookings();
            }}
          />
        )}
      </main>
    </ProtectedRoute> /* ✅ Yahan par khatam */
  );
}

/* =========================================================
   ✅ EditBookingModal — inline component
   ========================================================= */
function EditBookingModal({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);

  // Basic booking fields
  const [clientName, setClientName] = useState(booking.client_name || "");
  const [eventDate, setEventDate] = useState(
    booking.event_date ? booking.event_date.slice(0, 10) : ""
  );
  const [eventLocation, setEventLocation] = useState(
    booking.event_location || ""
  );
  const [photographerVideographer, setPhotographerVideographer] = useState(
    booking.photographer_videographer || ""
  );
  const [timing, setTiming] = useState(booking.timing || "");
  const [outdoorLocationTiming, setOutdoorLocationTiming] = useState(
    booking.outdoor_location_timing || ""
  );

  // Services details array (editable rows)
  const [details, setDetails] = useState<ServiceItem[]>(
    Array.isArray(booking.details) && booking.details.length > 0
      ? booking.details.map((s) => ({
          name: s.name || "",
          price: Number(s.price) || 0,
          description: s.description || "",
          date: s.date || "",
          event: s.event || "",
        }))
      : [
          {
            name: "",
            price: 0,
            description: "",
            date: "",
            event: "",
          },
        ]
  );

  const updateDetail = (
    index: number,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setDetails((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as ServiceItem;
      return next;
    });
  };

  const addDetailRow = () => {
    setDetails((prev) => [
      ...prev,
      { name: "", price: 0, description: "", date: "", event: "" },
    ]);
  };

  const removeDetailRow = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!eventDate && !eventLocation && details.length === 0) {
      alert("Please fill at least the event date or location.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: booking.id,
        client_name: clientName,
        event_date: eventDate || null,
        event_location: eventLocation || null,
        photographer_videographer: photographerVideographer || null,
        timing: timing || null,
        outdoor_location_timing: outdoorLocationTiming || null,
        details: details.filter((d) => d.name.trim() !== ""), // drop empty rows
      };

      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update booking");
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
          <div>
            <h2 className="text-lg font-bold text-black tracking-wider">
              Edit Booking {booking.invoice_number}
            </h2>
            <p className="text-xs text-gray-500 tracking-wider mt-0.5">
              Update booking details below
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

        {/* Basic fields */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
              Event Location
            </label>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
              Photographer / Videographer
            </label>
            <input
              type="text"
              value={photographerVideographer}
              onChange={(e) => setPhotographerVideographer(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
              Timing
            </label>
            <input
              type="text"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1">
              Outdoor Location / Timing
            </label>
            <input
              type="text"
              value={outdoorLocationTiming}
              onChange={(e) => setOutdoorLocationTiming(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs tracking-wider text-black outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Services / details editor */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-black tracking-wider">
            Services / Events
          </h3>
          <button
            onClick={addDetailRow}
            className="rounded-full border border-black bg-white px-3 py-1 text-[10px] font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
            disabled={saving}
          >
            + Add Row
          </button>
        </div>

        <div className="space-y-2">
          {details.map((d, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 border border-gray-200 rounded-lg p-2"
            >
              <div className="sm:col-span-3">
                <label className="block text-[9px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Service
                </label>
                <input
                  type="text"
                  value={d.name}
                  onChange={(e) => updateDetail(idx, "name", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs tracking-wider text-black outline-none focus:border-black"
                  placeholder="Service name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Event
                </label>
                <input
                  type="text"
                  value={d.event}
                  onChange={(e) => updateDetail(idx, "event", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs tracking-wider text-black outline-none focus:border-black"
                  placeholder="Event"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Date
                </label>
                <input
                  type="date"
                  value={d.date ? d.date.slice(0, 10) : ""}
                  onChange={(e) => updateDetail(idx, "date", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs tracking-wider text-black outline-none focus:border-black"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Amount
                </label>
                <input
                  type="number"
                  value={d.price}
                  onChange={(e) =>
                    updateDetail(idx, "price", Number(e.target.value))
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs tracking-wider text-black outline-none focus:border-black"
                  placeholder="0"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[9px] uppercase text-gray-500 tracking-wider mb-0.5">
                  Description
                </label>
                <input
                  type="text"
                  value={d.description}
                  onChange={(e) =>
                    updateDetail(idx, "description", e.target.value)
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs tracking-wider text-black outline-none focus:border-black"
                  placeholder="Description"
                />
              </div>
              <div className="sm:col-span-12 flex justify-end">
                <button
                  onClick={() => removeDetailRow(idx)}
                  className="text-[10px] text-red-600 hover:text-red-800 tracking-wider"
                  disabled={saving || details.length <= 1}
                  title="Remove row"
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white disabled:opacity-50"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}