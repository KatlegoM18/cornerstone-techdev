export default async (req) => {

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Method not allowed."
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const data = await req.json();

    const {
      name,
      email,
      phone,
      business,
      project,
      message
    } = data;

    // Required fields
    if (!name || !email || !project || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please complete all required fields."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please enter a valid email address."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Get Resend API key from Netlify environment variables
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");

      return new Response(
        JSON.stringify({
          success: false,
          message: "Email service is not configured."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Build the email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1814;">
        <h2 style="margin-bottom: 20px;">New CornerStone TechDev Enquiry</h2>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>

        <p><strong>Business:</strong> ${business || "Not provided"}</p>

        <p><strong>Project Type:</strong> ${project}</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">

        <p><strong>Message:</strong></p>

        <p style="white-space: pre-wrap;">${message}</p>

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
        subject: `New Website Enquiry — ${project}`,
        html: emailHtml
      })
    });

    const resendResult = await resendResponse.json();

    // Resend rejected the email
    if (!resendResponse.ok) {
      console.error("Resend error:", resendResult);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Unable to send enquiry email."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    console.log("CORNERSTONE ENQUIRY EMAIL SENT");
    console.log({
      name,
      email,
      project,
      resendId: resendResult.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Enquiry sent successfully."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {

    console.error("Enquiry function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Something went wrong. Please try again."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};