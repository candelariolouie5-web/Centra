// lib/sms-templates.ts

type TemplateVariables = Record<string, string | number>;

// Define all available templates
export const SMS_TEMPLATES = {
  // Template for booking confirmation (sent immediately after booking)
  BOOKING_CONFIRMATION: {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    description: 'Sent immediately after appointment is booked',
    template: 'Hi {name}, your {service} appointment at Centra Clinic is confirmed for {date} at {time}. Please arrive 10 minutes early.',
    variables: ['name', 'service', 'date', 'time'],
  },
  
  // Template for 24-hour reminder
  REMINDER_24H: {
    id: 'reminder_24h',
    name: '24-Hour Reminder',
    description: 'Sent 24 hours before the appointment',
    template: 'Reminder: Your {service} appointment at Centra Clinic is tomorrow at {time}. Please bring valid ID.',
    variables: ['name', 'service', 'time'],
  },
  
  // Template for 3-hour reminder
  REMINDER_3H: {
    id: 'reminder_3h',
    name: '3-Hour Reminder',
    description: 'Sent 3 hours before the appointment',
    template: 'Reminder: Your {service} appointment at Centra Clinic is in 3 hours at {time}. Please proceed to the reception.',
    variables: ['name', 'service', 'time'],
  },
};

export type TemplateId = keyof typeof SMS_TEMPLATES;

/**
 * Renders a template by replacing variables with actual values
 * @param templateId - The ID of the template to use
 * @param variables - Object containing the values to replace in the template
 * @returns The rendered message string
 */
export function renderTemplate(
  templateId: TemplateId,
  variables: TemplateVariables
): string {
  const template = SMS_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Template "${templateId}" not found`);
  }

  let message = template.template;
  
  // Replace all {variable} placeholders with actual values
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }

  return message;
}

/**
 * Gets a template by ID
 */
export function getTemplate(templateId: TemplateId) {
  return SMS_TEMPLATES[templateId];
}

/**
 * Returns all available templates (for admin settings page)
 */
export function getAllTemplates() {
  // ✅ FIXED: No duplicate 'id' – we explicitly list all fields
  return Object.entries(SMS_TEMPLATES).map(([key, template]) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    template: template.template,
    variables: template.variables,
  }));
}