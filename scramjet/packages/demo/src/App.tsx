import { css, createState, type Component } from "dreamland/core";
const { Plugin: ScramjetPlugin, ScramjetHeaders } = window.$scramjet;
import type { Plugin } from "@mercuryworkshop/scramjet";
import type { Frame } from "@mercuryworkshop/scramjet-controller";
import { cachePlugin, controller } from ".";
import { demoSettingsStore } from "./store";

export const browserState = createState({
	url: demoSettingsStore.homeUrl,
	frame: null! as Frame,
	isBrowsing: false,
});

const SEARCH_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const BACK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
const FORWARD_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const REFRESH_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
const HOME_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const DUCK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 13v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V5.07c3.95.49 7 3.85 7 7.93 0 1.02-.2 1.99-.55 2.88l-1.55.51z"/></svg>`;

function isUrl(input: string): boolean {
	const trimmed = input.trim();
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) return true;
	if (/^[^\s]+\.[^\s]{2,}/.test(trimmed)) return true;
	return false;
}

function navigateToInput(input: string) {
	const trimmed = input.trim();
	if (!trimmed) return;

	let url: string;
	if (isUrl(trimmed)) {
		url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
	} else {
		url = `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
	}

	browserState.url = url;
	browserState.isBrowsing = true;
	browserState.frame?.go(url);
}

const App: Component<
	{},
	{},
	{
		frameel: HTMLIFrameElement;
		searchInput: string;
	}
> = function (cx) {
	this.searchInput = "";

	cx.mount = async () => {
		await controller.wait();
		browserState.frame = controller.createFrame(this.frameel);
		cachePlugin.install(browserState.frame);

		const openfix = new ScramjetPlugin("openfix");
		openfix.tap(
			browserState.frame.hooks.fetch.intercept,
			(context, props) => {
				if (context.request.destination === "document") {
					props.response = {
						body: "",
						status: 302,
						statusText: "Found",
						headers: ScramjetHeaders.fromRawHeaders([
							[
								"Location",
								new URL(
									`/?goto=${encodeURIComponent(context.parsed.url.href)}`,
									location.origin
								).href,
							],
						]),
					};
				}
			},
			(other: Plugin) => (other.name === cachePlugin.name ? 1 : -1)
		);

		const plugin = new ScramjetPlugin("url-watcher");
		plugin.tap(browserState.frame.hooks.frameInit.post, (context, _props) => {
			if (!context.isTopLevel) return;
			browserState.url = context.client.url.href;
			plugin.tap(context.client.hooks.lifecycle.navigate, (_context, props) => {
				browserState.url = props.url;
			});
		});

		const goto = new URL(location.href).searchParams.get("goto");
		if (goto) {
			browserState.isBrowsing = true;
			browserState.frame?.go(goto);
			history.replaceState(null, "", location.href.split("?")[0]);
		}
	};

	const handleHomeSearch = (e: SubmitEvent) => {
		e.preventDefault();
		navigateToInput(this.searchInput);
	};

	const handleBrowserNav = (e: SubmitEvent) => {
		e.preventDefault();
		navigateToInput(browserState.url);
	};

	const goHome = () => {
		browserState.isBrowsing = false;
		this.searchInput = "";
	};

	return (
		<div class="app-root">
			{/* ===== HOME SCREEN ===== */}
			<div
				class={use(browserState.isBrowsing).map(
					(b) => `home-screen ${b ? "hidden" : ""}`
				)}
			>
				<div class="home-container">
					<div class="home-brand">
						<div class="brand-icon" innerHTML={DUCK_SVG}></div>
						<h1 class="brand-title">Nebula</h1>
						<p class="brand-subtitle">Private browsing, powered by DuckDuckGo</p>
					</div>
					<form class="home-search-form" on:submit={handleHomeSearch}>
						<div class="home-search-box">
							<span class="search-icon" innerHTML={SEARCH_SVG}></span>
							<input
								id="home-search-input"
								type="text"
								class="home-search-input"
								placeholder="Search DuckDuckGo or enter a URL..."
								value={use(this.searchInput)}
								spellcheck="false"
								autocomplete="off"
							/>
						</div>
						<button type="submit" class="home-search-btn">
							Search
						</button>
					</form>
					<div class="home-shortcuts">
						<button
							class="shortcut-chip"
							on:click={() => navigateToInput("https://duckduckgo.com")}
						>
							DuckDuckGo
						</button>
						<button
							class="shortcut-chip"
							on:click={() => navigateToInput("https://youtube.com")}
						>
							YouTube
						</button>
						<button
							class="shortcut-chip"
							on:click={() => navigateToInput("https://reddit.com")}
						>
							Reddit
						</button>
						<button
							class="shortcut-chip"
							on:click={() => navigateToInput("https://discord.com")}
						>
							Discord
						</button>
						<button
							class="shortcut-chip"
							on:click={() => navigateToInput("https://wikipedia.org")}
						>
							Wikipedia
						</button>
					</div>
					<p class="home-footer">
						End-to-end encrypted · Powered by Scramjet
					</p>
				</div>
			</div>

			{/* ===== BROWSER VIEW ===== */}
			<div
				class={use(browserState.isBrowsing).map(
					(b) => `browser-screen ${b ? "active" : ""}`
				)}
			>
				<div class="browser-toolbar">
					<div class="nav-buttons">
						<button
							class="nav-btn"
							on:click={() => browserState.frame?.back()}
							innerHTML={BACK_SVG}
						></button>
						<button
							class="nav-btn"
							on:click={() => browserState.frame?.forward()}
							innerHTML={FORWARD_SVG}
						></button>
						<button
							class="nav-btn"
							on:click={() => browserState.frame?.reload()}
							innerHTML={REFRESH_SVG}
						></button>
						<button class="nav-btn" on:click={goHome} innerHTML={HOME_SVG}></button>
					</div>
					<form class="url-bar-form" on:submit={handleBrowserNav}>
						<input
							id="browser-url-input"
							type="text"
							class="url-bar-input"
							value={use(browserState.url)}
							spellcheck="false"
							placeholder="Search or enter URL..."
						/>
					</form>
				</div>
				<iframe class="browser-iframe" this={use(this.frameel)}></iframe>
			</div>
		</div>
	);
};

App.style = css`
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes subtlePulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.7;
		}
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	:scope {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		margin: 0;
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 0;
		padding: 0;
		background: #000000;
		box-sizing: border-box;
		font-family: "Inter", system-ui, -apple-system, sans-serif;
	}

	/* ==================== HOME SCREEN ==================== */
	.home-screen {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000000;
		transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 10;
	}

	.home-screen.hidden {
		opacity: 0;
		transform: scale(0.98);
		pointer-events: none;
	}

	.home-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		width: min(600px, 90vw);
		animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.home-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.brand-icon {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #ffffff;
		margin-bottom: 4px;
		transition: all 0.3s ease;
	}

	.brand-icon:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
		transform: scale(1.05);
	}

	.brand-icon svg {
		width: 28px;
		height: 28px;
	}

	.brand-title {
		font-size: 3rem;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: #ffffff;
		margin: 0;
		line-height: 1;
	}

	.brand-subtitle {
		font-size: 0.9rem;
		font-weight: 400;
		color: #555;
		margin: 0;
		letter-spacing: 0.01em;
	}

	/* Search Form */
	.home-search-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.home-search-box {
		width: 100%;
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 0 20px;
		gap: 12px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.home-search-box::before {
		content: "";
		position: absolute;
		inset: -1px;
		border-radius: 15px;
		padding: 1px;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1),
			transparent,
			rgba(255, 255, 255, 0.05)
		);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.home-search-box:focus-within {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.06);
		box-shadow:
			0 0 0 4px rgba(255, 255, 255, 0.03),
			0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.home-search-box:focus-within::before {
		opacity: 1;
	}

	.search-icon {
		color: #555;
		display: flex;
		flex-shrink: 0;
		transition: color 0.3s ease;
	}

	.home-search-box:focus-within .search-icon {
		color: #999;
	}

	.home-search-input {
		width: 100%;
		padding: 16px 0;
		font-size: 1rem;
		font-family: "Inter", system-ui, sans-serif;
		font-weight: 400;
		background: transparent;
		border: none;
		outline: none;
		color: #e0e0e0;
		letter-spacing: 0.005em;
	}

	.home-search-input::placeholder {
		color: #444;
	}

	.home-search-btn {
		padding: 12px 32px;
		font-size: 0.875rem;
		font-family: "Inter", system-ui, sans-serif;
		font-weight: 600;
		letter-spacing: 0.01em;
		background: #ffffff;
		color: #000000;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.home-search-btn:hover {
		background: #e0e0e0;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
	}

	.home-search-btn:active {
		transform: translateY(0);
		background: #ccc;
	}

	/* Shortcut Chips */
	.home-shortcuts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	.shortcut-chip {
		padding: 8px 18px;
		font-size: 0.8rem;
		font-family: "Inter", system-ui, sans-serif;
		font-weight: 500;
		background: rgba(255, 255, 255, 0.04);
		color: #888;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 100px;
		cursor: pointer;
		transition: all 0.2s ease;
		letter-spacing: 0.01em;
	}

	.shortcut-chip:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #ccc;
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	.shortcut-chip:active {
		transform: translateY(0);
	}

	.home-footer {
		font-size: 0.72rem;
		color: #333;
		margin: 0;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-weight: 500;
	}

	/* ==================== BROWSER SCREEN ==================== */
	.browser-screen {
		position: absolute;
		inset: 0;
		display: none;
		flex-direction: column;
		background: #000;
	}

	.browser-screen.active {
		display: flex;
	}

	.browser-toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: #0a0a0a;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		flex-shrink: 0;
	}

	.nav-buttons {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.nav-btn {
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: #555;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		padding: 0;
	}

	.nav-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #bbb;
	}

	.nav-btn:active {
		background: rgba(255, 255, 255, 0.1);
	}

	.url-bar-form {
		flex: 1;
		min-width: 0;
	}

	.url-bar-input {
		width: 100%;
		box-sizing: border-box;
		padding: 8px 14px;
		font-size: 0.82rem;
		font-family: "Inter", system-ui, sans-serif;
		font-weight: 400;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		color: #c0c0c0;
		outline: none;
		transition: all 0.2s ease;
	}

	.url-bar-input:focus {
		border-color: rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eee;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.03);
	}

	.url-bar-input::placeholder {
		color: #444;
	}

	.browser-iframe {
		flex: 1;
		border: none;
		background: #fff;
		width: 100%;
	}
`;

export default App;
