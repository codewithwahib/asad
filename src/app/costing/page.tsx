"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Protection import

interface CostingItem {
  purpose: string;
  amount: number;
}

interface Costing {
  id: number;
  invoice_number: string;
  costing: CostingItem[] | null; // jsonb
  debit: number;
  credit: number;
  balance: number;
  created_at: string;
}

export default function CostingPage() {
  const [entries, setEntries] = useState<Costing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingEntry, setViewingEntry] = useState<Costing | null>(null);
  const [editingEntry, setEditingEntry] = useState<Costing | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/costing");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
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

  // ✅ Helper: Sum of purposes amounts
  const totalAmount = (e: Costing) =>
    Array.isArray(e.costing)
      ? e.costing.reduce((s, it) => s + Number(it.amount || 0), 0)
      : 0;

  // Print ALL costing entries (ledger report)
  const handlePrintAll = () => {
    if (entries.length === 0) {
      alert("No costing entries to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const totalDebit = entries.reduce((s, e) => s + Number(e.debit || 0), 0);
    const totalCredit = entries.reduce((s, e) => s + totalAmount(e), 0);
    const totalProfit = entries.reduce((s, e) => s + (Number(e.debit || 0) - totalAmount(e)), 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Costing Ledger</title>
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
            .debit-cell { color: #15803d; font-weight: bold; }
            .credit-cell { color: #2563eb; font-weight: bold; }
            .profit-cell { color: #9333ea; font-weight: bold; }
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
                <div class="main-title">Costing Ledger</div>
                <div class="sub-title">Total ${entries.length} entry(ies)</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">S.No</th>
                  <th style="width:100px">Invoice #</th>
                  <th>Amount</th>
                  <th style="width:90px" class="numeric-cell">Debit</th>
                  <th style="width:90px" class="numeric-cell">Credit</th>
                  <th style="width:90px" class="numeric-cell">Profit</th>
                  <th style="width:80px">Date</th>
                </tr>
              </thead>
              <tbody>
                ${entries
                  .map((e, idx) => {
                    const dateStr = new Date(e.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/ /g, "-");
                    
                    const purposesHtml =
                      Array.isArray(e.costing) && e.costing.length > 0
                        ? e.costing
                            .map(
                              (it) =>
                                `<div style="display:flex;justify-content:space-between;gap:8px; margin-bottom:2px;">
                                   <span>${it.purpose || "—"}</span>
                                   <span style="color:#555;">Rs ${Number(it.amount || 0).toFixed(2)}</span>
                                 </div>`
                            )
                            .join("")
                        : "-";
                    
                    const creditTotal = totalAmount(e);
                    const profitTotal = Number(e.debit || 0) - creditTotal;

                    return `
                      <tr>
                        <td class="center-cell">${idx + 1}</td>
                        <td>${e.invoice_number}</td>
                        <td>${purposesHtml}</td>
                        <td class="numeric-cell debit-cell">Rs ${Number(e.debit).toFixed(2)}</td>
                        <td class="numeric-cell credit-cell">Rs ${creditTotal.toFixed(2)}</td>
                        <td class="numeric-cell profit-cell">Rs ${profitTotal.toFixed(2)}</td>
                        <td class="center-cell">${dateStr}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
              <tfoot>
                <tr class="footer-totals">
                  <td colspan="2" class="numeric-cell">GRAND TOTALS:</td>
                  <td></td>
                  <td class="numeric-cell debit-cell">Rs ${totalDebit.toFixed(2)}</td>
                  <td class="numeric-cell credit-cell">Rs ${totalCredit.toFixed(2)}</td>
                  <td class="numeric-cell profit-cell">Rs ${totalProfit.toFixed(2)}</td>
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

  return (
    <ProtectedRoute> {/* ✅ Yahan se protection shuru */}
      <main className="min-h-screen bg-white p-4 md:p-6 text-black tracking-wider">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl font-bold tracking-wider text-black">
              Costing
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/quotations"
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
                href="/bookings"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Bookings
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Services
              </Link>

              <button
                onClick={fetchEntries}
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

              <button
                onClick={handlePrintAll}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
                title="Print All"
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
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-[11px] tracking-wider">
              <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase tracking-wider text-black">
                <tr>
                  <th className="px-2 py-2 tracking-wider">S.No</th>
                  <th className="px-2 py-2 tracking-wider">Invoice #</th>
                  <th className="px-2 py-2 tracking-wider">Amount</th>
                  <th className="px-2 py-2 tracking-wider text-right">Debit</th>
                  <th className="px-2 py-2 tracking-wider text-right">Credit</th>
                  <th className="px-2 py-2 tracking-wider text-right">Profit</th>
                  <th className="px-2 py-2 tracking-wider">Date</th>
                  <th className="px-2 py-2 text-center tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-2 py-2">
                          <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-semibold text-black tracking-wider">
                          No Costing Entries
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((e, idx) => {
                    const creditTotal = totalAmount(e);
                    const profitTotal = Number(e.debit || 0) - creditTotal;
                    return (
                      <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 py-2 text-black tracking-wider">{idx + 1}</td>
                        <td className="px-2 py-2 font-medium text-black tracking-wider">
                          {e.invoice_number}
                        </td>
                        <td className="px-2 py-2 text-black tracking-wider">
                          {Array.isArray(e.costing) && e.costing.length > 0
                            ? e.costing.map((it, i) => (
                                <div key={i} className="flex justify-between gap-2">
                                  <span>{it.purpose || "—"}</span>
                                  <span className="text-gray-500">Rs {Number(it.amount || 0).toFixed(2)}</span>
                                </div>
                              ))
                            : "-"}
                        </td>
                        <td className="px-2 py-2 text-right text-green-700 font-semibold tracking-wider">
                          Rs {Number(e.debit || 0).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-right text-blue-700 font-semibold tracking-wider">
                          Rs {creditTotal.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-right text-purple-700 font-semibold tracking-wider">
                          Rs {profitTotal.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                          {new Date(e.created_at)
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            .replace(/ /g, "-")}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingEntry(e)}
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

        {/* ✅ View Entry Modal */}
        {viewingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-black tracking-wider">
                    Costing {viewingEntry.invoice_number}
                  </h2>
                  <p className="text-xs text-gray-500 tracking-wider mt-0.5">
                    Created on{" "}
                    {new Date(viewingEntry.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/ /g, "-")}
                  </p>
                </div>
                <button
                  onClick={() => setViewingEntry(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black tracking-wider transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 overflow-x-auto rounded-xl border border-gray-300">
                <table className="min-w-full text-[11px] tracking-wider">
                  <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase text-black">
                    <tr>
                      <th className="px-2 py-2">Purpose</th>
                      <th className="px-2 py-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Array.isArray(viewingEntry.costing) &&
                    viewingEntry.costing.length > 0 ? (
                      viewingEntry.costing.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-2 text-black tracking-wider">
                            {it.purpose || "—"}
                          </td>
                          <td className="px-2 py-2 text-right text-black tracking-wider">
                            Rs {Number(it.amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-2 py-4 text-center text-gray-500 tracking-wider">
                          No purposes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-4 text-xs border-t border-gray-300 pt-3">
                <div>
                  <span className="text-[10px] uppercase text-gray-500 tracking-wider">Debit</span>
                  <p className="font-semibold text-green-700">Rs {Number(viewingEntry.debit || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-500 tracking-wider">Credit</span>
                  <p className="font-semibold text-blue-700">Rs {totalAmount(viewingEntry).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-500 tracking-wider">Profit</span>
                  <p className="font-semibold text-purple-700">
                    Rs {(Number(viewingEntry.debit || 0) - totalAmount(viewingEntry)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setViewingEntry(null)}
                  className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute> /* ✅ Yahan par khatam */
  );
}