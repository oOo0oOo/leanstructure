<script lang="ts">
	import { NODE_SEARCH_COLORS, MAX_SEARCH_RESULTS, MIN_SEARCH_CHARACTERS } from "$lib/config";

	export let labels: string[] = [];
	export let nodeStates: number[] = [];
	export let onSelect: (labelIndex: number) => void;
	export let onRandomize: () => void;

	let lowerLabels: string[] = labels.map((label) => label.toLowerCase());

	let searchQuery: string = "";
	let suggestions: { label: string; index: number }[] = [];
	let truncatedResults: number = 0;

	function handleInput(event: any) {
		searchQuery = event.target.value.toLowerCase();
		if (searchQuery.length < MIN_SEARCH_CHARACTERS) {
			suggestions = [];
			return;
		}

		const filteredSuggestions = lowerLabels
			.map((label, index) => ({ label, index }))
			.filter((item) => item.label.includes(searchQuery));

		truncatedResults = filteredSuggestions.length - MAX_SEARCH_RESULTS;
		suggestions = filteredSuggestions.slice(0, MAX_SEARCH_RESULTS);
	}

	function handleSuggestionClick(suggestion: number) {
		searchQuery = "";
		suggestions = [];
		onSelect(suggestion);
	}

	function handleRandomize() {
		searchQuery = "";
		suggestions = [];
		onRandomize();
	}
</script>

<div id="search-bar-container">
	<div id="search-bar">
		<input type="text" placeholder="Search..." bind:value={searchQuery} on:input={handleInput} />
		<button type="button" on:click={handleRandomize}>Randomize</button>
	</div>
	{#if suggestions.length > 0}
		<ul id="suggestions-list">
			{#each suggestions as { label, index }}
				<li>
					<button
						type="button"
						on:click={() => handleSuggestionClick(index)}
						style="color: {NODE_SEARCH_COLORS[nodeStates[index]]}"
					>
						{labels[index]}
					</button>
				</li>
			{/each}
			{#if truncatedResults > 0}
				<li class="truncated-message">Truncated {truncatedResults} results...</li>
			{/if}
		</ul>
	{/if}
</div>

<style>
	#search-bar-container {
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-53%);
		z-index: 10;
		width: 350px;
		max-width: 100%;
	}

	#search-bar {
		display: flex;
		align-items: center;
		background-color: #f5f5f9;
		padding: 10px;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		width: 100%;
	}

	#search-bar input {
		flex-grow: 1;
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 3px;
		margin-right: 10px;
	}

	#search-bar button {
		padding: 5px 10px;
		border: none;
		border-radius: 3px;
		background-color: #007bff;
		color: white;
		cursor: pointer;
	}

	#search-bar button:hover {
		background-color: #0056b3;
	}

	#suggestions-list {
		list-style: none;
		padding: 0;
		margin: 10px 0 0 0;
		width: 100%;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		max-height: 250px;
		overflow-y: auto;
	}

	#suggestions-list li {
		padding: 0;
	}

	#suggestions-list button {
		width: 100%;
		padding: 10px;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
	}

	#suggestions-list button:hover {
		background-color: #f0f0f0;
	}

	.truncated-message {
		text-align: center;
		font-size: 12px;
		color: #666;
		cursor: default;
		margin: 12px;
	}
</style>
