import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.168.0/crypto/mod.ts"

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
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
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
    
    // We only care about successful payment link completions
    if (payload.event === 'payment_link.paid') {
      const paymentLink = payload.payload.payment_link.entity
      
      // Ensure this came from our YogaSathi app
      if (paymentLink.notes?.source !== 'yogasathi_app') {
          console.log("Payment is from a different project. Ignoring.")
          return new Response('Ignored - not YogaSathi app', { status: 200 })
      }

      const userId = paymentLink.notes?.user_id
      const planName = paymentLink.notes?.plan_name

      if (!userId || !planName) {
         console.error("Missing user_id or plan_name in payment notes")
         return new Response('Missing metadata', { status: 400 })
      }

      // 5. Update Database via Supabase Admin Client (bypasses RLS)
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
                started_at: new Date().toISOString(),
                expires_at: null // Full access
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
                started_at: new Date().toISOString(),
                expires_at: null
            })
      }
      
      console.log(`Successfully activated ${planName} for user ${userId}`)
    }

    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error("Webhook Error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
