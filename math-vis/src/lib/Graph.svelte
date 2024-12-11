<script lang="ts">
	import { onMount } from "svelte";
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

	onMount(() => {
		import("sigma").then(({ default: Sigma }) => {
			const graph = graphManager.getSubGraph();
			new FA2Layout(graph, { settings: { gravity: 0.1 } }).start();
			const renderer = new Sigma(graph, container);
			camera = renderer.getCamera();

			renderer.on("clickNode", ({ node, event }) => showTooltip(parseInt(node), event.x, event.y));
			renderer.on("doubleClickNode", ({ node, event }) => handleDoubleClick(event));
			renderer.on("clickStage", () => (tooltipVisible = false));
			renderer.on("enterNode", ({ node }) => graphManager.highlightEdges(parseInt(node)));
			renderer.on("leaveNode", () => graphManager.resetHighlight());

			zoomOut();
		});
	});

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

	function zoomOut() {
		camera.animate({ ratio: 2 }, { duration: 700 });
		tooltipVisible = false;
	}

	export function updateSubGraph(node: number, direction: "up" | "down") {
		graphManager.updateSubGraph(node, direction);
		zoomOut();
	}

	export function updateSubGraphRandom() {
		graphManager.updateSubGraphRandom();
		zoomOut();
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
