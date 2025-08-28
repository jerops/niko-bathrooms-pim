/**
 * Supabase Edge Function: Create Webflow User
 * 
 * This Edge Function creates a CMS record in Webflow when users register
 * Based on our previous discussions about CMS integration
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, role } = await req.json();
    
    if (!user || !role) {
      throw new Error('Missing required user data or role');
    }

    // Create user record in Webflow CMS
    const webflowResponse = await fetch(`https://api.webflow.com/v2/collections/${Deno.env.get('WEBFLOW_USERS_COLLECTION_ID')}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WEBFLOW_API_TOKEN')}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        isArchived: false,
        isDraft: false,
        fieldData: {
          name: user.user_metadata?.name || user.email,
          slug: user.id,
          'firebase-uid': user.id, // Key field for linking
          email: user.email,
          role: role,
          'created-date': new Date().toISOString(),
          'email-confirmed': user.email_confirmed_at ? true : false
        }
      })
    });

    if (!webflowResponse.ok) {
      const errorData = await webflowResponse.text();
      throw new Error(`Webflow API error: ${webflowResponse.status} - ${errorData}`);
    }

    const webflowUser = await webflowResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        webflowUser,
        message: 'User created successfully in Webflow CMS'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error creating Webflow user:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    );
  }
});