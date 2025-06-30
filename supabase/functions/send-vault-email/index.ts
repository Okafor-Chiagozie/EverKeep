import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 Email service called')
    
    const { to, subject, html } = await req.json()
    
    console.log(`📤 Sending email to: ${to}`)
    console.log(`📋 Subject: ${subject}`)
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'EverKeep <noreply@yourdomain.com>', // Replace with your domain
      to: [to],
      subject: subject,
      html: html
    })

    if (error) {
      console.error('❌ Resend error:', error)
      throw new Error(`Resend error: ${JSON.stringify(error)}`)
    }

    console.log('✅ Email sent successfully:', data)

    return new Response(JSON.stringify({ 
      success: true, 
      data: data,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
    
  } catch (error) {
    console.error('❌ Email service error:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500
    })
  }
})