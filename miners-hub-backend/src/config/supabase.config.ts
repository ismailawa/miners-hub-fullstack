import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Provides direct access to Supabase services (if needed)
 */
export const createSupabaseClient = (
  configService: ConfigService,
): SupabaseClient => {
  const supabaseUrl = configService.get<string>('SUPABASE_URL');
  const supabaseServiceKey = configService.get<string>('SUPABASE_SERVICE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, no session persistence needed
    },
  });
};

/**
 * Supabase client factory function
 * Can be used in services to get Supabase client instance
 */
export const getSupabaseClient = (
  configService: ConfigService,
): SupabaseClient => {
  return createSupabaseClient(configService);
};
