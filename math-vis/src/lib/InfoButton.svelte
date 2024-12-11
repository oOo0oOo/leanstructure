<script lang="ts">
	export let onOpen = () => {};
</script>

<button on:click={onOpen} class="info-button">i</button>

<style>
	.info-button {
		background: none;
		border: none;
		font-size: 20px;
		font-weight: bold;
		cursor: pointer;
		position: absolute;
		bottom: 16px;
		right: 16px;
		color: white;
		background-color: #007bff;
		width: 30px;
		height: 30px;
		border-radius: 5px;
	}
</style>
