import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Use the global Web Crypto API (available in Deno/Supabase Edge Runtime)
const cryptoSubtle = globalThis.crypto.subtle;

// Minimal hex encode implementation for Deno since standard libraries vary
const toHexString = (bytes: Uint8Array) =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

serve(async (req) => {
  try {
    // Webhooks don't need CORS, they are called server-to-server
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 1. Get raw body for standard signature verification
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
       return new Response('Missing signature', { status: 400 })
    }

    // 2. Get the secret configured for the Webhook
    // (This is usually different from the API Secret, but you can set them the same in Razorpay dashboard)
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    if (!webhookSecret) {
        throw new Error("Webhook secret not configured")
    }

    // 3. Verify Signature using Web Crypto API (HMAC SHA256)
    const encoder = new TextEncoder();
    const key = await cryptoSubtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    
    const signatureBuffer = await cryptoSubtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody)
    );
    
    const generatedSignature = toHexString(new Uint8Array(signatureBuffer));

    if (generatedSignature !== signature) {
      console.error("Invalid signature detected")
      return new Response('Invalid signature', { status: 400 })
    }

    // 4. Parse the payload
    const payload = JSON.parse(rawBody)
    
    // DEBUG: Log the payload structure to understand what Razorpay sends
    console.log("Webhook event received:", payload.event)
    console.log("Payload keys:", JSON.stringify(Object.keys(payload.payload || {})))
    
    // We only care about successful payment link completions
    if (payload.event === 'payment_link.paid') {
      // Safely extract payment_link entity with multiple fallback paths
      const payloadData = payload.payload || {}
      const paymentLinkWrapper = payloadData.payment_link || payloadData.payment || {}
      const paymentLink = paymentLinkWrapper.entity || paymentLinkWrapper || {}
      
      console.log("Payment link data:", JSON.stringify({
        id: paymentLink.id,
        amount: paymentLink.amount,
        notes: paymentLink.notes,
        hasKeys: Object.keys(paymentLink).slice(0, 10)
      }))
      
      // Ensure this came from our YogaSathi app
      const notes = paymentLink.notes || {}
      if (notes.source !== 'yogasathi_app') {
          console.log("Payment source:", notes.source, "- Not yogasathi_app. Ignoring.")
          return new Response('Ignored - not YogaSathi app', { status: 200 })
      }

      const userId = notes.user_id
      const planName = notes.plan_name

      if (!userId || !planName) {
         console.error("Missing user_id or plan_name in payment notes:", JSON.stringify(notes))
         return new Response('Missing metadata', { status: 400 })
      }

      // 5. Calculate expiry date based on plan
      const now = new Date()
      let expiresAt: Date
      if (planName.toLowerCase() === 'yearly') {
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 365 days
      } else {
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days (default for monthly)
      }

      // 6. Update Database via Supabase Admin Client (bypasses RLS)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // First, see if an existing subscription row exists for this user
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingSub) {
          // Update existing
          await supabaseAdmin
            .from('subscriptions')
            .update({
                plan: planName,
                is_active: true,
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString()
            })
            .eq('id', existingSub.id)
      } else {
          // Insert new
          await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan: planName,
                is_active: true,
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString()
            })
      }
      
      // 7. Save payment record in the payments table
      try {
        const payment = payload.payload.payment?.entity
        const paymentAmount = paymentLink.amount ? paymentLink.amount / 100 : (payment?.amount ? payment.amount / 100 : 0)
        const paymentId = payment?.id || paymentLink.id || 'unknown'
        
        console.log("Saving payment record:", { userId, paymentId, planName, paymentAmount })
        
        const { error: paymentError } = await supabaseAdmin
          .from('payments')
          .insert({
              user_id: userId,
              razorpay_payment_id: paymentId,
              razorpay_payment_link_id: paymentLink.id,
              plan: planName,
              amount: paymentAmount,
              currency: paymentLink.currency || 'INR',
              status: 'paid',
              paid_at: now.toISOString(),
          })
        
        if (paymentError) {
          console.error("Failed to save payment record:", paymentError)
        } else {
          console.log("Payment record saved successfully")
        }
      } catch (payErr) {
        console.error("Payment record insert crashed:", payErr)
      }
      
      console.log(`Successfully activated ${planName} for user ${userId}, expires at ${expiresAt.toISOString()}`)
    }

    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error("Webhook Error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
