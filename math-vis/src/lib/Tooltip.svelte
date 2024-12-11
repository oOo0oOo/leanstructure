<script>
	export let x = 0;
	export let y = 0;
	export let content = "";
	export let onUpClick;
	export let onDownClick;
	export let numNeighbors = [0, 0];
</script>

<div class="tooltip" style="left: {x}px; top: {y}px;">
	<div class="title">{content}</div>
	<div class="content">
		<a href="https://leanprover-community.github.io/mathlib4_docs/find/?pattern={content}#doc" target="_blank"
			>Documentation</a
		><br /><br />
		<button on:click={onUpClick}>Foundation For {numNeighbors[0]}</button><br />
		<button on:click={onDownClick}>Dependent On {numNeighbors[1]}</button>
	</div>
</div>

<style>
	.tooltip {
		position: absolute;
		background-color: white;
		border: 1px solid rgb(165, 165, 165);
		padding: 0;
		border-radius: 5px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		font-size: 14px;
	}

	.title {
		font-weight: bold;
		padding: 12px;
		border-radius: 5px 5px 0px 0px;
		background: repeating-linear-gradient(-45deg, #fcfcfc, #fcfcfc 10px, #f2f2f2 10px, #f2f2f2 20px);
	}

	.content {
		padding: 12px;
		padding-bottom: 0px;
	}

	button {
		padding: 6px;
		margin-bottom: 12px;
	}
</style>
