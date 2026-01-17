
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/agents" | "/approvals" | "/events" | "/popup" | "/settings" | "/tasks";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/agents": Record<string, never>;
			"/approvals": Record<string, never>;
			"/events": Record<string, never>;
			"/popup": Record<string, never>;
			"/settings": Record<string, never>;
			"/tasks": Record<string, never>
		};
		Pathname(): "/" | "/agents" | "/agents/" | "/approvals" | "/approvals/" | "/events" | "/events/" | "/popup" | "/popup/" | "/settings" | "/settings/" | "/tasks" | "/tasks/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}