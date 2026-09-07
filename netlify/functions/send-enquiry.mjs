const MAX_REQUEST_BODY_BYTES = 8 * 1024;

const SERVICE_LABELS = {
  "new-website": "New Website",
  "website-redesign": "Website Redesign",
  ecommerce: "E-Commerce Website",
  "web-application": "Web Application",
  other: "Something Else"
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function readString(data, field, maximumLength, required = false) {
  const value = data[field];

  if (value === undefined || value === null) {
    return required ? null : "";
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (
    normalizedValue.length > maximumLength ||
    (required && !normalizedValue)
  ) {
    return null;
  }

  return normalizedValue;
}

export const config = {
  path: "/.netlify/functions/send-enquiry",
  rateLimit: {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ["ip", "domain"]
  }
};

export default async (req) => {

  // Only allow POST requests
  if (req.method !== "POST") {
    return jsonResponse(405, {
      success: false,
      message: "Method not allowed."
    });
  }

  const contentType = req.headers.get("content-type") || "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return jsonResponse(415, {
      success: false,
      message: "Please complete all required fields."
    });
  }

  const contentLength = Number(req.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
    return jsonResponse(413, {
      success: false,
      message: "Please complete all required fields."
    });
  }

  try {
    const rawBody = await req.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BODY_BYTES) {
      return jsonResponse(413, {
        success: false,
        message: "Please complete all required fields."
      });
    }

    let data;

    try {
      data = JSON.parse(rawBody);
    } catch {
      return jsonResponse(400, {
        success: false,
        message: "Please complete all required fields."
      });
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return jsonResponse(400, {
        success: false,
        message: "Please complete all required fields."
      });
    }

    const honeypot = data.website;

    // Respond as though successful so bots cannot use this check to tune submissions.
    if (
      (typeof honeypot === "string" && honeypot.trim()) ||
      (honeypot !== undefined && honeypot !== null && typeof honeypot !== "string")
    ) {
      return jsonResponse(200, {
        success: true,
        message: "Enquiry sent successfully."
      });
    }

    const name = readString(data, "name", 120, true);
    const email = readString(data, "email", 254, true);
    const phone = readString(data, "phone", 40);
    const business = readString(data, "business", 120);
    const project = readString(data, "project", 40, true);
    const message = readString(data, "message", 4000, true);

    // Required fields and expected string types
    if (
      !name ||
      !email ||
      !project ||
      !message ||
      phone === null ||
      business === null
    ) {
      return jsonResponse(400, {
        success: false,
        message: "Please complete all required fields."
      });
    }

    // Basic email validation
    if (!emailPattern.test(email)) {
      return jsonResponse(400, {
        success: false,
        message: "Please enter a valid email address."
      });
    }

    const projectLabel = SERVICE_LABELS[project];

    if (!projectLabel) {
      return jsonResponse(400, {
        success: false,
        message: "Please complete all required fields."
      });
    }

    // Get Resend API key from Netlify environment variables
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");

      return jsonResponse(500, {
        success: false,
        message: "Email service is not configured."
      });
    }

    // Build the email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1814;">
        <h2 style="margin-bottom: 20px;">New CornerStone TechDev Enquiry</h2>

        <p><strong>Name:</strong> ${escapeHtml(name)}</p>

        <p><strong>Email:</strong> ${escapeHtml(email)}</p>

        <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>

        <p><strong>Business:</strong> ${escapeHtml(business || "Not provided")}</p>

        <p><strong>Project Type:</strong> ${escapeHtml(projectLabel)}</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

        <p><strong>Message:</strong></p>

        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

        <p style="font-size: 13px; color: #777;">
          This enquiry was submitted through the CornerStone TechDev website.
        </p>
      </div>
    `;

    // Send email through Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: "CornerStone TechDev <onboarding@resend.dev>",
        to: ["cornerstonetechdevsa@gmail.com"],
        reply_to: email,
        subject: `New Website Enquiry — ${projectLabel}`,
        html: emailHtml
      })
    });

    const resendResult = await resendResponse.json();

    // Resend rejected the email
    if (!resendResponse.ok) {
      console.error("Resend error:", resendResult);

      return jsonResponse(500, {
        success: false,
        message: "Unable to send enquiry email."
      });
    }

    console.log("CORNERSTONE ENQUIRY EMAIL SENT");
    console.log({
      name,
      email,
      project,
      resendId: resendResult.id
    });

    return jsonResponse(200, {
      success: true,
      message: "Enquiry sent successfully."
    });

  } catch (error) {

    console.error("Enquiry function error:", error);

    return jsonResponse(500, {
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};
