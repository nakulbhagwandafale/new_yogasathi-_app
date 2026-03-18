import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planName, amountINR } = await req.json()

    // 1. Validate request
    if (!planName || !amountINR) {
      return new Response(JSON.stringify({ error: "Missing planName or amountINR" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. Init Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Get User ID from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 4. Razorpay Credentials from environment
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured in Edge Function")
    }

    // 5. Generate Payment Link
    // Amount must be in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amountINR * 100)
    
    // We pass the user ID in the notes so the webhook knows who paid
    const payload = {
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `YogaSathi Premium: ${planName}`,
      customer: {
        name: user.user_metadata?.full_name || "YogaSathi User",
        email: user.email || ""
      },
      notify: {
        sms: false,
        email: true
      },
      reminder_enable: false,
      notes: {
        user_id: user.id,
        plan_name: planName,
        source: "yogasathi_app"
      }
    }

    // Call Razorpay API
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Razorpay Error:", data)
      throw new Error(data.error?.description || "Failed to create payment link")
    }

    // 6. Return the payment link details to the app
    return new Response(JSON.stringify({ 
      id: data.id,
      short_url: data.short_url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
