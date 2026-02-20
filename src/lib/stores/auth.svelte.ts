import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

class AuthState {
	user = $state<User | null>(null);
	session = $state<Session | null>(null);
	loading = $state(true);
	profileDisplayName = $state('Anonymous');
	nameChosen = $state(false);

	constructor() {
		this.init();
	}

	private async init() {
		const { data: { session } } = await supabase.auth.getSession();
		this.session = session;
		this.user = session?.user ?? null;
		if (this.user) await this.fetchProfile();
		this.loading = false;

		supabase.auth.onAuthStateChange(async (_event, session) => {
			this.session = session;
			this.user = session?.user ?? null;
			if (this.user) {
				await this.fetchProfile();
			} else {
				this.profileDisplayName = 'Anonymous';
				this.nameChosen = false;
			}
		});
	}

	private async fetchProfile() {
		if (!this.user) return;
		const { data } = await supabase
			.from('profiles')
			.select('display_name, name_chosen')
			.eq('id', this.user.id)
			.single();
		if (data) {
			this.profileDisplayName = data.display_name;
			this.nameChosen = data.name_chosen;
		}
	}

	async checkDisplayName(name: string): Promise<boolean> {
		const { data, error } = await supabase.rpc('is_display_name_available', { name });
		if (error) return false;
		return data as boolean;
	}

	async updateDisplayName(newName: string): Promise<{ error: string | null }> {
		const { error } = await supabase.rpc('update_display_name', { new_name: newName });
		if (error) return { error: error.message };
		this.profileDisplayName = newName;
		this.nameChosen = true;
		return { error: null };
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

	async signOut() {
		return supabase.auth.signOut();
	}
}

export const auth = new AuthState();
