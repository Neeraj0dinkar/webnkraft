import { corsHeaders } from "npm:@supabase/supabase-js@^2/cors";

const ADMIN_EMAIL = "neeraj0dinkar@gmail.com";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const { enquiry } = await req.json();

    if (!enquiry) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing enquiry payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = escapeHtml(enquiry.name || "Not provided");
    const email = escapeHtml(enquiry.email || "Not provided");
    const phone = escapeHtml(enquiry.phone || "Not provided");
    const businessName = escapeHtml(enquiry.business_name || "Not provided");
    const projectType = escapeHtml(enquiry.project_type || "Not selected");
    const features = escapeHtml(
      Array.isArray(enquiry.features)
        ? enquiry.features.join(", ")
        : enquiry.features || "Not selected"
    );
    const video = escapeHtml(enquiry.video_requirement || "Not selected");
    const budget = escapeHtml(enquiry.budget || "Not selected");
    const launch = escapeHtml(enquiry.launch_timeline || "Not selected");
    const description = escapeHtml(enquiry.description || "Not provided");
    const notes = escapeHtml(enquiry.notes || "Not provided");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "webnKraft <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `New webnKraft Enquiry - ${enquiry.business_name || enquiry.name || "New lead"}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#172033;max-width:720px;margin:auto">
            <h2 style="margin-bottom:4px">New webnKraft Project Enquiry</h2>
            <p style="color:#667085;margin-top:0">A new enquiry was submitted through the webnKraft Project Builder.</p>

            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Phone:</strong> ${phone}<br>
            <strong>Business:</strong> ${businessName}</p>

            <h3>Project Details</h3>
            <p><strong>Project:</strong> ${projectType}<br>
            <strong>Features:</strong> ${features}<br>
            <strong>AI Video / Visual Content:</strong> ${video}<br>
            <strong>Budget:</strong> ${budget}<br>
            <strong>Launch:</strong> ${launch}</p>

            <h3>Business Description</h3>
            <p>${description}</p>

            <h3>Additional Notes</h3>
            <p>${notes}</p>
          </div>
        `
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return new Response(
        JSON.stringify({ success: false, error: result?.message || "Unable to send email" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Enquiry notification email sent successfully",
        emailId: result?.id || null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-new-enquiry error:", error);

    return new Response(
      JSON.stringify({ success: false, error: "Unable to send enquiry notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
