<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { GraphManager } from "$lib/graph-manager";
	import FA2Layout from "graphology-layout-forceatlas2/worker";
	import Tooltip from "./Tooltip.svelte";

	export let graphManager: GraphManager;
	export let labels: string[] = [];

	let container: HTMLElement;
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipContent = "";
	let tooltipNode = -1;
	let tooltipNodeNumNeighbors = [0, 0];
	let camera: any;
	let layout: FA2Layout;
	let layoutTimeout: number | undefined;

	onMount(() => {
		import("sigma").then(({ default: Sigma }) => {
			const graph = graphManager.getSubGraph();
			layout = new FA2Layout(graph, { settings: { gravity: 0.1 } });
			const renderer = new Sigma(graph, container);
			camera = renderer.getCamera();

			renderer.on("clickNode", ({ node, event }) => showTooltip(parseInt(node), event.x, event.y));
			renderer.on("doubleClickNode", ({ node, event }) => handleDoubleClick(event));
			renderer.on("clickStage", () => (tooltipVisible = false));
			renderer.on("enterNode", ({ node }) => graphManager.highlightEdges(parseInt(node)));
			renderer.on("leaveNode", () => graphManager.resetHighlight());

			// On page load and hashchange
			handleHashChange();
			window.addEventListener("hashchange", handleHashChange);
		});
	});

	onDestroy(() => {
		window.removeEventListener("hashchange", handleHashChange);
	});

	function handleHashChange() {
		const hash = window.location.hash;
		const hashParts = hash.substring(1).split(",");
		let updated = false;
		if (hashParts.length === 3) {
			const seed = parseInt(hashParts[0]);
			const direction = hashParts[1] === "1" ? "up" : "down";
			const decoded = decodeURIComponent(hashParts[2]);
			const currentNode = labels.indexOf(decoded); // Use lookup to speed up?
			if (currentNode !== -1) {
				updateSubGraph(currentNode, direction, seed);
				updated = true;
			}
		}

		if (!updated) {
			updateSubGraph(-1, "down");
		}
	}

	function showTooltip(node: number, x: number, y: number) {
		tooltipVisible = false;
		tooltipX = x + 20;
		tooltipY = y + 20;
		tooltipContent = `${labels[node]}`;
		tooltipVisible = true;
		tooltipNode = node;
		tooltipNodeNumNeighbors = graphManager.getNumNeighbors(node);
	}

	function handleUpClick() {
		updateSubGraph(tooltipNode, "up");
	}

	function handleDownClick() {
		updateSubGraph(tooltipNode, "down");
	}

	function handleDoubleClick(event: any) {
		event.preventSigmaDefault();
		graphManager.removeNodeFromSubGraph(tooltipNode);
		tooltipVisible = false;
	}

	export function updateSubGraph(node: number, direction: "up" | "down", seed: number = -1) {
		graphManager.updateSubGraph(node, direction, seed);
		camera.animate({ ratio: 2 }, { duration: 700 }); // Zoom out
		tooltipVisible = false;

		// Start or continue layout until timeOut
		if (layoutTimeout) {
			clearTimeout(layoutTimeout);
		} else {
			layout.start();
		}

		layoutTimeout = setTimeout(() => {
			layout.stop();
			layoutTimeout = undefined;
		}, 3000);
	}
</script>

<div id="sigma-container" bind:this={container}></div>
{#if tooltipVisible}
	<Tooltip
		x={tooltipX}
		y={tooltipY}
		content={tooltipContent}
		numNeighbors={tooltipNodeNumNeighbors}
		onUpClick={handleUpClick}
		onDownClick={handleDownClick}
	/>
{/if}

<style>
	#sigma-container {
		width: 100%;
		height: 100%;
	}
</style>
