import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone") || "09206791423";
    const message = searchParams.get("message") || "Test SMS from Centra Clinic - If you receive this, the integration works! 🎉";

    console.log("🧪 Testing SMS to:", phone);

    const token = process.env.IPROG_API_TOKEN;
    console.log("🔑 Token present:", !!token);

    if (!token) {
      return NextResponse.json({ 
        error: "IPROG_API_TOKEN not set",
        tokenPresent: false 
      }, { status: 500 });
    }

    // Clean phone number
    let cleanedNumber = phone.replace(/[+\s]/g, '');
    if (cleanedNumber.startsWith('0')) {
      cleanedNumber = '63' + cleanedNumber.substring(1);
    }

    const response = await fetch(
      "https://www.iprogsms.com/api/v1/sms_messages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_token: token,
          phone_number: cleanedNumber,
          message: message,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: data,
      phoneSent: cleanedNumber,
      tokenPresent: true,
      tokenLength: token.length,
    });
  } catch (error: any) {
    console.error("❌ Test SMS error:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}