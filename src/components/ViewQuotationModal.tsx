"use client";

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
  services: ServiceItem[]; // ✅ jsonb array
  sub_total: number;
  discount: number;
  total_price: number;
  created_at: string;
}

interface Props {
  quotation: Quotation;
  onClose: () => void;
}

export default function ViewQuotationModal({ quotation, onClose }: Props) {
  const serviceList = Array.isArray(quotation.services)
    ? quotation.services
    : [];

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* ✅ Rounded modal container */}
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl tracking-wider rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
          <div>
            <h2 className="text-lg font-bold text-black tracking-wider">
              Quotation {quotation.quotation_number}
            </h2>
            <p className="text-xs text-gray-500 tracking-wider mt-0.5">
              Issued on {formatDate(quotation.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-black tracking-wider transition-colors"
          >
            ×
          </button>
        </div>

        {/* Client Info */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-gray-300 pb-3">
          <div>
            <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
              Client Name
            </span>
            <span className="text-black font-medium tracking-wider">
              {quotation.client_name}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
              Quotation No
            </span>
            <span className="text-black font-medium tracking-wider">
              {quotation.quotation_number}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
              Email
            </span>
            <span className="text-black tracking-wider">
              {quotation.client_email || "—"}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-gray-500 tracking-wider mb-0.5">
              Phone
            </span>
            <span className="text-black tracking-wider">
              {quotation.client_phone_number || "—"}
            </span>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300">
          <table className="min-w-full text-[11px] tracking-wider">
            <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase text-black">
              <tr>
                <th className="px-2 py-2 tracking-wider w-12">S.No</th>
                <th className="px-2 py-2 tracking-wider">Service</th>
                <th className="px-2 py-2 tracking-wider w-28">Event</th>
                <th className="px-2 py-2 tracking-wider w-28">Date</th>
                <th className="px-2 py-2 tracking-wider text-right w-24">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {serviceList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500 tracking-wider"
                  >
                    No services
                  </td>
                </tr>
              ) : (
                serviceList.map((srv, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2 text-center text-black tracking-wider">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-2 text-black tracking-wider">
                      <div className="font-semibold">{srv.name}</div>
                      {srv.description && (
                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                          &quot;{srv.description}&quot;
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                      {srv.event || "—"}
                    </td>
                    <td className="px-2 py-2 text-black tracking-wider whitespace-nowrap">
                      {formatDate(srv.date)}
                    </td>
                    <td className="px-2 py-2 text-right text-black tracking-wider">
                      {Number(srv.price || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals — ✅ rounded box */}
        <div className="mt-4 ml-auto w-full max-w-xs bg-gray-50 p-4 text-xs text-black border border-gray-200 tracking-wider rounded-xl">
          <div className="flex justify-between py-1 tracking-wider">
            <span className="text-gray-700 tracking-wider">Sub Total:</span>
            <span className="font-medium text-black tracking-wider">
              Rs. {Number(quotation.sub_total).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-1 tracking-wider">
            <span className="text-gray-700 tracking-wider">Discount:</span>
            <span className="font-medium text-red-600 tracking-wider">
              - Rs. {Number(quotation.discount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-300 py-1 font-bold text-black tracking-wider">
            <span className="tracking-wider">Total Price:</span>
            <span className="tracking-wider">
              Rs. {Number(quotation.total_price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer — ✅ rounded button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-black hover:bg-gray-100 tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}