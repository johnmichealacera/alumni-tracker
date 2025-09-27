import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    })
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Alumni Tracker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Alumni Tracker!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering with our Alumni Tracker system. Your profile is currently under review.</p>
        <p>You will receive another email once your profile has been approved by our administrators.</p>
        <p>Best regards,<br>The Alumni Tracker Team</p>
      </div>
    `,
    text: `Welcome to Alumni Tracker! Hi ${name}, Thank you for registering. Your profile is under review.`
  }),

  profileApproved: (name: string) => ({
    subject: 'Your Alumni Profile Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">Profile Approved!</h1>
        <p>Hi ${name},</p>
        <p>Great news! Your alumni profile has been approved and is now live on our platform.</p>
        <p>You can now update your employment information and connect with other alumni.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/profile" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Profile</a></p>
        <p>Best regards,<br>The Alumni Tracker Team</p>
      </div>
    `,
    text: `Profile Approved! Hi ${name}, Your alumni profile has been approved and is now live.`
  }),

  employmentReminder: (name: string) => ({
    subject: 'Update Your Employment Information',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Employment Update Reminder</h1>
        <p>Hi ${name},</p>
        <p>We hope you're doing well! It's been a while since you last updated your employment information.</p>
        <p>Keeping your profile current helps us maintain accurate alumni statistics and can help you connect with other professionals in your field.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/profile/employment" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Employment</a></p>
        <p>Best regards,<br>The Alumni Tracker Team</p>
      </div>
    `,
    text: `Employment Update Reminder. Hi ${name}, Please update your employment information.`
  })
}
