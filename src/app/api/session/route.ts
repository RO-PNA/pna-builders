import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "../../../utils/supabase/admin";

export async function POST(request: NextRequest) {
    try {
        const { teamName, domain } = await request.json();

        if (!teamName || !domain) {
            return Response.json(
                { error: "teamName and domain are required" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdmin();

        const { data, error } = await supabase
            .from("workshop_sessions")
            .insert({
                team_name: teamName,
                domain_key: domain,
                current_stage: "P1",
                status: "active",
            })
            .select()
            .single();

        if (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({
            sessionId: data.id,
            currentStage: data.current_stage,
        });
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Internal server error";
        return Response.json({ error: message }, { status: 500 });
    }
}