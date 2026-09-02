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

    // Test mode:
    // The enquiry is received by the Netlify Function,
    // but is not yet sent to email or WhatsApp.
    console.log("NEW CORNERSTONE ENQUIRY");
    console.log({
      name,
      email,
      phone,
      business,
      project,
      message
    });

    return new Response(
      JSON.stringify({
        success: true,
        testMode: true,
        message: "Enquiry received successfully."
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