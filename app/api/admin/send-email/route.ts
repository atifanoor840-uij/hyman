/**
 * Admin Email Sender API Route
 * Sends emails to selected users using nodemailer and SMTP
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// SMTP configuration - Hostinger email settings
const getSmtpConfig = () => {
  // Use Hostinger SMTP settings
  return {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false', // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.SMTP_USER || 'support@dragonfunded.com',
      pass: process.env.SMTP_PASSWORD || 'DragonFunded@123',
    },
  }
}

// Create reusable transporter
const createTransporter = () => {
  const config = getSmtpConfig()
  
  if (!config.auth.user || !config.auth.pass) {
    throw new Error('SMTP credentials not configured')
  }

  return nodemailer.createTransport(config)
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, content, emails, isHtml = true, sendToAll = false } = body

    // Validation
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email subject is required' },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email content is required' },
        { status: 400 }
      )
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one recipient email is required' },
        { status: 400 }
      )
    }

    // For manual selection, limit to 200. For "send to all", no limit
    if (!sendToAll && emails.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Maximum 200 recipients allowed for manual selection' },
        { status: 400 }
      )
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validEmails = emails.filter((email: string) => emailRegex.test(email))
    
    if (validEmails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid email addresses found' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = createTransporter()

    // Send emails
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'support@dragonfunded.com'
    const fromName = process.env.SMTP_FROM_NAME || 'Dragon Funded'

    const results = {
      total: validEmails.length,
      sent: 0,
      failed: 0,
      sentEmails: [] as string[],
      errors: [] as string[],
    }

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10
    for (let i = 0; i < validEmails.length; i += batchSize) {
      const batch = validEmails.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(async (email: string) => {
          try {
            await transporter.sendMail({
              from: `"${fromName}" <${fromEmail}>`,
              to: email,
              subject: subject.trim(),
              ...(isHtml ? { html: content } : { text: content }),
            })
            results.sent++
            results.sentEmails.push(email)
          } catch (error: any) {
            results.failed++
            results.errors.push(`${email}: ${error.message || 'Unknown error'}`)
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < validEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent: ${results.sent}/${results.total}`,
      results,
    })
  } catch (error: any) {
    console.error('Email sending error:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send emails',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
