import { ApiResponse } from './recipeService';

export interface SubscriptionStatus {
  tier: 'FREE' | 'PREMIUM';
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface UsageStats {
  recipe_count: number;
  recipe_limit: number;
  parsing_count: number;
  parsing_limit: number;
  period_start: string;
  period_end: string;
}

export interface CheckoutSessionResponse {
  url: string;
  session_id: string;
}

export interface BillingPortalResponse {
  url: string;
}

class SubscriptionService {
  private baseUrl = `${import.meta.env.VITE_API_URL}/api/subscriptions`;

  private async makeRequest(endpoint: string, token: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getSubscriptionStatus(token: string): Promise<ApiResponse<SubscriptionStatus>> {
    try {
      const response = await this.makeRequest('/status', token);
      const data = await response.json();
      
      return {
        success: true,
        data: data as SubscriptionStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscription status'
      };
    }
  }

  async getUsageStats(token: string): Promise<ApiResponse<UsageStats>> {
    try {
      const response = await this.makeRequest('/usage', token);
      const data = await response.json();
      
      return {
        success: true,
        data: data as UsageStats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch usage statistics'
      };
    }
  }

  async createCheckoutSession(token: string, successUrl?: string, cancelUrl?: string): Promise<ApiResponse<CheckoutSessionResponse>> {
    try {
      const body: Record<string, string> = {};
      if (successUrl) body.success_url = successUrl;
      if (cancelUrl) body.cancel_url = cancelUrl;

      const response = await this.makeRequest('/create-checkout-session', token, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as CheckoutSessionResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session'
      };
    }
  }

  async createBillingPortalSession(token: string, returnUrl?: string): Promise<ApiResponse<BillingPortalResponse>> {
    try {
      const body: Record<string, string> = {};
      if (returnUrl) body.return_url = returnUrl;

      const response = await this.makeRequest('/create-portal-session', token, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data as BillingPortalResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create billing portal session'
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;