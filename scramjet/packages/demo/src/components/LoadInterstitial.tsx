import { css, type Component } from "dreamland/core";
const LoadInterstitial: Component<{
	status: string;
}> = function () {
	return (
		<dialog class="loader-dialog">
			<div class="loader-content">
				<div class="loader-spinner">
					<div class="spinner-ring"></div>
				</div>
				<h1>Initializing</h1>
				<p class="loader-status">{use(this.status)}</p>
			</div>
		</dialog>
	);
};

LoadInterstitial.style = css`
	:scope {
		transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		border: none;
		border-radius: 16px;
		background: #0a0a0a;
		color: #e0e0e0;
		padding: 0;
		width: min(420px, 90vw);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.06),
			0 25px 50px -12px rgba(0, 0, 0, 0.8);
	}

	.loader-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 48px 36px;
		gap: 16px;
	}

	.loader-spinner {
		width: 48px;
		height: 48px;
		margin-bottom: 8px;
	}

	.spinner-ring {
		width: 48px;
		height: 48px;
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	h1 {
		text-align: center;
		font-family: "Inter", system-ui, sans-serif;
		font-weight: 600;
		font-size: 1.25rem;
		letter-spacing: -0.01em;
		color: #ffffff;
		margin: 0;
	}

	.loader-status {
		text-align: center;
		font-family: "Inter", system-ui, sans-serif;
		font-size: 0.8rem;
		color: #666;
		margin: 0;
		letter-spacing: 0.01em;
	}

	:modal[open] {
		animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) normal;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	:modal::backdrop {
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(8px);
	}
`;

export default LoadInterstitial;
