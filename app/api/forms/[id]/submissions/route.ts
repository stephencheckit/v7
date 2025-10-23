import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch all submissions for this form, ordered by most recent first
    const { data: submissions, error } = await supabase
      .from("simple_form_submissions")
      .select("*")
      .eq("form_id", id)
      .order("submitted_at", { ascending: false });
    
    console.log(`Fetching submissions for form ${id}:`, submissions?.length || 0, 'found');

    if (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions: submissions || [] });
  } catch (error) {
    console.error("Error in GET /api/forms/[id]/submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
