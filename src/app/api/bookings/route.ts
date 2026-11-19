import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// GET all bookings
export async function GET() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data || []).map((b) => ({
    ...b,
    details: normalizeServices(b.details),
  }));

  return NextResponse.json(normalized);
}

// ✅ PUT update booking
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const payload = {
      client_name: body.client_name,
      event_date: body.event_date || null,
      event_location: body.event_location || null,
      photographer_videographer: body.photographer_videographer || null,
      timing: body.timing || null,
      outdoor_location_timing: body.outdoor_location_timing || null,
      details: normalizeServices(body.details),
    };

    const { data, error } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        booking: { ...data, details: normalizeServices(data.details) },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a booking
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}