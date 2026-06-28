import { NextRequest, NextResponse } from "next/server";
import { renderTemplate, TemplateId } from "@/lib/sms-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📨 SMS send request received:", body);
    
    const { phone_number, message, templateId, variables } = body;

    if (!phone_number) {
      console.log("❌ Missing phone_number");
      return NextResponse.json(
        { error: "Missing phone_number" },
        { status: 400 }
      );
    }

    let finalMessage = message;
    
    if (templateId) {
      try {
        finalMessage = renderTemplate(templateId as TemplateId, variables || {});
        console.log(`✅ Template rendered: ${templateId} → ${finalMessage}`);
      } catch (error: any) {
        console.log("❌ Template error:", error.message);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    if (!finalMessage) {
      console.log("❌ Missing message or templateId");
      return NextResponse.json(
        { error: "Missing message or templateId" },
        { status: 400 }
      );
    }

    const token = process.env.IPROG_API_TOKEN;
    console.log(`🔑 Token present: ${token ? '✅ Yes' : '❌ No'}`);
    console.log(`🔑 Token length: ${token?.length || 0}`);
    
    if (!token) {
      console.error("❌ IPROG_API_TOKEN is not set");
      return NextResponse.json(
        { error: "SMS service is not configured" },
        { status: 500 }
      );
    }

    // Clean phone number: remove '+', spaces, and leading '0'
    let cleanedNumber = phone_number.replace(/[+\s]/g, '');
    console.log(`📱 Original: ${phone_number}, Cleaned: ${cleanedNumber}`);
    
    if (cleanedNumber.startsWith('0')) {
      cleanedNumber = '63' + cleanedNumber.substring(1);
      console.log(`📱 Converted to PH format: ${cleanedNumber}`);
    }

    console.log(`📤 Sending SMS to ${cleanedNumber}: "${finalMessage}"`);
    
    const response = await fetch(
      "https://www.iprogsms.com/api/v1/sms_messages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_token: token,
          phone_number: cleanedNumber,
          message: finalMessage,
        }),
      }
    );

    const data = await response.json();
    console.log(`📥 IPROG Response:`, data);

    if (!response.ok) {
      console.error("❌ IPROG SMS API error:", data);
      return NextResponse.json(
        { error: data.error || "Failed to send SMS" },
        { status: response.status }
      );
    }

    console.log("✅ SMS sent successfully!");
    return NextResponse.json({ 
      success: true, 
      data,
      templateUsed: templateId || null,
      messageSent: finalMessage,
    });
  } catch (error: any) {
    console.error("❌ SMS API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a GET handler to test the endpoint
export async function GET() {
  return NextResponse.json({
    status: "SMS API is running",
    message: "Use POST to send SMS messages"
  });
}