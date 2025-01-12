<script lang="ts">
	export let onClose = () => {};
</script>

<div class="popup-overlay" role="dialog" aria-modal="true">
	<div class="popup-content">
		<button class="close-button" on:click={onClose} aria-label="Close">x</button>
		<h1>About</h1>
		<div class="popup-text">
			<p>This application visualizes the dependencies of lean4 and mathlib4 proofs on a theorem/premise level.</p>
			<b>Interaction</b>
			<p>
				Hovering over a node highlights all edges. Click a node to open a tooltip with more information. Node colors
				indicate node status: Gray = Only dependents, Green = No dependents, Blue = Intermediary.
			</p>
			<p>
				The total number of displayed nodes is limited by bfs (500). Further the neighbors of each node are limited by
				seeded random sampling (Initial: 100, Rest: 50). Re-selecting will randomize the seed.
			</p>
			<p>
				Double-clicking a node will simplify its children (if possible): It removes all nodes that cannot be reached
				anymore if this node were removed.
			</p>
			<p>Search results are sorted according to their frequency of use in the dataset.</p>
			<b>Technical</b>
			<p>
				Data processing was done in Python using the tracing functionality of
				<!-- prettier-ignore -->
				<a href="https://github.com/lean-dojo/LeanDojo">LeanDojo</a> based on lean4 v4.15.0-rc1. In total there are 172104
				nodes and 787646 edges in the dataset, resulting in an 8.8MB JSON file (2.9MB zipped).
			</p>
			<p>
				The frontend was coded in TypeScript using Svelte and Sigma.js. Check out the public
				<!-- prettier-ignore -->
				<a href="https://github.com/oOo0oOo/leanstructure">GitHub Repo</a>.
			</p>
			<b>Acknowledgments</b>
			<p>Special thanks to the Lean community and contributors to LeanDojo and mathlib4.</p>
		</div>
	</div>
</div>

<style>
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.popup-content {
		background: white;
		padding: 0px;
		border-radius: 5px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		max-width: 650px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.popup-content h1 {
		font-family: "Poiret One", sans-serif;
		margin: 0px;
		padding: 20px;
		border-radius: 5px 5px 0px 0px;
		font-weight: normal;
		font-size: 30pt;
		background: repeating-linear-gradient(-45deg, #f8f9fa, #f8f9fa 10px, #efefef 10px, #efefef 20px);
	}

	.popup-text {
		padding: 10px 20px 10px 20px;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 24px;
		font-weight: bold;
		position: absolute;
		top: 10px;
		right: 16px;
		cursor: pointer;
	}
</style>
