import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📊 API: Fetching submissions for form ${id}`);

    // Fetch all submissions for this form, ordered by most recent first
    const { data: submissions, error } = await supabase
      .from("simple_form_submissions")
      .select("*")
      .eq("form_id", id)
      .order("submitted_at", { ascending: false });
    
    console.log(`📊 API: Query result - Found ${submissions?.length || 0} submissions`);

    if (error) {
      console.error("❌ Supabase error fetching submissions:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to fetch submissions", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ API: Returning ${submissions?.length || 0} submissions`);
    return NextResponse.json({ submissions: submissions || [] });
  } catch (error: any) {
    console.error("❌ Error in GET /api/forms/[id]/submissions:", error);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}
