import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all invoices
export async function GET() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST create invoice + costing entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
    // debit  = total amount owed by client (total_price)
    // credit = amount received from client (received_amount)
    // balance = remaining (total_price - received_amount)
    const totalPrice = Number(body.total_price) || 0;
    const received = Number(body.received_amount) || 0;
    const balance = Math.max(totalPrice - received, 0);

    const costingPayload = {
      invoice_number: body.quotation_number,
      costing: body.services || [], // ✅ jsonb array of {name, price, description, date}
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
      // Invoice was created, but costing failed — surface the error clearly
      return NextResponse.json(
        {
          error: `Invoice created but costing failed: ${costingError.message}`,
          invoice: invoiceData,
        },
        { status: 400 }
      );
    }

    // ---------- 4. Success ----------
    return NextResponse.json(
      {
        invoice: invoiceData,
        costing: costingData,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE invoice (also removes matching costing row)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Get the invoice first so we know its quotation_number
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

    // Delete invoice
    const { error: delInvErr } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (delInvErr) {
      return NextResponse.json({ error: delInvErr.message }, { status: 400 });
    }

    // Delete matching costing row (best-effort)
    await supabase
      .from("costing")
      .delete()
      .eq("invoice_number", inv.quotation_number);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}