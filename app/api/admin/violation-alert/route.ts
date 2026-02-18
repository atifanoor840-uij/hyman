/**
 * Violation Alert Email API Route
 * Sends email notifications when users are near or hit violations
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Admin notification email
const ADMIN_NOTIFICATION_EMAIL = 'nexthorne@gmail.com'

// SMTP configuration - Hostinger email settings (same as admin email sender)
const getSmtpConfig = () => {
  return {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
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

// Generate HTML email template for violation alerts
const generateViolationAlertEmail = (data: {
  alertType: 'warning' | 'breach'
  userEmail: string
  userName?: string
  orderId: string
  accountType: string
  violations: Array<{
    rule: string
    required: string
    current: string
    severity: string
    description?: string
  }>
  accountStats?: {
    balance?: number
    equity?: number
    profit?: number
    drawdown?: number
  }
}) => {
  const { alertType, userEmail, userName, orderId, accountType, violations, accountStats } = data
  
  const isWarning = alertType === 'warning'
  const headerColor = isWarning ? '#f59e0b' : '#ef4444'
  const headerText = isWarning ? '⚠️ Violation Warning Alert' : '🚨 Account Breach Alert'
  const statusText = isWarning ? 'Near Violation' : 'Violation Detected'
  
  const violationRows = violations.map(v => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">${v.rule}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #059669;">${v.required}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${v.severity === 'error' ? '#dc2626' : '#f59e0b'}; font-weight: 600;">${v.current}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: ${v.severity === 'error' ? '#fef2f2' : '#fffbeb'}; color: ${v.severity === 'error' ? '#dc2626' : '#d97706'};">
          ${v.severity === 'error' ? 'BREACH' : 'WARNING'}
        </span>
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerText}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${isWarning ? '#d97706' : '#b91c1c'} 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${headerText}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Dragon Funded - Trading Platform</p>
    </div>
    
    <!-- Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Alert Banner -->
      <div style="background-color: ${isWarning ? '#fffbeb' : '#fef2f2'}; border: 1px solid ${isWarning ? '#fcd34d' : '#fecaca'}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: ${isWarning ? '#92400e' : '#991b1b'}; font-weight: 600; font-size: 15px;">
          ${isWarning 
            ? 'A user is approaching violation thresholds and may breach trading rules soon.'
            : 'A user has breached one or more critical trading rules. Immediate attention required.'
          }
        </p>
      </div>
      
      <!-- User Info -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">User Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 140px;">Email:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${userEmail}</td>
          </tr>
          ${userName ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Name:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${userName}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Account Type:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${accountType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Status:</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; background-color: ${isWarning ? '#fef3c7' : '#fee2e2'}; color: ${isWarning ? '#92400e' : '#991b1b'};">
                ${statusText}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      ${accountStats ? `
      <!-- Account Stats -->
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">Account Statistics</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 16px;">
          ${accountStats.balance !== undefined ? `
          <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Balance</div>
            <div style="color: #111827; font-size: 18px; font-weight: 700;">$${accountStats.balance.toLocaleString()}</div>
          </div>
          ` : ''}
          ${accountStats.equity !== undefined ? `
          <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Equity</div>
            <div style="color: #111827; font-size: 18px; font-weight: 700;">$${accountStats.equity.toLocaleString()}</div>
          </div>
          ` : ''}
          ${accountStats.profit !== undefined ? `
          <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Profit</div>
            <div style="color: ${accountStats.profit >= 0 ? '#059669' : '#dc2626'}; font-size: 18px; font-weight: 700;">$${accountStats.profit.toLocaleString()}</div>
          </div>
          ` : ''}
          ${accountStats.drawdown !== undefined ? `
          <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Drawdown</div>
            <div style="color: #dc2626; font-size: 18px; font-weight: 700;">${accountStats.drawdown.toFixed(2)}%</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      <!-- Violations Table -->
      <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">
        ${isWarning ? 'Warning Details' : 'Violation Details'}
      </h3>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Rule</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Required</th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Current</th>
              <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${violationRows}
          </tbody>
        </table>
      </div>
      
      <!-- Timestamp -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          Alert generated on ${new Date().toLocaleString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">This is an automated notification from Dragon Funded</p>
      <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} Dragon Funded. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      alertType = 'warning',
      userEmail, 
      userName,
      orderId, 
      accountType,
      violations,
      accountStats
    } = body

    // Validation
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    if (!violations || !Array.isArray(violations) || violations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one violation is required' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = createTransporter()

    // Generate email content
    const emailHtml = generateViolationAlertEmail({
      alertType,
      userEmail,
      userName,
      orderId,
      accountType: accountType || 'Unknown',
      violations,
      accountStats
    })

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'support@dragonfunded.com'
    const fromName = process.env.SMTP_FROM_NAME || 'Dragon Funded'

    const isWarning = alertType === 'warning'
    const subject = isWarning 
      ? `⚠️ Violation Warning: User ${userEmail} - Order ${orderId}`
      : `🚨 Account Breach: User ${userEmail} - Order ${orderId}`

    // Send email to admin
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject,
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message: `Violation alert email sent to ${ADMIN_NOTIFICATION_EMAIL}`,
    })
  } catch (error: any) {
    console.error('Violation alert email error:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send violation alert email',
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
