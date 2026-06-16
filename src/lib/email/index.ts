import { createAdminClient } from '@/lib/supabase/admin';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Ayurveda App <noreply@ayurveda.app>';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: payload.to, subject: payload.subject, html: payload.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyPractitionerNewSubmission(assessmentId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: assessment } = await admin.from('assessments').select('*, profiles!assessments_practitioner_id_fkey(email, full_name)').eq('id', assessmentId).single();
  if (!assessment?.practitioner_id || !assessment.profiles?.email) return false;

  return sendEmail({
    to: assessment.profiles.email,
    subject: 'New Assessment Submitted — Ready for Review',
    html: `<p>Hi ${assessment.profiles.full_name || 'Practitioner'},</p>
<p>A new Ayurveda assessment has been submitted and is ready for your review.</p>
<p><strong>Client:</strong> ${assessment.full_name || 'Unnamed'}<br/>
<strong>Status:</strong> Submitted — pending review</p>
<a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${assessmentId}" style="display:inline-block;padding:12px 24px;background:#d97706;color:#fff;text-decoration:none;border-radius:6px;">Review Assessment</a>
<p>This is an automated notification from your Ayurveda Assessment platform.</p>`,
  });
}

export async function notifyPractitionerReportReady(assessmentId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: assessment } = await admin.from('assessments').select('*, profiles!assessments_practitioner_id_fkey(email, full_name)').eq('id', assessmentId).single();
  if (!assessment?.practitioner_id || !assessment.profiles?.email) return false;

  return sendEmail({
    to: assessment.profiles.email,
    subject: 'Practitioner Report Generated',
    html: `<p>Hi ${assessment.profiles.full_name || 'Practitioner'},</p>
<p>The practitioner report for <strong>${assessment.full_name || 'Unnamed'}</strong> has been generated.</p>
<a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/${assessmentId}/practitioner-report" style="display:inline-block;padding:12px 24px;background:#d97706;color:#fff;text-decoration:none;border-radius:6px;">View Report</a>
<p>You can review and then release the client report when ready.</p>`,
  });
}

export async function notifyClientReportReleased(clientEmail: string, clientName: string, reportUrl: string): Promise<boolean> {
  return sendEmail({
    to: clientEmail,
    subject: 'Your Wellness Report is Ready',
    html: `<p>Hi ${clientName},</p>
<p>Your personalised Ayurveda wellness report is now ready!</p>
<p>Your practitioner has reviewed your assessment and released your report.</p>
<a href="${reportUrl}" style="display:inline-block;padding:12px 24px;background:#d97706;color:#fff;text-decoration:none;border-radius:6px;">View My Report</a>
<p>This report is for educational purposes only and does not constitute medical advice.</p>`,
  });
}
