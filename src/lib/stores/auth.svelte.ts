import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

class AuthState {
	user = $state<User | null>(null);
	session = $state<Session | null>(null);
	loading = $state(true);
	displayName = $derived(
		this.user?.user_metadata?.display_name ??
		this.user?.user_metadata?.full_name ??
		this.user?.email?.split('@')[0] ??
		'Anonymous'
	);

	constructor() {
		this.init();
	}

	private async init() {
		const { data: { session } } = await supabase.auth.getSession();
		this.session = session;
		this.user = session?.user ?? null;
		this.loading = false;

		supabase.auth.onAuthStateChange((_event, session) => {
			this.session = session;
			this.user = session?.user ?? null;
		});
	}

	async signInWithMagicLink(email: string) {
		return supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: window.location.origin }
		});
	}

	async signInWithEmail(email: string, password: string) {
		return supabase.auth.signInWithPassword({ email, password });
	}

	async signUpWithEmail(email: string, password: string, displayName: string) {
		return supabase.auth.signUp({
			email,
			password,
			options: { data: { display_name: displayName } }
		});
	}

	async signInWithOAuth(provider: 'github' | 'google') {
		return supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: window.location.origin }
		});
	}

	async signOut() {
		return supabase.auth.signOut();
	}
}

export const auth = new AuthState();
