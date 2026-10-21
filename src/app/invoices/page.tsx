// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";

// interface Invoice {
//   id: number;
//   quotation_number: string;
//   client_name: string;
//   client_email: string | null;
//   client_phone_number: string | null;
//   service_name: string;
//   service_price: number;
//   service_description: string | null;
//   service_date: string | null;
//   sub_total: number;
//   discount: number;
//   total_price: number;
//   received_amount: number;
//   remaining_amount: number;
//   created_at: string;
// }

// export default function InvoicesPage() {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
//   const filterRef = useRef<HTMLDivElement>(null);

//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/invoices");
//       const data = await res.json();
//       setInvoices(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvoices();
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

//   // ✅ PRINT ALL INVOICES (report)
//   const handlePrintAll = () => {
//     if (invoices.length === 0) {
//       alert("No invoices to print.");
//       return;
//     }

//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//       alert("Please allow popups to print.");
//       return;
//     }

//     const grandTotal = invoices.reduce(
//       (sum, i) => sum + Number(i.total_price || 0),
//       0
//     );
//     const grandReceived = invoices.reduce(
//       (sum, i) => sum + Number(i.received_amount || 0),
//       0
//     );
//     const grandRemaining = invoices.reduce(
//       (sum, i) => sum + Number(i.remaining_amount || 0),
//       0
//     );

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>All Invoices Report</title>
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
//             .received-cell { color: #15803d; font-weight: bold; }
//             .remaining-cell { color: #dc2626; font-weight: bold; }
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
//                 <div class="main-title">Invoices Report</div>
//                 <div class="sub-title">Total ${invoices.length} invoice(s)</div>
//               </div>
//             </div>

//             <table class="data-table">
//               <thead>
//                 <tr>
//                   <th style="width:40px">S.No</th>
//                   <th style="width:80px">Inv.No</th>
//                   <th>Client</th>
//                   <th>Phone</th>
//                   <th>Services</th>
//                   <th style="width:80px" class="numeric-cell">Sub Total</th>
//                   <th style="width:60px" class="numeric-cell">Disc.</th>
//                   <th style="width:80px" class="numeric-cell">Total</th>
//                   <th style="width:80px" class="numeric-cell">Received</th>
//                   <th style="width:80px" class="numeric-cell">Remaining</th>
//                   <th style="width:80px">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${invoices
//                   .map((inv, idx) => {
//                     const dateStr = new Date(inv.created_at)
//                       .toLocaleDateString("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       })
//                       .replace(/ /g, "-");
//                     return `
//                       <tr>
//                         <td class="center-cell">${idx + 1}</td>
//                         <td>${inv.quotation_number}</td>
//                         <td>${inv.client_name}</td>
//                         <td>${inv.client_phone_number || "-"}</td>
//                         <td>${inv.service_name || "-"}</td>
//                         <td class="numeric-cell">${Number(inv.sub_total).toFixed(2)}</td>
//                         <td class="numeric-cell">${Number(inv.discount).toFixed(2)}</td>
//                         <td class="numeric-cell"><b>${Number(inv.total_price).toFixed(2)}</b></td>
//                         <td class="numeric-cell received-cell">${Number(inv.received_amount).toFixed(2)}</td>
//                         <td class="numeric-cell remaining-cell">${Number(inv.remaining_amount).toFixed(2)}</td>
//                         <td class="center-cell">${dateStr}</td>
//                       </tr>
//                     `;
//                   })
//                   .join("")}
//               </tbody>
//               <tfoot>
//                 <tr class="footer-totals">
//                   <td colspan="5" class="numeric-cell">GRAND TOTALS:</td>
//                   <td class="numeric-cell">Rs ${grandTotal.toFixed(2)}</td>
//                   <td></td>
//                   <td class="numeric-cell">Rs ${grandTotal.toFixed(2)}</td>
//                   <td class="numeric-cell received-cell">Rs ${grandReceived.toFixed(2)}</td>
//                   <td class="numeric-cell remaining-cell">Rs ${grandRemaining.toFixed(2)}</td>
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

//   const handlePrint = (inv: Invoice) => {
//     const printWindow = window.open("", "_blank");
//     if (!printWindow) {
//       alert("Please allow popups to print the receipt.");
//       return;
//     }

//     const serviceNames = inv.service_name ? inv.service_name.split(", ") : [];
//     const serviceDescriptions = inv.service_description
//       ? inv.service_description.split(", ")
//       : [];
//     const serviceDates = inv.service_date ? inv.service_date.split(", ") : [];
//     const perServicePrice =
//       serviceNames.length > 0
//         ? Number(inv.service_price) / serviceNames.length
//         : 0;

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Invoice - ${inv.quotation_number}</title>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
//             * { font-family: 'DM Sans', sans-serif !important; letter-spacing: 0.05em; margin: 0; padding: 0; box-sizing: border-box; }
//             body { margin: 0; padding: 8px; color: #000; background: white; font-size: 12px; }
//             .print-container { max-width: 1000px; margin: 0 auto; border: 1px solid #000; display: flex; flex-direction: column; min-height: 95vh; padding: 20px; }
//             .header-section { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
//             .logo-img { height: 80px; object-fit: contain; }
//             .title-section { text-align: right; margin-top: 10px; }
//             .main-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; }
//             .info-section { margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
//             .info-table { width: 100%; border-collapse: collapse; font-size: 11px; }
//             .info-table td { padding: 4px; vertical-align: top; }
//             .info-label { font-weight: bold; white-space: nowrap; }
//             .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
//             .data-table th { background: #f0f0f0; padding: 8px; text-align: center; font-weight: bold; border: 1px solid #000; }
//             .data-table td { padding: 6px 8px; border: 1px solid #000; }
//             .numeric-cell { text-align: right; }
//             .center-cell { text-align: center; }
//             .total-row { background: #e8f5e8 !important; font-weight: bold; font-size: 12px; }
//             .received-row { color: #15803d; font-weight: bold; }
//             .remaining-row { color: #dc2626; font-weight: bold; }
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
//                 <div class="main-title">Invoice</div>
//               </div>
//             </div>

//             <div class="info-section">
//               <table class="info-table"><tbody>
//                 <tr>
//                   <td class="info-label" style="width:15%">Client Name:</td><td style="width:35%">${inv.client_name}</td>
//                   <td class="info-label" style="width:15%">Invoice No:</td><td style="width:35%">${inv.quotation_number}</td>
//                 </tr>
//                 <tr>
//                   <td class="info-label">Phone Number:</td><td>${inv.client_phone_number || "N/A"}</td>
//                   <td class="info-label">Date Issued:</td><td>${new Date(inv.created_at)
//                     .toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                     .replace(/ /g, "-")}</td>
//                 </tr>
//                 <tr>
//                   <td class="info-label">Email Address:</td><td colspan="3">${inv.client_email || "N/A"}</td>
//                 </tr>
//               </tbody></table>
//             </div>

//             <div>
//               <table class="data-table">
//                 <thead>
//                   <tr>
//                     <th style="width:50px">S.No</th>
//                     <th>Service Description</th>
//                     <th style="width:120px">Date</th>
//                     <th style="width:100px">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${serviceNames
//                     .map((name, idx) => {
//                       const dateStr = serviceDates[idx]
//                         ? new Date(serviceDates[idx])
//                             .toLocaleDateString("en-GB", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                             })
//                             .replace(/ /g, "-")
//                         : "-";
//                       return `
//                       <tr>
//                         <td class="center-cell">${idx + 1}</td>
//                         <td>
//                           <div style="font-weight:bold; font-size:12px;">${name}</div>
//                           ${
//                             serviceDescriptions[idx]
//                               ? `<div style="font-size:10px; color:#555; font-style:italic; margin-top:2px;">"${serviceDescriptions[idx]}"</div>`
//                               : ""
//                           }
//                         </td>
//                         <td class="center-cell">${dateStr}</td>
//                         <td class="numeric-cell">${perServicePrice.toFixed(2)}</td>
//                       </tr>
//                     `;
//                     })
//                     .join("")}
//                 </tbody>
//                 <tfoot>
//                   <tr>
//                     <td colspan="3" class="numeric-cell" style="font-weight:bold">Sub Total:</td>
//                     <td class="numeric-cell" style="font-weight:bold">Rs ${Number(inv.sub_total).toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td colspan="3" class="numeric-cell" style="color:red">Discount:</td>
//                     <td class="numeric-cell" style="color:red">- Rs ${Number(inv.discount).toFixed(2)}</td>
//                   </tr>
//                   <tr class="total-row">
//                     <td colspan="3" class="numeric-cell">GRAND TOTAL:</td>
//                     <td class="numeric-cell">Rs ${Number(inv.total_price).toFixed(2)}</td>
//                   </tr>
//                   <tr class="received-row">
//                     <td colspan="3" class="numeric-cell">RECEIVED:</td>
//                     <td class="numeric-cell">Rs ${Number(inv.received_amount).toFixed(2)}</td>
//                   </tr>
//                   <tr class="remaining-row">
//                     <td colspan="3" class="numeric-cell">REMAINING:</td>
//                     <td class="numeric-cell">Rs ${Number(inv.remaining_amount).toFixed(2)}</td>
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
//     if (!confirm("Are you sure you want to delete this invoice?")) return;
//     setDeletingId(id);
//     try {
//       const res = await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Failed to delete invoice");
//       fetchInvoices();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete invoice. Check your API route.");
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
//             Invoices
//           </h1>

//           <div className="flex flex-wrap items-center gap-3">
//             <Link
//               href="/"
//               className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//             >
//               Quotations
//             </Link>

//             <Link
//               href="/services"
//               className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//             >
//               Services
//             </Link>

//             {/* ✅ Print All Invoices button */}
//             <button
//               onClick={handlePrintAll}
//               className="flex items-center gap-1.5 rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
//               title="Print All Invoices"
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
//               onClick={fetchInvoices}
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
//                       All Invoices
//                     </button>
//                     <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
//                       Pending Payment
//                     </button>
//                     <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
//                       Fully Paid
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
//           <table className="min-w-full divide-y divide-gray-200 text-[11px] tracking-wider">
//             <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase tracking-wider text-black">
//               <tr>
//                 <th className="px-2 py-2 tracking-wider">Inv.No</th>
//                 <th className="px-2 py-2 tracking-wider">Client</th>
//                 <th className="px-2 py-2 tracking-wider">Email</th>
//                 <th className="px-2 py-2 tracking-wider">Phone</th>
//                 <th className="px-2 py-2 tracking-wider">Services</th>
//                 <th className="px-2 py-2 text-right tracking-wider">
//                   Sub Total
//                 </th>
//                 <th className="px-2 py-2 text-right tracking-wider">Disc.</th>
//                 <th className="px-2 py-2 text-right tracking-wider">Total</th>
//                 <th className="px-2 py-2 text-right tracking-wider">
//                   Received
//                 </th>
//                 <th className="px-2 py-2 text-right tracking-wider">
//                   Remaining
//                 </th>
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
//                     {Array.from({ length: 12 }).map((_, colIndex) => (
//                       <td key={colIndex} className="px-2 py-2">
//                         <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : invoices.length === 0 ? (
//                 <tr>
//                   <td colSpan={12} className="px-4 py-16 text-center">
//                     <div className="flex flex-col items-center justify-center">
//                       <img
//                         src="/no.png"
//                         alt="No Invoices"
//                         className="w-48 h-auto mb-4 object-contain opacity-80"
//                       />
//                       <p className="text-sm font-semibold text-black tracking-wider">
//                         No Invoices
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 invoices.map((inv) => (
//                   <tr
//                     key={inv.id}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-2 py-2 font-medium text-black tracking-wider">
//                       {inv.quotation_number}
//                     </td>
//                     <td
//                       className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[100px]"
//                       title={inv.client_name}
//                     >
//                       {inv.client_name}
//                     </td>
//                     <td
//                       className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[120px]"
//                       title={inv.client_email || ""}
//                     >
//                       {inv.client_email || "—"}
//                     </td>
//                     <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
//                       {inv.client_phone_number || "—"}
//                     </td>
//                     <td
//                       className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[160px]"
//                       title={inv.service_name}
//                     >
//                       {inv.service_name || "—"}
//                     </td>
//                     <td className="px-2 py-2 text-right text-black tracking-wider">
//                       {Number(inv.sub_total).toFixed(2)}
//                     </td>
//                     <td className="px-2 py-2 text-right text-black tracking-wider">
//                       {Number(inv.discount).toFixed(2)}
//                     </td>
//                     <td className="px-2 py-2 text-right font-bold text-black tracking-wider">
//                       {Number(inv.total_price).toFixed(2)}
//                     </td>
//                     <td className="px-2 py-2 text-right text-green-700 font-medium tracking-wider">
//                       {Number(inv.received_amount).toFixed(2)}
//                     </td>
//                     <td className="px-2 py-2 text-right text-red-600 font-medium tracking-wider">
//                       {Number(inv.remaining_amount).toFixed(2)}
//                     </td>
//                     <td className="px-2 py-2 whitespace-nowrap text-gray-700 tracking-wider">
//                       {new Date(inv.created_at)
//                         .toLocaleDateString("en-GB", {
//                           day: "2-digit",
//                           month: "short",
//                           year: "2-digit",
//                         })
//                         .replace(/ /g, "-")}
//                     </td>
//                     <td className="px-2 py-2 text-center">
//                       <div className="flex items-center justify-center gap-1.5">
//                         <button
//                           onClick={() => setViewingInvoice(inv)}
//                           className="text-gray-500 hover:text-black transition-colors p-1"
//                           title="View"
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             strokeWidth={2}
//                             stroke="currentColor"
//                             className="w-3.5 h-3.5"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
//                             />
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                             />
//                           </svg>
//                         </button>

//                         <button
//                           onClick={() => handlePrint(inv)}
//                           className="text-gray-500 hover:text-black transition-colors p-1"
//                           title="Print / PDF"
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             strokeWidth={2}
//                             stroke="currentColor"
//                             className="w-3.5 h-3.5"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
//                             />
//                           </svg>
//                         </button>

//                         {deletingId === inv.id ? (
//                           <div className="flex items-center justify-center w-3.5 h-3.5">
//                             <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => handleDelete(inv.id)}
//                             className="text-red-500 hover:text-red-700 transition-colors p-1"
//                             title="Delete"
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
//                                 d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
//                               />
//                             </svg>
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* View Invoice Modal — inline */}
//       {viewingInvoice && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
//             <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
//               <div>
//                 <h2 className="text-lg font-bold text-black tracking-wider">
//                   Invoice {viewingInvoice.quotation_number}
//                 </h2>
//                 <p className="text-xs text-gray-500 tracking-wider mt-0.5">
//                   Issued on{" "}
//                   {new Date(viewingInvoice.created_at)
//                     .toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                     .replace(/ /g, "-")}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setViewingInvoice(null)}
//                 className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black tracking-wider transition-colors"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-gray-300 pb-3">
//               <div>
//                 <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
//                   Client Name
//                 </span>
//                 <span className="text-black font-medium tracking-wider">
//                   {viewingInvoice.client_name}
//                 </span>
//               </div>
//               <div>
//                 <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
//                   Invoice No
//                 </span>
//                 <span className="text-black font-medium tracking-wider">
//                   {viewingInvoice.quotation_number}
//                 </span>
//               </div>
//               <div>
//                 <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
//                   Email
//                 </span>
//                 <span className="text-black tracking-wider">
//                   {viewingInvoice.client_email || "—"}
//                 </span>
//               </div>
//               <div>
//                 <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
//                   Phone
//                 </span>
//                 <span className="text-black tracking-wider">
//                   {viewingInvoice.client_phone_number || "—"}
//                 </span>
//               </div>
//             </div>

//             <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300">
//               <table className="min-w-full text-[11px] tracking-wider">
//                 <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase text-black">
//                   <tr>
//                     <th className="px-2 py-2 tracking-wider">Service</th>
//                     <th className="px-2 py-2 tracking-wider w-28">Date</th>
//                     <th className="px-2 py-2 tracking-wider text-right w-24">
//                       Amount
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 bg-white">
//                   {viewingInvoice.service_name
//                     .split(", ")
//                     .map((name, idx) => {
//                       const desc = viewingInvoice.service_description
//                         ? viewingInvoice.service_description.split(", ")[idx]
//                         : "";
//                       const dt = viewingInvoice.service_date
//                         ? viewingInvoice.service_date.split(", ")[idx]
//                         : "";
//                       const count = viewingInvoice.service_name.split(
//                         ", "
//                       ).length;
//                       const amt =
//                         Number(viewingInvoice.service_price) / (count || 1);
//                       return (
//                         <tr key={idx}>
//                           <td className="px-2 py-2 text-black tracking-wider">
//                             <div className="font-semibold">{name}</div>
//                             {desc && (
//                               <div className="text-[10px] text-gray-500 italic mt-0.5">
//                                 &quot;{desc}&quot;
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
//                             {dt
//                               ? new Date(dt)
//                                   .toLocaleDateString("en-GB", {
//                                     day: "2-digit",
//                                     month: "short",
//                                     year: "numeric",
//                                   })
//                                   .replace(/ /g, "-")
//                               : "-"}
//                           </td>
//                           <td className="px-2 py-2 text-right text-black tracking-wider">
//                             {amt.toFixed(2)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mt-4 ml-auto w-full max-w-xs bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
//               <div className="flex justify-between py-1 tracking-wider">
//                 <span className="text-gray-700 tracking-wider">Sub Total:</span>
//                 <span className="font-medium text-black tracking-wider">
//                   Rs. {Number(viewingInvoice.sub_total).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between py-1 tracking-wider">
//                 <span className="text-gray-700 tracking-wider">Discount:</span>
//                 <span className="font-medium text-red-600 tracking-wider">
//                   - Rs. {Number(viewingInvoice.discount).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between border-t border-gray-300 py-1 font-bold text-black tracking-wider">
//                 <span className="tracking-wider">Total Price:</span>
//                 <span className="tracking-wider">
//                   Rs. {Number(viewingInvoice.total_price).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between py-1 text-green-700 font-medium tracking-wider">
//                 <span className="tracking-wider">Received:</span>
//                 <span className="tracking-wider">
//                   Rs. {Number(viewingInvoice.received_amount).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between py-1 text-red-600 font-medium tracking-wider">
//                 <span className="tracking-wider">Remaining:</span>
//                 <span className="tracking-wider">
//                   Rs. {Number(viewingInvoice.remaining_amount).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewingInvoice(null)}
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


"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
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

  // ✅ PRINT ALL INVOICES (report)
  const handlePrintAll = () => {
    if (invoices.length === 0) {
      alert("No invoices to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    const grandTotal = invoices.reduce(
      (sum, i) => sum + Number(i.total_price || 0),
      0
    );
    const grandReceived = invoices.reduce(
      (sum, i) => sum + Number(i.received_amount || 0),
      0
    );
    const grandRemaining = invoices.reduce(
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
                <div class="sub-title">Total ${invoices.length} invoice(s)</div>
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
                  <th style="width:80px">Date</th>
                </tr>
              </thead>
              <tbody>
                ${invoices
                  .map((inv, idx) => {
                    const dateStr = new Date(inv.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/ /g, "-");
                    return `
                      <tr>
                        <td class="center-cell">${idx + 1}</td>
                        <td>${inv.quotation_number}</td>
                        <td>${inv.client_name}</td>
                        <td>${inv.client_phone_number || "-"}</td>
                        <td>${inv.service_name || "-"}</td>
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

  const handlePrint = (inv: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the receipt.");
      return;
    }

    const serviceNames = inv.service_name ? inv.service_name.split(", ") : [];
    const serviceDescriptions = inv.service_description
      ? inv.service_description.split(", ")
      : [];
    const serviceDates = inv.service_date ? inv.service_date.split(", ") : [];
    const perServicePrice =
      serviceNames.length > 0
        ? Number(inv.service_price) / serviceNames.length
        : 0;

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
                    <th style="width:120px">Date</th>
                    <th style="width:100px">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${serviceNames
                    .map((name, idx) => {
                      const dateStr = serviceDates[idx]
                        ? new Date(serviceDates[idx])
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
                          <div style="font-weight:bold; font-size:12px;">${name}</div>
                          ${
                            serviceDescriptions[idx]
                              ? `<div style="font-size:10px; color:#555; font-style:italic; margin-top:2px;">"${serviceDescriptions[idx]}"</div>`
                              : ""
                          }
                        </td>
                        <td class="center-cell">${dateStr}</td>
                        <td class="numeric-cell">${perServicePrice.toFixed(2)}</td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="numeric-cell" style="font-weight:bold">Sub Total:</td>
                    <td class="numeric-cell" style="font-weight:bold">Rs ${Number(inv.sub_total).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="numeric-cell" style="color:red">Discount:</td>
                    <td class="numeric-cell" style="color:red">- Rs ${Number(inv.discount).toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" class="numeric-cell">GRAND TOTAL:</td>
                    <td class="numeric-cell">Rs ${Number(inv.total_price).toFixed(2)}</td>
                  </tr>
                  <tr class="received-row">
                    <td colspan="3" class="numeric-cell">RECEIVED:</td>
                    <td class="numeric-cell">Rs ${Number(inv.received_amount).toFixed(2)}</td>
                  </tr>
                  <tr class="remaining-row">
                    <td colspan="3" class="numeric-cell">REMAINING:</td>
                    <td class="numeric-cell">Rs ${Number(inv.remaining_amount).toFixed(2)}</td>
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

            {/* ✅ Print All Invoices button */}
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
                      All Invoices
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
                      Pending Payment
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg">
                      Fully Paid
                    </button>
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
                <th className="px-2 py-2 tracking-wider">Services</th>
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
                    {Array.from({ length: 12 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-2 py-2">
                        <div className="h-3 bg-gray-200 rounded w-full min-w-[30px]"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
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
                        No Invoices
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
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
                      className="px-2 py-2 text-black tracking-wider whitespace-nowrap truncate max-w-[160px]"
                      title={inv.service_name}
                    >
                      {inv.service_name || "—"}
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
                      {new Date(inv.created_at)
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
                ))
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
                    <th className="px-2 py-2 tracking-wider w-28">Date</th>
                    <th className="px-2 py-2 tracking-wider text-right w-24">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {viewingInvoice.service_name
                    .split(", ")
                    .map((name, idx) => {
                      const desc = viewingInvoice.service_description
                        ? viewingInvoice.service_description.split(", ")[idx]
                        : "";
                      const dt = viewingInvoice.service_date
                        ? viewingInvoice.service_date.split(", ")[idx]
                        : "";
                      const count = viewingInvoice.service_name.split(
                        ", "
                      ).length;
                      const amt =
                        Number(viewingInvoice.service_price) / (count || 1);
                      return (
                        <tr key={idx}>
                          <td className="px-2 py-2 text-black tracking-wider">
                            <div className="font-semibold">{name}</div>
                            {desc && (
                              <div className="text-[10px] text-gray-500 italic mt-0.5">
                                &quot;{desc}&quot;
                              </div>
                            )}
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
                            {amt.toFixed(2)}
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
    </main>
  );
}