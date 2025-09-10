import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const WEBFLOW_API_TOKEN = Deno.env.get('WEBFLOW_API_TOKEN')!;
const WEBFLOW_COLLECTION_ID = Deno.env.get('WEBFLOW_USERS_COLLECTION_ID')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface OnboardingRequest {
  userId: string;
  onboardingData: {
    name: string;
    email: string;
    role: string;
    firebaseUid: string;
    onboardingCompleted: boolean;
    onboardingDate: string;
    newsletterSubscribed: boolean;
    marketingConsent: boolean;
    // Customer fields
    companyName?: string;
    vatNumber?: string;
    phoneNumber?: string;
    address?: {
      line1: string;
      line2: string;
      city: string;
      postalCode: string;
      country: string;
    };
    preferences?: {
      categories: string[];
    };
    // Retailer fields
    businessName?: string;
    businessType?: string;
    registrationNumber?: string;
    businessPhone?: string;
    businessAddress?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    showroomAddress?: string;
    yearsInBusiness?: string;
    brandsCarried?: string[];
    verified?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request
    const { userId, onboardingData } = await req.json() as OnboardingRequest;
    
    console.log(`Processing onboarding update for user: ${userId}`);
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Verify user exists and get auth info
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser) {
      throw new Error('User not found');
    }

    // First, try to find existing Webflow user by Firebase UID
    const findUserResponse = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?filter[firebase-uid]=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
          'accept': 'application/json',
        },
      }
    );

    if (!findUserResponse.ok) {
      console.error('Failed to search for user in Webflow');
      throw new Error('Failed to search for user in Webflow');
    }

    const searchResult = await findUserResponse.json();
    let webflowUserId = null;

    // Prepare Webflow fields based on role
    const webflowFields: any = {
      name: onboardingData.name,
      email: onboardingData.email,
      'firebase-uid': onboardingData.firebaseUid,
      role: onboardingData.role,
      'onboarding-completed': onboardingData.onboardingCompleted,
      'onboarding-date': onboardingData.onboardingDate,
      'newsletter-subscribed': onboardingData.newsletterSubscribed,
      'marketing-consent': onboardingData.marketingConsent,
    };

    // Add role-specific fields
    if (onboardingData.role === 'customer') {
      Object.assign(webflowFields, {
        'company-name': onboardingData.companyName || '',
        'vat-number': onboardingData.vatNumber || '',
        'phone-number': onboardingData.phoneNumber || '',
        'address-line-1': onboardingData.address?.line1 || '',
        'address-line-2': onboardingData.address?.line2 || '',
        'address-city': onboardingData.address?.city || '',
        'address-postal-code': onboardingData.address?.postalCode || '',
        'address-country': onboardingData.address?.country || '',
        'preferred-categories': onboardingData.preferences?.categories?.join(', ') || '',
      });
    } else if (onboardingData.role === 'retailer') {
      Object.assign(webflowFields, {
        'business-name': onboardingData.businessName || '',
        'business-type': onboardingData.businessType || '',
        'registration-number': onboardingData.registrationNumber || '',
        'business-phone': onboardingData.businessPhone || '',
        'business-address-street': onboardingData.businessAddress?.street || '',
        'business-address-city': onboardingData.businessAddress?.city || '',
        'business-address-postal': onboardingData.businessAddress?.postalCode || '',
        'business-address-country': onboardingData.businessAddress?.country || '',
        'showroom-address': onboardingData.showroomAddress || '',
        'years-in-business': onboardingData.yearsInBusiness || '',
        'brands-carried': onboardingData.brandsCarried?.join(', ') || '',
        'verified': onboardingData.verified || false,
      });
    }

    let webflowResponse;

    if (searchResult.items && searchResult.items.length > 0) {
      // User exists, update their record
      webflowUserId = searchResult.items[0].id;
      console.log(`Updating existing Webflow user: ${webflowUserId}`);

      webflowResponse = await fetch(
        `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items/${webflowUserId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            fieldData: webflowFields,
          }),
        }
      );
    } else {
      // Create new user
      console.log('Creating new Webflow user with onboarding data');

      webflowResponse = await fetch(
        `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            fieldData: webflowFields,
          }),
        }
      );
    }

    if (!webflowResponse.ok) {
      const errorText = await webflowResponse.text();
      console.error('Webflow API error:', errorText);
      throw new Error(`Webflow API error: ${errorText}`);
    }

    const webflowData = await webflowResponse.json();

    // Update user metadata in Supabase to mark onboarding complete
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...authUser.user?.user_metadata,
          onboarding_completed: true,
          onboarding_date: onboardingData.onboardingDate,
          webflow_user_id: webflowData.id || webflowUserId,
        },
      }
    );

    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
    }

    // Publish the changes to Webflow (if needed)
    if (webflowData.id || webflowUserId) {
      const publishResponse = await fetch(
        `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            itemIds: [webflowData.id || webflowUserId],
          }),
        }
      );

      if (!publishResponse.ok) {
        console.warn('Failed to publish Webflow changes, but data was saved');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        webflowUserId: webflowData.id || webflowUserId,
        message: 'Onboarding data synced with Webflow CMS',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in update-webflow-user-onboarding:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});