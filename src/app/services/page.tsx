"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import CreateServiceModal from "@/components/CreateServiceModal";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Protection import

interface Service {
  id: number;
  service_name: string;
  service_price: number;
  created_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete Loader State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (s: Service) => {
    setEditingService(s);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    setDeletingId(id); // Loader start
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    } finally {
      setDeletingId(null); // Loader stop
    }
  };

  // ✅ Filter services based on search term
  const filteredServices = services.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.service_name.toLowerCase().includes(term) ||
      String(s.service_price).includes(term) ||
      new Date(s.created_at)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <ProtectedRoute> {/* ✅ Yahan se protection shuru */}
      <main className="min-h-screen bg-white p-4 md:p-6 text-black tracking-wider">
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl font-bold tracking-wider text-black">Services</h1>

            <div className="flex flex-wrap items-center gap-3">
              {/* Quotations Page Button */}
              <Link
                href="/"
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                Quotations
              </Link>

              <button
                onClick={handleCreate}
                className="rounded-full border border-black bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-black shadow-sm transition hover:bg-black hover:text-white"
              >
                + Create Service
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchServices}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Button */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-white text-black shadow-sm transition hover:bg-black hover:text-white"
                  title="Filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 border border-gray-300 bg-white shadow-lg z-10 rounded-xl overflow-hidden">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setIsFilterOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        All Services
                      </button>
                      <button
                        onClick={() => {
                          setSearchTerm("Rs");
                          setIsFilterOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-black hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        With Price
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-[11px] tracking-wider table-fixed">
              {/* Table Head */}
              <thead className="bg-gray-50 text-left text-[9px] font-semibold uppercase tracking-wider text-black">
                <tr>
                  <th className="w-[10%] px-4 py-2 tracking-wider text-center">S.No</th>
                  <th className="w-[40%] px-4 py-2 tracking-wider">Service Name</th>
                  <th className="w-[20%] px-4 py-2 text-right tracking-wider">Service Price</th>
                  <th className="w-[15%] px-4 py-2 tracking-wider">Created</th>
                  <th className="w-[15%] px-4 py-2 text-center tracking-wider">Actions</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {Array.from({ length: 5 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-4">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredServices.length === 0 ? (
                  <tr>
                    {/* Empty State with Custom Image */}
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/no.png"
                          alt="No Services"
                          width={192}
                          height={192}
                          className="w-48 h-auto mb-4 object-contain opacity-80"
                          priority
                        />
                        <p className="text-sm font-semibold text-black tracking-wider">
                          {searchTerm ? "No matching services" : "No Services"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((s, index) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-black tracking-wider text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-black tracking-wider truncate">{s.service_name}</td>
                      <td className="px-4 py-3 text-right font-bold text-black tracking-wider">
                        Rs. {Number(s.service_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700 tracking-wider">
                        {new Date(s.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).replace(/ /g, "-")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Icon */}
                          <button onClick={() => handleEdit(s)} className="text-gray-500 hover:text-black transition-colors p-1" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>

                          {/* Delete Icon / Loader */}
                          {deletingId === s.id ? (
                            <div className="flex items-center justify-center w-3.5 h-3.5">
                              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 transition-colors p-1" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

        {isModalOpen && (
          <CreateServiceModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingService(null);
            }}
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingService(null);
              fetchServices();
            }}
            service={editingService}
          />
        )}
      </main>
    </ProtectedRoute> /* ✅ Yahan par khatam */
  );
}