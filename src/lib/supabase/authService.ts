import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: any;
  session: any;
  error: any;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  }

  async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    console.log('data', data);

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  }

  async signOut(): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentSession(): Promise<any> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async getCurrentUser(): Promise<any> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getUserProfile(): Promise<any> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(updates: { full_name?: string }): Promise<any> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getUserMetadata(): Promise<Record<string, any> | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user?.user_metadata || null;
  }

  async isUserVerified(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.isVerified || false;
  }

  async resendVerificationEmail(email: string): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { error };
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }

  async verifyEmail(token: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    return { error };
  }

  async isEmailVerified(): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user?.email_confirmed_at !== null;
  }
}
