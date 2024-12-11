<script lang="ts">
	import { GraphManager } from "$lib/graph-manager";
	import Graph from "$lib/Graph.svelte";
	import SearchBar from "$lib/SearchBar.svelte";
	import InfoButton from "$lib/InfoButton.svelte";
	import AboutPopup from "$lib/AboutPopup.svelte";
	import { onMount } from "svelte";

	let graphManager: GraphManager;
	let labels: string[] = [];
	let premises: number[][] = [];
	let dataLoaded: boolean = false;
	let graphComponent: any;
	let nodeStates: number[] = [];
	let showAbout: boolean = false;

	onMount(async () => {
		// Load graph data from JSON, assemble labels
		const graphData = await fetch("data.json").then((res) => res.json());
		premises = graphData["premises"];
		const tokens = graphData["tokens"];

		for (let i = 0; i < graphData["types"].length; i++) {
			const name = graphData["types"][i].map((index: number) => tokens[index]).join(".");
			labels.push(name);
			// We require this for the url hash
			// if (name.includes(",")) {
			// 	console.log(name);
			// }
		}

		const totPremises = premises.reduce((acc, val) => acc + val.length, 0);
		console.log("Loaded graph data:", labels.length, "nodes,", totPremises, "edges");

		graphManager = new GraphManager(labels, premises);
		nodeStates = graphManager.getNodeStates();
		dataLoaded = true;
	});

	function handleSelect(labelIndex: number) {
		graphComponent.updateSubGraph(labelIndex, "down");
	}

	function handleRandomize() {
		graphComponent.updateSubGraphRandom();
	}

	function openAbout() {
		showAbout = true;
	}

	function closeAbout() {
		showAbout = false;
	}
</script>

<main>
	<header>
		<h1>Structure of Lean</h1>
	</header>
	<section id="graph-section">
		{#if dataLoaded}
			<SearchBar {labels} {nodeStates} onSelect={handleSelect} onRandomize={handleRandomize} />
			<Graph {graphManager} {labels} bind:this={graphComponent} />
		{:else}
			<div class="loading">Loading Proofs...</div>
		{/if}
	</section>
	{#if showAbout}
		<AboutPopup onClose={closeAbout} />
	{/if}
	<InfoButton onOpen={openAbout} />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		font-family: Arial, sans-serif;
		margin: 0px;
		padding: 0px;
	}

	header {
		font-family: "Poiret One", sans-serif;
		width: 100%;
		font-size: 15pt;
		background: repeating-linear-gradient(-45deg, #f8f9fa, #f8f9fa 10px, #efefef 10px, #efefef 20px);
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin: 0;
		padding: 10px 0px 10px 0px;
		font-weight: normal;
		font-size: 32pt;
	}

	#graph-section {
		flex-grow: 1;
		position: relative;
		background-color: #fdfdfe;
	}

	.loading {
		margin-top: 20px;
		width: 100%;
		text-align: center;
		font-size: 18px;
	}
</style>
