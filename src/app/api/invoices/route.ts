// // // import { NextRequest, NextResponse } from "next/server";
// // // import { createClient } from "@supabase/supabase-js";

// // // const supabase = createClient(
// // //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // //   process.env.SUPABASE_SERVICE_ROLE_KEY!
// // // );

// // // // GET all invoices
// // // export async function GET() {
// // //   const { data, error } = await supabase
// // //     .from("invoices")
// // //     .select("*")
// // //     .order("created_at", { ascending: false });

// // //   if (error) {
// // //     return NextResponse.json({ error: error.message }, { status: 500 });
// // //   }
// // //   return NextResponse.json(data);
// // // }

// // // // POST create invoice + costing entry
// // // export async function POST(req: NextRequest) {
// // //   try {
// // //     const body = await req.json();

// // //     // ---------- 1. Build invoice payload ----------
// // //     const invoicePayload = {
// // //       quotation_number: body.quotation_number,
// // //       client_name: body.client_name,
// // //       client_email: body.client_email,
// // //       client_phone_number: body.client_phone_number,
// // //       service_name: body.service_name,
// // //       service_price: body.service_price,
// // //       service_description: body.service_description,
// // //       service_date: body.service_date,
// // //       sub_total: body.sub_total,
// // //       discount: body.discount,
// // //       total_price: body.total_price,
// // //       received_amount: body.received_amount,
// // //       remaining_amount: body.remaining_amount,
// // //     };

// // //     // ---------- 2. Insert invoice ----------
// // //     const { data: invoiceData, error: invoiceError } = await supabase
// // //       .from("invoices")
// // //       .insert(invoicePayload)
// // //       .select()
// // //       .single();

// // //     if (invoiceError) {
// // //       return NextResponse.json(
// // //         { error: invoiceError.message },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // ---------- 3. Build costing payload ----------
// // //     // debit  = total amount owed by client (total_price)
// // //     // credit = amount received from client (received_amount)
// // //     // balance = remaining (total_price - received_amount)
// // //     const totalPrice = Number(body.total_price) || 0;
// // //     const received = Number(body.received_amount) || 0;
// // //     const balance = Math.max(totalPrice - received, 0);

// // //     const costingPayload = {
// // //       invoice_number: body.quotation_number,
// // //       costing: body.services || [], // ✅ jsonb array of {name, price, description, date}
// // //       debit: totalPrice,
// // //       credit: received,
// // //       balance,
// // //     };

// // //     const { data: costingData, error: costingError } = await supabase
// // //       .from("costing")
// // //       .insert(costingPayload)
// // //       .select()
// // //       .single();

// // //     if (costingError) {
// // //       // Invoice was created, but costing failed — surface the error clearly
// // //       return NextResponse.json(
// // //         {
// // //           error: `Invoice created but costing failed: ${costingError.message}`,
// // //           invoice: invoiceData,
// // //         },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // ---------- 4. Success ----------
// // //     return NextResponse.json(
// // //       {
// // //         invoice: invoiceData,
// // //         costing: costingData,
// // //       },
// // //       { status: 201 }
// // //     );
// // //   } catch (err: any) {
// // //     return NextResponse.json({ error: err.message }, { status: 500 });
// // //   }
// // // }

// // // // DELETE invoice (also removes matching costing row)
// // // export async function DELETE(req: NextRequest) {
// // //   try {
// // //     const { searchParams } = new URL(req.url);
// // //     const id = searchParams.get("id");
// // //     if (!id) {
// // //       return NextResponse.json({ error: "Missing id" }, { status: 400 });
// // //     }

// // //     // Get the invoice first so we know its quotation_number
// // //     const { data: inv, error: fetchErr } = await supabase
// // //       .from("invoices")
// // //       .select("quotation_number")
// // //       .eq("id", id)
// // //       .single();

// // //     if (fetchErr || !inv) {
// // //       return NextResponse.json(
// // //         { error: fetchErr?.message || "Invoice not found" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // Delete invoice
// // //     const { error: delInvErr } = await supabase
// // //       .from("invoices")
// // //       .delete()
// // //       .eq("id", id);

// // //     if (delInvErr) {
// // //       return NextResponse.json({ error: delInvErr.message }, { status: 400 });
// // //     }

// // //     // Delete matching costing row (best-effort)
// // //     await supabase
// // //       .from("costing")
// // //       .delete()
// // //       .eq("invoice_number", inv.quotation_number);

// // //     return NextResponse.json({ success: true });
// // //   } catch (err: any) {
// // //     return NextResponse.json({ error: err.message }, { status: 500 });
// // //   }
// // // }


// // import { NextRequest, NextResponse } from "next/server";
// // import { createClient } from "@supabase/supabase-js";

// // const supabase = createClient(
// //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //   process.env.SUPABASE_SERVICE_ROLE_KEY!
// // );

// // // ✅ per-service shape (with event)
// // interface ServiceItem {
// //   name: string;
// //   price: number;
// //   description: string;
// //   date: string;
// //   event: string;
// // }

// // function normalizeServices(raw: unknown): ServiceItem[] {
// //   if (!Array.isArray(raw)) return [];
// //   return raw
// //     .filter((s) => s && typeof s === "object")
// //     .map((s: any) => ({
// //       name: typeof s.name === "string" ? s.name : "",
// //       price: Number(s.price) || 0,
// //       description: typeof s.description === "string" ? s.description : "",
// //       date: typeof s.date === "string" ? s.date : "",
// //       event: typeof s.event === "string" ? s.event : "",
// //     }));
// // }

// // // GET all invoices
// // export async function GET() {
// //   const { data, error } = await supabase
// //     .from("invoices")
// //     .select("*")
// //     .order("created_at", { ascending: false });

// //   if (error) {
// //     return NextResponse.json({ error: error.message }, { status: 500 });
// //   }

// //   // ✅ Ensure every invoice has a normalized services array (with event)
// //   const normalized = (data || []).map((inv) => ({
// //     ...inv,
// //     services: normalizeServices(inv.services),
// //   }));

// //   return NextResponse.json(normalized);
// // }

// // // POST create invoice + costing entry
// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();

// //     const servicesJsonb = normalizeServices(body.services);

// //     // ---------- 1. Build invoice payload ----------
// //     const invoicePayload = {
// //       quotation_number: body.quotation_number,
// //       client_name: body.client_name,
// //       client_email: body.client_email,
// //       client_phone_number: body.client_phone_number,
// //       service_name: body.service_name,
// //       service_price: body.service_price,
// //       service_description: body.service_description,
// //       service_date: body.service_date,
// //       sub_total: body.sub_total,
// //       discount: body.discount,
// //       total_price: body.total_price,
// //       received_amount: body.received_amount,
// //       remaining_amount: body.remaining_amount,
// //       services: servicesJsonb, // ✅ store per-service array (with event) on invoice
// //     };

// //     // ---------- 2. Insert invoice ----------
// //     const { data: invoiceData, error: invoiceError } = await supabase
// //       .from("invoices")
// //       .insert(invoicePayload)
// //       .select()
// //       .single();

// //     if (invoiceError) {
// //       return NextResponse.json(
// //         { error: invoiceError.message },
// //         { status: 400 }
// //       );
// //     }

// //     // ---------- 3. Build costing payload ----------
// //     const totalPrice = Number(body.total_price) || 0;
// //     const received = Number(body.received_amount) || 0;
// //     const balance = Math.max(totalPrice - received, 0);

// //     const costingPayload = {
// //       invoice_number: body.quotation_number,
// //       costing: servicesJsonb, // ✅ same array (with event) goes into costing jsonb
// //       debit: totalPrice,
// //       credit: received,
// //       balance,
// //     };

// //     const { data: costingData, error: costingError } = await supabase
// //       .from("costing")
// //       .insert(costingPayload)
// //       .select()
// //       .single();

// //     if (costingError) {
// //       return NextResponse.json(
// //         {
// //           error: `Invoice created but costing failed: ${costingError.message}`,
// //           invoice: invoiceData,
// //         },
// //         { status: 400 }
// //       );
// //     }

// //     // ---------- 4. Success ----------
// //     return NextResponse.json(
// //       {
// //         invoice: invoiceData,
// //         costing: costingData,
// //       },
// //       { status: 201 }
// //     );
// //   } catch (err: any) {
// //     return NextResponse.json({ error: err.message }, { status: 500 });
// //   }
// // }

// // // DELETE invoice (also removes matching costing row)
// // export async function DELETE(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const id = searchParams.get("id");
// //     if (!id) {
// //       return NextResponse.json({ error: "Missing id" }, { status: 400 });
// //     }

// //     const { data: inv, error: fetchErr } = await supabase
// //       .from("invoices")
// //       .select("quotation_number")
// //       .eq("id", id)
// //       .single();

// //     if (fetchErr || !inv) {
// //       return NextResponse.json(
// //         { error: fetchErr?.message || "Invoice not found" },
// //         { status: 400 }
// //       );
// //     }

// //     const { error: delInvErr } = await supabase
// //       .from("invoices")
// //       .delete()
// //       .eq("id", id);

// //     if (delInvErr) {
// //       return NextResponse.json({ error: delInvErr.message }, { status: 400 });
// //     }

// //     await supabase
// //       .from("costing")
// //       .delete()
// //       .eq("invoice_number", inv.quotation_number);

// //     return NextResponse.json({ success: true });
// //   } catch (err: any) {
// //     return NextResponse.json({ error: err.message }, { status: 500 });
// //   }
// // }


// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// // ✅ per-service shape (with event)
// interface ServiceItem {
//   name: string;
//   price: number;
//   description: string;
//   date: string;
//   event: string;
// }

// function normalizeServices(raw: unknown): ServiceItem[] {
//   if (!Array.isArray(raw)) return [];
//   return raw
//     .filter((s) => s && typeof s === "object")
//     .map((s: any) => ({
//       name: typeof s.name === "string" ? s.name : "",
//       price: Number(s.price) || 0,
//       description: typeof s.description === "string" ? s.description : "",
//       date: typeof s.date === "string" ? s.date : "",
//       event: typeof s.event === "string" ? s.event : "",
//     }));
// }

// // GET all invoices
// export async function GET() {
//   const { data, error } = await supabase
//     .from("invoices")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   // ✅ Ensure every invoice has a normalized services array (with event)
//   const normalized = (data || []).map((inv) => ({
//     ...inv,
//     services: normalizeServices(inv.services),
//   }));

//   return NextResponse.json(normalized);
// }

// // POST create invoice + costing entry
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const servicesJsonb = normalizeServices(body.services);

//     // ---------- 1. Build invoice payload ----------
//     const invoicePayload = {
//       quotation_number: body.quotation_number,
//       client_name: body.client_name,
//       client_email: body.client_email,
//       client_phone_number: body.client_phone_number,
//       service_name: body.service_name,
//       service_price: body.service_price,
//       service_description: body.service_description,
//       service_date: body.service_date,
//       sub_total: body.sub_total,
//       discount: body.discount,
//       total_price: body.total_price,
//       received_amount: body.received_amount,
//       remaining_amount: body.remaining_amount,
//       services: servicesJsonb, // ✅ store per-service array (with event) on invoice
//     };

//     // ---------- 2. Insert invoice ----------
//     const { data: invoiceData, error: invoiceError } = await supabase
//       .from("invoices")
//       .insert(invoicePayload)
//       .select()
//       .single();

//     if (invoiceError) {
//       return NextResponse.json(
//         { error: invoiceError.message },
//         { status: 400 }
//       );
//     }

//     // ---------- 3. Build costing payload ----------
//     const totalPrice = Number(body.total_price) || 0;
//     const received = Number(body.received_amount) || 0;
//     const balance = Math.max(totalPrice - received, 0);

//     const costingPayload = {
//       invoice_number: body.quotation_number,
//       costing: servicesJsonb, // ✅ same array (with event) goes into costing jsonb
//       debit: totalPrice,
//       credit: received,
//       balance,
//     };

//     const { data: costingData, error: costingError } = await supabase
//       .from("costing")
//       .insert(costingPayload)
//       .select()
//       .single();

//     if (costingError) {
//       return NextResponse.json(
//         {
//           error: `Invoice created but costing failed: ${costingError.message}`,
//           invoice: invoiceData,
//         },
//         { status: 400 }
//       );
//     }

//     // ---------- 4. Success ----------
//     return NextResponse.json(
//       {
//         invoice: invoiceData,
//         costing: costingData,
//       },
//       { status: 201 }
//     );
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // ✅ PUT update payment (received_amount + remaining_amount) on invoice AND costing
// export async function PUT(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const id = body.id;

//     if (!id) {
//       return NextResponse.json({ error: "Missing id" }, { status: 400 });
//     }

//     const received = Number(body.received_amount);
//     if (isNaN(received) || received < 0) {
//       return NextResponse.json(
//         { error: "Invalid received_amount" },
//         { status: 400 }
//       );
//     }

//     // ---------- 1. Fetch the invoice to get total + quotation_number ----------
//     const { data: inv, error: fetchErr } = await supabase
//       .from("invoices")
//       .select("quotation_number, total_price")
//       .eq("id", id)
//       .single();

//     if (fetchErr || !inv) {
//       return NextResponse.json(
//         { error: fetchErr?.message || "Invoice not found" },
//         { status: 400 }
//       );
//     }

//     const total = Number(inv.total_price) || 0;
//     if (received > total) {
//       return NextResponse.json(
//         { error: "Received amount cannot exceed total price" },
//         { status: 400 }
//       );
//     }

//     const remaining = total - received;

//     // ---------- 2. Update invoice ----------
//     const { data: invoiceData, error: invoiceError } = await supabase
//       .from("invoices")
//       .update({
//         received_amount: received,
//         remaining_amount: remaining,
//       })
//       .eq("id", id)
//       .select()
//       .single();

//     if (invoiceError) {
//       return NextResponse.json(
//         { error: invoiceError.message },
//         { status: 400 }
//       );
//     }

//     // ---------- 3. Sync matching costing row (credit = received, balance = remaining) ----------
//     const { error: costingError } = await supabase
//       .from("costing")
//       .update({
//         credit: received,
//         balance: remaining,
//       })
//       .eq("invoice_number", inv.quotation_number);

//     if (costingError) {
//       // Invoice was updated, but costing sync failed — surface the error clearly
//       return NextResponse.json(
//         {
//           error: `Invoice updated but costing sync failed: ${costingError.message}`,
//           invoice: invoiceData,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         invoice: invoiceData,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // DELETE invoice (also removes matching costing row)
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) {
//       return NextResponse.json({ error: "Missing id" }, { status: 400 });
//     }

//     const { data: inv, error: fetchErr } = await supabase
//       .from("invoices")
//       .select("quotation_number")
//       .eq("id", id)
//       .single();

//     if (fetchErr || !inv) {
//       return NextResponse.json(
//         { error: fetchErr?.message || "Invoice not found" },
//         { status: 400 }
//       );
//     }

//     const { error: delInvErr } = await supabase
//       .from("invoices")
//       .delete()
//       .eq("id", id);

//     if (delInvErr) {
//       return NextResponse.json({ error: delInvErr.message }, { status: 400 });
//     }

//     await supabase
//       .from("costing")
//       .delete()
//       .eq("invoice_number", inv.quotation_number);

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ per-service shape (with event)
interface ServiceItem {
  name: string;
  price: number;
  description: string;
  date: string;
  event: string;
}

function normalizeServices(raw: unknown): ServiceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === "object")
    .map((s: any) => ({
      name: typeof s.name === "string" ? s.name : "",
      price: Number(s.price) || 0,
      description: typeof s.description === "string" ? s.description : "",
      date: typeof s.date === "string" ? s.date : "",
      event: typeof s.event === "string" ? s.event : "",
    }));
}

// GET all invoices
export async function GET() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ Ensure every invoice has a normalized services array (with event)
  const normalized = (data || []).map((inv) => ({
    ...inv,
    services: normalizeServices(inv.services),
  }));

  return NextResponse.json(normalized);
}

// POST create invoice + costing entry + booking entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const servicesJsonb = normalizeServices(body.services);

    // ---------- 1. Build invoice payload ----------
    const invoicePayload = {
      quotation_number: body.quotation_number,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone_number: body.client_phone_number,
      service_name: body.service_name,
      service_price: body.service_price,
      service_description: body.service_description,
      service_date: body.service_date,
      sub_total: body.sub_total,
      discount: body.discount,
      total_price: body.total_price,
      received_amount: body.received_amount,
      remaining_amount: body.remaining_amount,
      services: servicesJsonb, // ✅ store per-service array (with event) on invoice
    };

    // ---------- 2. Insert invoice ----------
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert(invoicePayload)
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 400 }
      );
    }

    // ---------- 3. Build costing payload ----------
    const totalPrice = Number(body.total_price) || 0;
    const received = Number(body.received_amount) || 0;
    const balance = Math.max(totalPrice - received, 0);

    const costingPayload = {
      invoice_number: body.quotation_number,
      costing: servicesJsonb, // ✅ same array (with event) goes into costing jsonb
      debit: totalPrice,
      credit: received,
      balance,
    };

    const { data: costingData, error: costingError } = await supabase
      .from("costing")
      .insert(costingPayload)
      .select()
      .single();

    if (costingError) {
      return NextResponse.json(
        {
          error: `Invoice created but costing failed: ${costingError.message}`,
          invoice: invoiceData,
        },
        { status: 400 }
      );
    }

    // ---------- 4. Build booking payload ----------
    // bookings table columns:
    //   invoice_number, client_name, event_date, event_location,
    //   photographer_videographer, timing, outdoor_location_timing, details (jsonb)
    //
    // We take the FIRST service as the primary booking row,
    // and store the full services array in `details` jsonb.
    const primary = servicesJsonb[0] || {
      name: "",
      price: 0,
      description: "",
      date: "",
      event: "",
    };

    const bookingPayload = {
      invoice_number: body.quotation_number,
      client_name: body.client_name,
      event_date: primary.date ? primary.date : null,
      event_location: primary.event || null,
      photographer_videographer: null, // not present in services; fill if you add it
      timing: null, // not present in services; fill if you add it
      outdoor_location_timing: null, // not present in services; fill if you add it
      details: servicesJsonb, // ✅ full services array (with event) as jsonb
    };

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingPayload)
      .select()
      .single();

    if (bookingError) {
      // Invoice + costing already created — surface booking error but do NOT rollback
      return NextResponse.json(
        {
          error: `Invoice and costing created, but booking failed: ${bookingError.message}`,
          invoice: invoiceData,
          costing: costingData,
        },
        { status: 207 } // multi-status
      );
    }

    // ---------- 5. Success ----------
    return NextResponse.json(
      {
        invoice: invoiceData,
        costing: costingData,
        booking: bookingData,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ PUT update payment (received_amount + remaining_amount) on invoice AND costing
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const received = Number(body.received_amount);
    if (isNaN(received) || received < 0) {
      return NextResponse.json(
        { error: "Invalid received_amount" },
        { status: 400 }
      );
    }

    // ---------- 1. Fetch the invoice to get total + quotation_number ----------
    const { data: inv, error: fetchErr } = await supabase
      .from("invoices")
      .select("quotation_number, total_price")
      .eq("id", id)
      .single();

    if (fetchErr || !inv) {
      return NextResponse.json(
        { error: fetchErr?.message || "Invoice not found" },
        { status: 400 }
      );
    }

    const total = Number(inv.total_price) || 0;
    if (received > total) {
      return NextResponse.json(
        { error: "Received amount cannot exceed total price" },
        { status: 400 }
      );
    }

    const remaining = total - received;

    // ---------- 2. Update invoice ----------
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .update({
        received_amount: received,
        remaining_amount: remaining,
      })
      .eq("id", id)
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 400 }
      );
    }

    // ---------- 3. Sync matching costing row (credit = received, balance = remaining) ----------
    const { error: costingError } = await supabase
      .from("costing")
      .update({
        credit: received,
        balance: remaining,
      })
      .eq("invoice_number", inv.quotation_number);

    if (costingError) {
      // Invoice was updated, but costing sync failed — surface the error clearly
      return NextResponse.json(
        {
          error: `Invoice updated but costing sync failed: ${costingError.message}`,
          invoice: invoiceData,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        invoice: invoiceData,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE invoice (also removes matching costing row + booking row)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { data: inv, error: fetchErr } = await supabase
      .from("invoices")
      .select("quotation_number")
      .eq("id", id)
      .single();

    if (fetchErr || !inv) {
      return NextResponse.json(
        { error: fetchErr?.message || "Invoice not found" },
        { status: 400 }
      );
    }

    const { error: delInvErr } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (delInvErr) {
      return NextResponse.json({ error: delInvErr.message }, { status: 400 });
    }

    // ✅ Remove matching costing row (best-effort)
    await supabase
      .from("costing")
      .delete()
      .eq("invoice_number", inv.quotation_number);

    // ✅ Remove matching booking row (best-effort)
    await supabase
      .from("bookings")
      .delete()
      .eq("invoice_number", inv.quotation_number);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}