// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";

// interface CostingItem {
//   purpose: string;
//   amount: number;
// }

// interface Costing {
//   id: number;
//   invoice_number: string;
//   costing: CostingItem[] | null; // jsonb
//   debit: number;
//   credit: number;
//   balance: number;
//   created_at: string;
// }

// export default function CostingPage() {
//   const [entries, setEntries] = useState<Costing[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [viewingEntry, setViewingEntry] = useState<Costing | null>(null);
//   const [editingEntry, setEditingEntry] = useState<Costing | null>(null);
//   const filterRef = useRef<HTMLDivElement>(null);

//   const fetchEntries = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/costing");
//       const data = await res.json();
//       setEntries(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEntries();
//   }, []);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         filterRef.current &&
//         !filterRef.current.contains(event.target as Node)
//       ) {
//         setIsFilterOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ✅ Helper: Sum of purposes amounts
//   const totalAmount = (e: Costing) =>
//     Array.isArray(e.costing)
//       ? e.costing.reduce((s, it) => s + Number(it.amount || 0), 0)
//       : 0;

//   // Print ALL costing entries (ledger report)
//   const handlePrintAll = () => {
//     if (entries.length === 0) {
//       alert("No costing entries to print.");
//       return;
//     }

//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//       alert("Please allow popups to print.");
//       return;
//     }

//     const totalDebit = entries.reduce((s, e) => s + Number(e.debit || 0), 0);
//     const totalCredit = entries.reduce((s, e) => s + totalAmount(e), 0);
//     const totalProfit = entries.reduce((s, e) => s + (Number(e.debit || 0) - totalAmount(e)), 0);

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Costing Ledger</title>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//             * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
//             body { margin: 0; padding: 8px; color: #000; background: white; font-size: 11px; }
//             .print-container { max-width: 1200px; margin: 0 auto; border: 1px solid #000; padding: 20px; min-height: 95vh; display: flex; flex-direction: column; }
//             .header-section { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
//             .logo-img { height: 70px; object-fit: contain; }
//             .title-section { text-align: right; }
//             .main-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
//             .sub-title { font-size: 11px; color: #555; margin-top: 4px; }
//             .data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
//             .data-table th { background: #f0f0f0; padding: 7px 6px; text-align: left; font-weight: bold; border: 1px solid #000; font-size: 9px; text-transform: uppercase; }
//             .data-table td { padding: 6px; border: 1px solid #000; vertical-align: top; }
//             .numeric-cell { text-align: right; }
//             .center-cell { text-align: center; }
//             .debit-cell { color: #15803d; font-weight: bold; }
//             .credit-cell { color: #2563eb; font-weight: bold; }
//             .profit-cell { color: #9333ea; font-weight: bold; }
//             .footer-totals { background: #e8f5e8 !important; font-weight: bold; font-size: 11px; }
//             .datetime-footer { text-align: left; padding-top: 10px; margin-top: auto; border-top: 1px solid #ccc; font-size: 10px; color: #555; }
//             @media print { body { padding: 0; } .print-container { border: none; padding: 0; } }
//           </style>
//         </head>
//         <body>
//           <div class="print-container">
//             <div class="header-section">
//               <div>
//                 <img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
//               </div>
//               <div class="title-section">
//                 <div class="main-title">Costing Ledger</div>
//                 <div class="sub-title">Total ${entries.length} entry(ies)</div>
//               </div>
//             </div>

//             <table class="data-table">
//               <thead>
//                 <tr>
//                   <th style="width:40px">S.No</th>
//                   <th style="width:100px">Invoice #</th>
//                   <th>Amount</th>
//                   <th style="width:90px" class="numeric-cell">Debit</th>
//                   <th style="width:90px" class="numeric-cell">Credit</th>
//                   <th style="width:90px" class="numeric-cell">Profit</th>
//                   <th style="width:80px">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${entries
//                   .map((e, idx) => {
//                     const dateStr = new Date(e.created_at)
//                       .toLocaleDateString("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       })
//                       .replace(/ /g, "-");
                    
//                     const purposesHtml =
//                       Array.isArray(e.costing) && e.costing.length > 0
//                         ? e.costing
//                             .map(
//                               (it) =>
//                                 `<div style="display:flex;justify-content:space-between;gap:8px; margin-bottom:2px;">
//                                    <span>${it.purpose || "—"}</span>
//                                    <span style="color:#555;">Rs ${Number(it.amount || 0).toFixed(2)}</span>
//                                  </div>`
//                             )
//                             .join("")
//                         : "-";
                    
//                     const creditTotal = totalAmount(e);
//                     const profitTotal = Number(e.debit || 0) - creditTotal;

//                     return `
//                       <tr>
//                         <td class="center-cell">${idx + 1}</td>
//                         <td>${e.invoice_number}</td>
//                         <td>${purposesHtml}</td>
//                         <td class="numeric-cell debit-cell">Rs ${Number(e.debit).toFixed(2)}</td>
//                         <td class="numeric-cell credit-cell">Rs ${creditTotal.toFixed(2)}</td>
//                         <td class="numeric-cell profit-cell">Rs ${profitTotal.toFixed(2)}</td>
//                         <td class="center-cell">${dateStr}</td>
//                       </tr>
//                     `;
//                   })
//                   .join("")}
//               </tbody>
//               <tfoot>
//                 <tr class="footer-totals">
//                   <td colspan="2" class="numeric-cell">GRAND TOTALS:</td>
//                   <td></td>
//                   <td class="numeric-cell debit-cell">Rs ${totalDebit.toFixed(2)}</td>
//                   <td class="numeric-cell credit-cell">Rs ${totalCredit.toFixed(2)}</td>
//                   <td class="numeric-cell profit-cell">Rs ${totalProfit.toFixed(2)}</td>
//                   <td></td>
//                 </tr>
//               </tfoot>
//             </table>

//             <div class="datetime-footer">
//               Printed on: ${new Date().toLocaleDateString("en-IN")} | ${new Date().toLocaleTimeString("en-IN", {
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 hour12: true,
//               })}
//             </div>
//           </div>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => printWindow.print(), 500);
//   };

//   // Print single costing entry
//   const handlePrintSingle = (entry: Costing) => {
//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//       alert("Please allow popups to print.");
//       return;
//     }

//     const items = Array.isArray(entry.costing) ? entry.costing : [];
//     const creditTotal = totalAmount(entry);
//     const profitTotal = Number(entry.debit || 0) - creditTotal;

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Costing - ${entry.invoice_number}</title>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//             * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
//             body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
//             .print-container { max-width: 1000px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; padding: 20px; }
//             .header-section { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
//             .logo-img { height: 80px; object-fit: contain; }
//             .title-section { text-align: right; }
//             .main-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
//             .info-section { margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
//             .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
//             .info-table td { padding: 4px; vertical-align: top; }
//             .info-label { font-weight: bold; white-space: nowrap; }
//             .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
//             .data-table th { background: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; border: 1px solid #000; }
//             .data-table td { padding: 6px 8px; border: 1px solid #000; }
//             .numeric-cell { text-align: right; }
//             .center-cell { text-align: center; }
//             .debit-row { color: #15803d; font-weight: bold; }
//             .credit-row { color: #2563eb; font-weight: bold; }
//             .profit-row { color: #9333ea; font-weight: bold; }
//             .datetime-footer { text-align: left; padding-top: 10px; margin-top: auto; border-top: 1px solid #ccc; font-size: 10px; color: #555; }
//             @media print { body { padding: 0; } .print-container { border: none; padding: 0; } }
//           </style>
//         </head>
//         <body>
//           <div class="print-container">
//             <div class="header-section">
//               <div>
//                 <img src="${window.location.origin}/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
//               </div>
//               <div class="title-section">
//                 <div class="main-title">Costing Entry</div>
//               </div>
//             </div>

//             <div class="info-section">
//               <table class="info-table"><tbody>
//                 <tr>
//                   <td class="info-label" style="width:20%">Invoice No:</td><td>${entry.invoice_number}</td>
//                   <td class="info-label" style="width:20%">Date:</td><td>${new Date(entry.created_at)
//                     .toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                     .replace(/ /g, "-")}</td>
//                 </tr>
//               </tbody></table>
//             </div>

//             <div>
//               <table class="data-table">
//                 <thead>
//                   <tr>
//                     <th style="width:50px">S.No</th>
//                     <th>Purpose</th>
//                     <th style="width:120px">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${items
//                     .map((it, idx) => {
//                       return `
//                       <tr>
//                         <td class="center-cell">${idx + 1}</td>
//                         <td>${it.purpose || ""}</td>
//                         <td class="numeric-cell">${Number(it.amount || 0).toFixed(2)}</td>
//                       </tr>
//                     `;
//                     })
//                     .join("")}
//                 </tbody>
//                 <tfoot>
//                   <tr class="debit-row">
//                     <td colspan="2" class="numeric-cell">DEBIT (Client Billed):</td>
//                     <td class="numeric-cell">Rs ${Number(entry.debit).toFixed(2)}</td>
//                   </tr>
//                   <tr class="credit-row">
//                     <td colspan="2" class="numeric-cell">CREDIT (Total Expense):</td>
//                     <td class="numeric-cell">Rs ${creditTotal.toFixed(2)}</td>
//                   </tr>
//                   <tr class="profit-row">
//                     <td colspan="2" class="numeric-cell">PROFIT:</td>
//                     <td class="numeric-cell">Rs ${profitTotal.toFixed(2)}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>

//             <div class="datetime-footer">
//               Printed on: ${new Date().toLocaleDateString("en-IN")} | ${new Date().toLocaleTimeString("en-IN", {
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 hour12: true,
//               })}
//             </div>
//           </div>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => printWindow.print(), 500);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this costing entry?")) return;
//     setDeletingId(id);
//     try {
//       const res = await fetch(`/api/costing?id=${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Failed to delete costing entry");
//       fetchEntries();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete costing entry. Check your API route.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-white p-4 md:p-6 text-black tracking-wider">
//       <div className="mx-auto max-w-[1400px]">
//         {/* Header */}
//         <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <h1 className="text-xl font-bold tracking-wider text-black">
//             Costing Ledger
//           </h1>

//           <div className="flex flex-wrap items-center gap-3">
//             <Link
//               href="/"
//               className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//             >
//               Quotations
//             </Link>

//             <Link
//               href="/invoices"
//               className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//             >
//               Invoices
//             </Link>

//             <Link
//               href="/services"
//               className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//             >
//               Services
//             </Link>

//             {/* Print All */}
//             <button
//               onClick={handlePrintAll}
//               className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//               title="Print All Costing Entries"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={2}
//                 stroke="currentColor"
//                 className="w-3.5 h-3.5"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
//                 />
//               </svg>
//               Print All
//             </button>

//             <button
//               onClick={fetchEntries}
//               className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
//               title="Refresh"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth={2}
//                 stroke="currentColor"
//                 className="w-3.5 h-3.5"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
//                 />
//               </svg>
//             </button>

//             <div className="relative" ref={filterRef}>
//               <button
//                 onClick={() => setIsFilterOpen(!isFilterOpen)}
//                 className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
//                 title="Filter"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={2}
//                   stroke="currentColor"
//                   className="w-3.5 h-3.5"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
//                   />
//                 </svg>
//               </button>

//               {isFilterOpen && (
//                 <div className="absolute right-0 mt-2 w-48 border border-gray-300 bg-white shadow-lg z-10 rounded-xl overflow-hidden">
//                   <div className="p-2 space-y-1">
//                     <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
//                       All Entries
//                     </button>
//                     <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
//                       With Balance
//                     </button>
//                     <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
//                       Fully Settled
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Summary cards */}
//         <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
//           <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
//             <p className="text-[10px] uppercase text-gray-500 tracking-wider">
//               Total Debit
//             </p>
//             <p className="text-lg font-bold text-green-700 tracking-wider mt-1">
//               Rs{" "}
//               {entries.reduce((s, e) => s + Number(e.debit || 0), 0).toFixed(2)}
//             </p>
//           </div>
//           <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
//             <p className="text-[10px] uppercase text-gray-500 tracking-wider">
//               Total Credit
//             </p>
//             <p className="text-lg font-bold text-blue-600 tracking-wider mt-1">
//               Rs{" "}
//               {entries
//                 .reduce((s, e) => s + totalAmount(e), 0)
//                 .toFixed(2)}
//             </p>
//           </div>
//           <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
//             <p className="text-[10px] uppercase text-gray-500 tracking-wider">
//               Total Profit
//             </p>
//             <p className="text-lg font-bold text-purple-600 tracking-wider mt-1">
//               Rs{" "}
//               {entries
//                 .reduce((s, e) => s + (Number(e.debit || 0) - totalAmount(e)), 0)
//                 .toFixed(2)}
//             </p>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
//           <table className="min-w-full divide-y divide-gray-200 text-[11px] tracking-wider">
//             <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase tracking-wider text-black">
//               <tr>
//                 <th className="px-2 py-2 tracking-wider">Invoice #</th>
//                 <th className="px-2 py-2 tracking-wider">Amount</th>
//                 <th className="px-2 py-2 text-right tracking-wider">Debit</th>
//                 <th className="px-2 py-2 text-right tracking-wider">Credit</th>
//                 <th className="px-2 py-2 text-right tracking-wider">Profit</th>
//                 <th className="px-2 py-2 tracking-wider">Created</th>
//                 <th className="px-2 py-2 text-center tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {loading ? (
//                 Array.from({ length: 5 }).map((_, index) => (
//                   <tr key={index} className="animate-pulse">
//                     {Array.from({ length: 7 }).map((_, colIndex) => (
//                       <td key={colIndex} className="px-2 py-2">
//                         <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : entries.length === 0 ? (
//                 <tr>
//                   <td colSpan={7} className="px-4 py-16 text-center">
//                     <div className="flex flex-col items-center justify-center">
//                       <img
//                         src="/no.png"
//                         alt="No Costing Entries"
//                         className="w-48 h-auto mb-4 object-contain opacity-80"
//                       />
//                       <p className="text-sm font-semibold text-black tracking-wider">
//                         No Costing Entries
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 entries.map((e) => {
//                   const credit = totalAmount(e);
//                   const profit = Number(e.debit || 0) - credit;
//                   return (
//                     <tr
//                       key={e.id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-2 py-2 font-medium text-black tracking-wider">
//                         {e.invoice_number}
//                       </td>

//                       {/* Amount (Purposes with amounts) */}
//                       <td className="px-2 py-2 text-black tracking-wider max-w-[320px]">
//                         {Array.isArray(e.costing) && e.costing.length > 0 ? (
//                           <div className="flex flex-col gap-0.5">
//                             {e.costing.map((it, i) => (
//                               <div
//                                 key={i}
//                                 className="flex items-center justify-between gap-3 whitespace-nowrap"
//                               >
//                                 <span
//                                   className="truncate max-w-[180px]"
//                                   title={it.purpose}
//                                 >
//                                   {it.purpose || "—"}
//                                 </span>
//                                 <span className="text-gray-700">
//                                   Rs {Number(it.amount || 0).toFixed(2)}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           "—"
//                         )}
//                       </td>

//                       <td className="px-2 py-2 text-right text-green-700 font-medium tracking-wider">
//                         {Number(e.debit).toFixed(2)}
//                       </td>
//                       <td className="px-2 py-2 text-right text-blue-600 font-medium tracking-wider">
//                         {credit.toFixed(2)}
//                       </td>
//                       <td className="px-2 py-2 text-right text-purple-600 font-bold tracking-wider">
//                         {profit.toFixed(2)}
//                       </td>
//                       <td className="px-2 py-2 whitespace-nowrap text-gray-700 tracking-wider">
//                         {new Date(e.created_at)
//                           .toLocaleDateString("en-GB", {
//                             day: "2-digit",
//                             month: "short",
//                             year: "2-digit",
//                           })
//                           .replace(/ /g, "-")}
//                       </td>
//                       <td className="px-2 py-2 text-center">
//                         <div className="flex items-center justify-center gap-1.5">
//                           <button
//                             onClick={() => setViewingEntry(e)}
//                             className="text-gray-500 hover:text-black transition-colors p-1"
//                             title="View"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               strokeWidth={2}
//                               stroke="currentColor"
//                               className="w-3.5 h-3.5"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
//                               />
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                               />
//                             </svg>
//                           </button>

//                           <button
//                             onClick={() => handlePrintSingle(e)}
//                             className="text-gray-500 hover:text-black transition-colors p-1"
//                             title="Print / PDF"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               strokeWidth={2}
//                               stroke="currentColor"
//                               className="w-3.5 h-3.5"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
//                               />
//                             </svg>
//                           </button>

//                           {/* Edit button */}
//                           <button
//                             onClick={() => setEditingEntry(e)}
//                             className="text-gray-500 hover:text-black transition-colors p-1"
//                             title="Edit"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               strokeWidth={2}
//                               stroke="currentColor"
//                               className="w-3.5 h-3.5"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
//                               />
//                             </svg>
//                           </button>

//                           {deletingId === e.id ? (
//                             <div className="flex items-center justify-center w-3.5 h-3.5">
//                               <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => handleDelete(e.id)}
//                               className="text-red-500 hover:text-red-700 transition-colors p-1"
//                               title="Delete"
//                             >
//                               <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 strokeWidth={2}
//                                 stroke="currentColor"
//                                 className="w-3.5 h-3.5"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
//                                 />
//                               </svg>
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Edit Costing Modal */}
//       {editingEntry && (
//         <EditCostingModal
//           entry={editingEntry}
//           onClose={() => setEditingEntry(null)}
//           onSuccess={() => {
//             setEditingEntry(null);
//             fetchEntries();
//           }}
//         />
//       )}

//       {/* View Modal — inline */}
//       {viewingEntry && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
//             <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
//               <div>
//                 <h2 className="text-lg font-bold text-black tracking-wider">
//                   Costing Entry {viewingEntry.invoice_number}
//                 </h2>
//                 <p className="text-xs text-gray-500 tracking-wider mt-0.5">
//                   Created on{" "}
//                   {new Date(viewingEntry.created_at)
//                     .toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                     .replace(/ /g, "-")}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setViewingEntry(null)}
//                 className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black tracking-wider transition-colors"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300">
//               <table className="min-w-full text-[11px] tracking-wider">
//                 <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase text-black">
//                   <tr>
//                     <th className="px-2 py-2 tracking-wider w-10">S.No</th>
//                     <th className="px-2 py-2 tracking-wider">Purpose</th>
//                     <th className="px-2 py-2 tracking-wider text-right w-32">
//                       Amount
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 bg-white">
//                   {Array.isArray(viewingEntry.costing) &&
//                   viewingEntry.costing.length > 0 ? (
//                     viewingEntry.costing.map((it, idx) => (
//                       <tr key={idx}>
//                         <td className="px-2 py-2 text-center text-black tracking-wider">
//                           {idx + 1}
//                         </td>
//                         <td className="px-2 py-2 text-black tracking-wider">
//                           {it.purpose || "—"}
//                         </td>
//                         <td className="px-2 py-2 text-right text-black tracking-wider">
//                           {Number(it.amount || 0).toFixed(2)}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan={3}
//                         className="px-4 py-8 text-center text-gray-500 tracking-wider"
//                       >
//                         No items
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mt-4 ml-auto w-full max-w-xs bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
//               <div className="flex justify-between py-1 text-green-700 font-medium tracking-wider">
//                 <span className="tracking-wider">Debit:</span>
//                 <span className="tracking-wider">
//                   Rs. {Number(viewingEntry.debit).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between py-1 text-blue-600 font-medium tracking-wider">
//                 <span className="tracking-wider">Credit:</span>
//                 <span className="tracking-wider">
//                   Rs. {totalAmount(viewingEntry).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between py-1 text-purple-600 font-bold tracking-wider mt-1 pt-2 border-t border-gray-300">
//                 <span className="tracking-wider">Profit:</span>
//                 <span className="tracking-wider">
//                   Rs. {(Number(viewingEntry.debit) - totalAmount(viewingEntry)).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewingEntry(null)}
//                 className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// /* ============================================================
//    Edit Costing Modal (PATCH existing entry)
//    - Invoice number is LOCKED (read-only / disabled)
//    ============================================================ */
// function EditCostingModal({
//   entry,
//   onClose,
//   onSuccess,
// }: {
//   entry: Costing;
//   onClose: () => void;
//   onSuccess: () => void;
// }) {
//   const initialItems =
//     Array.isArray(entry.costing) && entry.costing.length > 0
//       ? entry.costing.map((it) => ({
//           purpose: it.purpose || "",
//           amount: it.amount != null ? String(it.amount) : "",
//         }))
//       : [{ purpose: "", amount: "" }];

//   const [items, setItems] = useState<{ purpose: string; amount: string }[]>(
//     initialItems
//   );
//   const [debit, setDebit] = useState(
//     entry.debit != null ? String(entry.debit) : ""
//   );
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const totalAmount = items.reduce(
//     (sum, it) => sum + (parseFloat(it.amount) || 0),
//     0
//   );
//   const totalDebit = parseFloat(debit) || 0;
//   const profit = totalDebit - totalAmount;

//   const addRow = () => setItems([...items, { purpose: "", amount: "" }]);

//   const removeRow = (idx: number) => {
//     if (items.length === 1) return;
//     setItems(items.filter((_, i) => i !== idx));
//   };

//   const updateItem = (
//     idx: number,
//     field: "purpose" | "amount",
//     value: string
//   ) => {
//     const next = [...items];
//     next[idx] = { ...next[idx], [field]: value };
//     setItems(next);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     const validItems = items.filter(
//       (it) => it.purpose.trim() && it.amount.trim()
//     );
//     if (validItems.length === 0) {
//       setError("Please add at least one purpose + amount");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         costing: validItems.map((it) => ({
//           purpose: it.purpose.trim(),
//           amount: parseFloat(it.amount) || 0,
//         })),
//         debit: totalDebit,
//         credit: totalAmount,
//         balance: Math.max(totalDebit - totalAmount, 0),
//       };

//       const res = await fetch(`/api/costing?id=${entry.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         throw new Error(data.error || `Request failed (${res.status})`);
//       }

//       onSuccess();
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const inputClass =
//     "w-full border border-gray-300 px-3 py-1.5 text-xs text-black bg-white outline-none focus:border-black focus:ring-1 focus:ring-black tracking-wider rounded-lg disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//       <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-lg font-bold text-black tracking-wider">
//             Edit Costing Entry
//           </h2>
//           <button
//             onClick={onClose}
//             disabled={submitting}
//             className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black disabled:opacity-50 tracking-wider transition-colors"
//           >
//             ×
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 tracking-wider rounded-lg">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4 tracking-wider">
//           <div>
//             <label className="mb-1 block text-xs font-medium text-black tracking-wider">
//               Invoice Number (locked)
//             </label>
//             <input
//               value={entry.invoice_number}
//               readOnly
//               disabled
//               className={`${inputClass} bg-gray-100 cursor-not-allowed`}
//             />
//           </div>

//           {/* Purpose + Amount rows */}
//           <div className="border-t border-gray-300 pt-4">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-bold text-black tracking-wider">
//                 Purposes & Amounts
//               </span>
//               <button
//                 type="button"
//                 onClick={addRow}
//                 className="text-xs font-semibold text-black hover:underline"
//               >
//                 + Add Row
//               </button>
//             </div>

//             {items.map((it, idx) => (
//               <div
//                 key={idx}
//                 className="border border-gray-200 p-3 mb-3 bg-gray-50 relative"
//               >
//                 <div className="flex gap-2 items-end pr-6">
//                   <div className="flex-1">
//                     <label className="block text-[10px] text-gray-500 mb-1">
//                       Purpose
//                     </label>
//                     <input
//                       value={it.purpose}
//                       onChange={(e) =>
//                         updateItem(idx, "purpose", e.target.value)
//                       }
//                       placeholder="e.g. Printing, Rent, Travel"
//                       className={inputClass}
//                     />
//                   </div>
//                   <div className="w-1/3">
//                     <label className="block text-[10px] text-gray-500 mb-1">
//                       Amount
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       value={it.amount}
//                       onChange={(e) =>
//                         updateItem(idx, "amount", e.target.value)
//                       }
//                       placeholder="0.00"
//                       className={inputClass}
//                     />
//                   </div>
//                 </div>

//                 {items.length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => removeRow(idx)}
//                     className="absolute top-3 right-3 text-red-500 hover:text-red-700"
//                     title="Remove"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth={1.5}
//                       stroke="currentColor"
//                       className="w-4 h-4"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             ))}

//             <div className="text-right text-xs text-gray-700 tracking-wider">
//               Total Credit (Expense):{" "}
//               <span className="font-semibold text-blue-600">
//                 Rs {totalAmount.toFixed(2)}
//               </span>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-300 pt-4">
//             <div>
//               <label className="mb-1 block text-xs font-medium text-black tracking-wider">
//                 Debit (Client Billed)
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 value={debit}
//                 onChange={(e) => setDebit(e.target.value)}
//                 placeholder="0.00"
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* Profit Preview */}
//           <div className="bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
//             <div className="flex justify-between py-1 text-green-700 font-medium tracking-wider">
//               <span className="tracking-wider">Debit (Client Billed):</span>
//               <span className="tracking-wider">
//                 Rs. {totalDebit.toFixed(2)}
//               </span>
//             </div>
//             <div className="flex justify-between py-1 text-blue-600 font-medium tracking-wider">
//               <span className="tracking-wider">Credit (Expense):</span>
//               <span className="tracking-wider">
//                 Rs. {totalAmount.toFixed(2)}
//               </span>
//             </div>
//             <div className="flex justify-between border-t border-gray-300 py-1 font-bold text-purple-600 tracking-wider mt-1 pt-2">
//               <span className="tracking-wider">Profit:</span>
//               <span className="tracking-wider">
//                 Rs. {profit.toFixed(2)}
//               </span>
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={submitting}
//               className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 disabled:opacity-50 tracking-wider transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60 tracking-wider transition-colors"
//             >
//               {submitting ? "Saving..." : "Update Costing"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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

  // Print single costing entry
  const handlePrintSingle = (entry: Costing) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const items = Array.isArray(entry.costing) ? entry.costing : [];
    const creditTotal = totalAmount(entry);
    const profitTotal = Number(entry.debit || 0) - creditTotal;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Costing - ${entry.invoice_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
            * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
            body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
            .print-container { max-width: 1000px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; padding: 20px; }
            .header-section { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .logo-img { height: 80px; object-fit: contain; }
            .title-section { text-align: right; }
            .main-title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
            .info-section { margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
            .info-table td { padding: 4px; vertical-align: top; }
            .info-label { font-weight: bold; white-space: nowrap; }
            .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            .data-table th { background: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; border: 1px solid #000; }
            .data-table td { padding: 6px 8px; border: 1px solid #000; }
            .numeric-cell { text-align: right; }
            .center-cell { text-align: center; }
            .debit-row { color: #15803d; font-weight: bold; }
            .credit-row { color: #2563eb; font-weight: bold; }
            .profit-row { color: #9333ea; font-weight: bold; }
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
                <div class="main-title">Costing Entry</div>
              </div>
            </div>

            <div class="info-section">
              <table class="info-table"><tbody>
                <tr>
                  <td class="info-label" style="width:20%">Invoice No:</td><td>${entry.invoice_number}</td>
                  <td class="info-label" style="width:20%">Date:</td><td>${new Date(entry.created_at)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .replace(/ /g, "-")}</td>
                </tr>
              </tbody></table>
            </div>

            <div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:50px">S.No</th>
                    <th>Purpose</th>
                    <th style="width:120px">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map((it, idx) => {
                      return `
                      <tr>
                        <td class="center-cell">${idx + 1}</td>
                        <td>${it.purpose || ""}</td>
                        <td class="numeric-cell">${Number(it.amount || 0).toFixed(2)}</td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
                <tfoot>
                  <tr class="debit-row">
                    <td colspan="2" class="numeric-cell">DEBIT (Client Billed):</td>
                    <td class="numeric-cell">Rs ${Number(entry.debit).toFixed(2)}</td>
                  </tr>
                  <tr class="credit-row">
                    <td colspan="2" class="numeric-cell">CREDIT (Total Expense):</td>
                    <td class="numeric-cell">Rs ${creditTotal.toFixed(2)}</td>
                  </tr>
                  <tr class="profit-row">
                    <td colspan="2" class="numeric-cell">PROFIT:</td>
                    <td class="numeric-cell">Rs ${profitTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this costing entry?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/costing?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete costing entry");
      fetchEntries();
    } catch (err) {
      console.error(err);
      alert("Failed to delete costing entry. Check your API route.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 text-black tracking-wider">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-wider text-black">
            Costing Ledger
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
              href="/services"
              className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
            >
              Services
            </Link>

            {/* Print All */}
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              title="Print All Costing Entries"
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
                <div className="absolute right-0 mt-2 w-48 border border-gray-300 bg-white shadow-lg z-10 rounded-xl overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
                      All Entries
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
                      With Balance
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
                      Fully Settled
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase text-gray-500 tracking-wider">
              Total Debit
            </p>
            <p className="text-lg font-bold text-green-700 tracking-wider mt-1">
              Rs{" "}
              {entries.reduce((s, e) => s + Number(e.debit || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase text-gray-500 tracking-wider">
              Total Credit
            </p>
            <p className="text-lg font-bold text-blue-600 tracking-wider mt-1">
              Rs{" "}
              {entries
                .reduce((s, e) => s + totalAmount(e), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase text-gray-500 tracking-wider">
              Total Profit
            </p>
            <p className="text-lg font-bold text-purple-600 tracking-wider mt-1">
              Rs{" "}
              {entries
                .reduce((s, e) => s + (Number(e.debit || 0) - totalAmount(e)), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-[11px] tracking-wider">
            <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase tracking-wider text-black">
              <tr>
                <th className="px-2 py-2 tracking-wider">Invoice #</th>
                <th className="px-2 py-2 tracking-wider">Amount</th>
                <th className="px-2 py-2 text-right tracking-wider">Debit</th>
                <th className="px-2 py-2 text-right tracking-wider">Credit</th>
                <th className="px-2 py-2 text-right tracking-wider">Profit</th>
                <th className="px-2 py-2 tracking-wider">Created</th>
                <th className="px-2 py-2 text-center tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-2 py-2">
                        <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src="/no.png"
                        alt="No Costing Entries"
                        width={192}
                        height={192}
                        className="w-48 h-auto mb-4 object-contain opacity-80"
                        priority
                      />
                      <p className="text-sm font-semibold text-black tracking-wider">
                        No Costing Entries
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((e) => {
                  const credit = totalAmount(e);
                  const profit = Number(e.debit || 0) - credit;
                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 py-2 font-medium text-black tracking-wider">
                        {e.invoice_number}
                      </td>

                      {/* Amount (Purposes with amounts) */}
                      <td className="px-2 py-2 text-black tracking-wider max-w-[320px]">
                        {Array.isArray(e.costing) && e.costing.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {e.costing.map((it, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between gap-3 whitespace-nowrap"
                              >
                                <span
                                  className="truncate max-w-[180px]"
                                  title={it.purpose}
                                >
                                  {it.purpose || "—"}
                                </span>
                                <span className="text-gray-700">
                                  Rs {Number(it.amount || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-2 py-2 text-right text-green-700 font-medium tracking-wider">
                        {Number(e.debit).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right text-blue-600 font-medium tracking-wider">
                        {credit.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right text-purple-600 font-bold tracking-wider">
                        {profit.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700 tracking-wider">
                        {new Date(e.created_at)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
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

                          <button
                            onClick={() => handlePrintSingle(e)}
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

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingEntry(e)}
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

                          {deletingId === e.id ? (
                            <div className="flex items-center justify-center w-3.5 h-3.5">
                              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(e.id)}
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

      {/* Edit Costing Modal */}
      {editingEntry && (
        <EditCostingModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null);
            fetchEntries();
          }}
        />
      )}

      {/* View Modal — inline */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
              <div>
                <h2 className="text-lg font-bold text-black tracking-wider">
                  Costing Entry {viewingEntry.invoice_number}
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

            <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300">
              <table className="min-w-full text-[11px] tracking-wider">
                <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase text-black">
                  <tr>
                    <th className="px-2 py-2 tracking-wider w-10">S.No</th>
                    <th className="px-2 py-2 tracking-wider">Purpose</th>
                    <th className="px-2 py-2 tracking-wider text-right w-32">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(viewingEntry.costing) &&
                  viewingEntry.costing.length > 0 ? (
                    viewingEntry.costing.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-center text-black tracking-wider">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 text-black tracking-wider">
                          {it.purpose || "—"}
                        </td>
                        <td className="px-2 py-2 text-right text-black tracking-wider">
                          {Number(it.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-gray-500 tracking-wider"
                      >
                        No items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 ml-auto w-full max-w-xs bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
              <div className="flex justify-between py-1 text-green-700 font-medium tracking-wider">
                <span className="tracking-wider">Debit:</span>
                <span className="tracking-wider">
                  Rs. {Number(viewingEntry.debit).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-blue-600 font-medium tracking-wider">
                <span className="tracking-wider">Credit:</span>
                <span className="tracking-wider">
                  Rs. {totalAmount(viewingEntry).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-purple-600 font-bold tracking-wider mt-1 pt-2 border-t border-gray-300">
                <span className="tracking-wider">Profit:</span>
                <span className="tracking-wider">
                  Rs. {(Number(viewingEntry.debit) - totalAmount(viewingEntry)).toFixed(2)}
                </span>
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
  );
}

/* ============================================================
   Edit Costing Modal (PATCH existing entry)
   - Invoice number is LOCKED (read-only / disabled)
   ============================================================ */
function EditCostingModal({
  entry,
  onClose,
  onSuccess,
}: {
  entry: Costing;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const initialItems =
    Array.isArray(entry.costing) && entry.costing.length > 0
      ? entry.costing.map((it) => ({
          purpose: it.purpose || "",
          amount: it.amount != null ? String(it.amount) : "",
        }))
      : [{ purpose: "", amount: "" }];

  const [items, setItems] = useState<{ purpose: string; amount: string }[]>(
    initialItems
  );
  const [debit, setDebit] = useState(
    entry.debit != null ? String(entry.debit) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = items.reduce(
    (sum, it) => sum + (parseFloat(it.amount) || 0),
    0
  );
  const totalDebit = parseFloat(debit) || 0;
  const profit = totalDebit - totalAmount;

  const addRow = () => setItems([...items, { purpose: "", amount: "" }]);

  const removeRow = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (
    idx: number,
    field: "purpose" | "amount",
    value: string
  ) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validItems = items.filter(
      (it) => it.purpose.trim() && it.amount.trim()
    );
    if (validItems.length === 0) {
      setError("Please add at least one purpose + amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        costing: validItems.map((it) => ({
          purpose: it.purpose.trim(),
          amount: parseFloat(it.amount) || 0,
        })),
        debit: totalDebit,
        credit: totalAmount,
        balance: Math.max(totalDebit - totalAmount, 0),
      };

      const res = await fetch(`/api/costing?id=${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    "w-full border border-gray-300 px-3 py-1.5 text-xs text-black bg-white outline-none focus:border-black focus:ring-1 focus:ring-black tracking-wider rounded-lg disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black tracking-wider">
            Edit Costing Entry
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black disabled:opacity-50 tracking-wider transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 tracking-wider rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 tracking-wider">
          <div>
            <label className="mb-1 block text-xs font-medium text-black tracking-wider">
              Invoice Number (locked)
            </label>
            <input
              value={entry.invoice_number}
              readOnly
              disabled
              className={`${inputClass} bg-gray-100 cursor-not-allowed`}
            />
          </div>

          {/* Purpose + Amount rows */}
          <div className="border-t border-gray-300 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black tracking-wider">
                Purposes & Amounts
              </span>
              <button
                type="button"
                onClick={addRow}
                className="text-xs font-semibold text-black hover:underline"
              >
                + Add Row
              </button>
            </div>

            {items.map((it, idx) => (
              <div
                key={idx}
                className="border border-gray-200 p-3 mb-3 bg-gray-50 relative"
              >
                <div className="flex gap-2 items-end pr-6">
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Purpose
                    </label>
                    <input
                      value={it.purpose}
                      onChange={(e) =>
                        updateItem(idx, "purpose", e.target.value)
                      }
                      placeholder="e.g. Printing, Rent, Travel"
                      className={inputClass}
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-[10px] text-gray-500 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={it.amount}
                      onChange={(e) =>
                        updateItem(idx, "amount", e.target.value)
                      }
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
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

            <div className="text-right text-xs text-gray-700 tracking-wider">
              Total Credit (Expense):{" "}
              <span className="font-semibold text-blue-600">
                Rs {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-300 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-black tracking-wider">
                Debit (Client Billed)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={debit}
                onChange={(e) => setDebit(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>

          {/* Profit Preview */}
          <div className="bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
            <div className="flex justify-between py-1 text-green-700 font-medium tracking-wider">
              <span className="tracking-wider">Debit (Client Billed):</span>
              <span className="tracking-wider">
                Rs. {totalDebit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-blue-600 font-medium tracking-wider">
              <span className="tracking-wider">Credit (Expense):</span>
              <span className="tracking-wider">
                Rs. {totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 py-1 font-bold text-purple-600 tracking-wider mt-1 pt-2">
              <span className="tracking-wider">Profit:</span>
              <span className="tracking-wider">
                Rs. {profit.toFixed(2)}
              </span>
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
              type="submit"
              disabled={submitting}
              className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60 tracking-wider transition-colors"
            >
              {submitting ? "Saving..." : "Update Costing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}