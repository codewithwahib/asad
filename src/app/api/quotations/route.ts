// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// // GET all quotations
// export async function GET() {
//   const { data, error } = await supabase
//     .from("quotations")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
//   return NextResponse.json(data);
// }

// // POST create
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const payload = {
//       quotation_number: body.quotation_number,
//       client_name: body.client_name,
//       client_email: body.client_email,
//       client_phone_number: body.client_phone_number,
//       services: body.services, // ✅ jsonb array
//       sub_total: body.sub_total,
//       discount: body.discount,
//       total_price: body.total_price,
//     };

//     const { data, error } = await supabase
//       .from("quotations")
//       .insert(payload)
//       .select()
//       .single();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }
//     return NextResponse.json(data, { status: 201 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // PATCH update
// export async function PATCH(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) {
//       return NextResponse.json({ error: "Missing id" }, { status: 400 });
//     }

//     const body = await req.json();

//     const payload = {
//       quotation_number: body.quotation_number,
//       client_name: body.client_name,
//       client_email: body.client_email,
//       client_phone_number: body.client_phone_number,
//       services: body.services,
//       sub_total: body.sub_total,
//       discount: body.discount,
//       total_price: body.total_price,
//     };

//     const { data, error } = await supabase
//       .from("quotations")
//       .update(payload)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }
//     return NextResponse.json(data);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // DELETE
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) {
//       return NextResponse.json({ error: "Missing id" }, { status: 400 });
//     }

//     const { error } = await supabase.from("quotations").delete().eq("id", id);
//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }
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

// ✅ Per-service shape (event is inside each item now)
interface ServiceItem {
  name: string;
  price: number;
  description: string;
  date: string;
  event: string;
}

// Normalize services array so old rows / malformed data don't break the UI
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

// GET all quotations
export async function GET() {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ Ensure every service object has an `event` key (even for old rows)
  const normalized = (data || []).map((q) => ({
    ...q,
    services: normalizeServices(q.services),
  }));

  return NextResponse.json(normalized);
}

// POST create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      quotation_number: body.quotation_number,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone_number: body.client_phone_number,
      services: normalizeServices(body.services), // ✅ event per service
      sub_total: body.sub_total,
      discount: body.discount,
      total_price: body.total_price,
    };

    const { data, error } = await supabase
      .from("quotations")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH update
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json();

    const payload = {
      quotation_number: body.quotation_number,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone_number: body.client_phone_number,
      services: normalizeServices(body.services), // ✅ event per service
      sub_total: body.sub_total,
      discount: body.discount,
      total_price: body.total_price,
    };

    const { data, error } = await supabase
      .from("quotations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}