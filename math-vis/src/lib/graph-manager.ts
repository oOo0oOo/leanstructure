import DirectedGraph from "graphology";
import {
	EDGE_COLORS,
	NODE_COLORS,
	MAX_NODES_PER_SEARCH,
	MAX_NEIGHBORS_PER_SEARCH_FIRST,
	MAX_NEIGHBORS_PER_SEARCH,
	MIN_NEIGHBORS_RANDOM
} from "$lib/config";

export class GraphManager {
	private subGraph: DirectedGraph;
	private labels: string[];
	private sizeGraph: number;
	private premises: number[][];
	private revPremises: number[][];
	private nodeState: number[];
	private currentNode: number = -1;
	private currentDirection: "up" | "down" = "down";

	constructor(labels: string[], premises: number[][]) {
		this.subGraph = new DirectedGraph();
		this.labels = labels;
		this.sizeGraph = premises.length;
		this.premises = premises;

		// Reverse premise lookup
		this.revPremises = Array.from({ length: this.sizeGraph }, () => []);
		premises.forEach((premisesList, i) => {
			premisesList.forEach((premise) => this.revPremises[premise].push(i));
		});

		// Precompute node state (0: has prem and revPrem, 1: has only prem, 2: has only revPrem)
		this.nodeState = Array.from({ length: this.sizeGraph }, (_, i) => {
			const hasPremises = premises[i].length > 0;
			const hasRevPremises = this.revPremises[i].length > 0;
			return hasPremises && hasRevPremises ? 0 : hasPremises ? 1 : 2;
		});

		this.updateSubGraphRandom();
	}

	getNodeStates(): number[] {
		return this.nodeState;
	}

	getNumNeighbors(node: number): number[] {
		return [this.revPremises[node].length, this.premises[node].length];
	}

	addNodeToSubGraph(node: number, isCurrentNode = false) {
		if (this.subGraph.hasNode(node)) return;

		const color = NODE_COLORS[this.nodeState[node]];
		let size = 15;
		if (!isCurrentNode) {
			size = this.nodeState[node] === 2 ? 6 : 8;
		}

		// Adjust size for mobile devices
		if (window.innerWidth <= 768) {
			size *= 0.6;
		}

		this.subGraph.addNode(node, {
			label: this.labels[node],
			size: size,
			color,
			x: Math.random(),
			y: Math.random()
		});
	}

	updateSubGraph(currentNode: number, direction: "up" | "down") {
		// A BFS up/down the dependency graph
		this.currentNode = currentNode;
		this.currentDirection = direction;

		this.subGraph.clear(); // A fresh start
		this.addNodeToSubGraph(currentNode, true);

		const isUp = direction === "up";

		const visited = new Set<number>();
		const queue: number[] = [currentNode];
		let addedNodes = 1;

		while (queue.length && addedNodes < MAX_NODES_PER_SEARCH) {
			const node = queue.shift();
			if (node === undefined || visited.has(node)) continue;

			visited.add(node);

			// Limit number of neighbors (sample randomly)
			const allNeighbors = isUp ? this.revPremises[node] : this.premises[node];
			let neighbors = new Set<number>();

			const limit = addedNodes === 1 ? MAX_NEIGHBORS_PER_SEARCH_FIRST : MAX_NEIGHBORS_PER_SEARCH;

			if (allNeighbors.length > limit) {
				while (neighbors.size < Math.min(limit, allNeighbors.length)) {
					const randomNeighbor = allNeighbors[Math.floor(Math.random() * allNeighbors.length)];
					neighbors.add(randomNeighbor);
				}
			} else {
				neighbors = new Set(allNeighbors);
			}

			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					this.addNodeToSubGraph(neighbor);
					addedNodes++;
					queue.push(neighbor);
				}
				if (!this.subGraph.hasEdge(node, neighbor) && !this.subGraph.hasEdge(neighbor, node)) {
					this.subGraph.addEdge(isUp ? node : neighbor, isUp ? neighbor : node, {
						type: "arrow",
						size: 2,
						color: EDGE_COLORS[0]
					});
				}
			}
		}
	}

	updateSubGraphRandom() {
		let node;
		do {
			node = Math.floor(Math.random() * this.sizeGraph);
		} while (this.premises[node].length < MIN_NEIGHBORS_RANDOM);
		this.updateSubGraph(node, "down");
	}

	removeNodeFromSubGraph(node: number) {
		if (node === this.currentNode) return;
		this.removeUnreachableNodes(node);
	}

	removeUnreachableNodes(removedNode: number) {
		// Find nodes in subgraph that are unreachable from the current node
		const visited = new Set<string>();
		const queue: string[] = [this.currentNode.toString()];
		const removedNodeStr = removedNode.toString();

		while (queue.length) {
			const node = queue.shift();
			if (node === undefined || visited.has(node)) continue;

			visited.add(node);

			if (node === removedNodeStr) continue;

			if (this.currentDirection === "up") {
				this.subGraph.forEachOutboundNeighbor(node, function (neighbor, __) {
					if (!visited.has(neighbor)) {
						queue.push(neighbor);
					}
				});
			} else {
				this.subGraph.forEachInboundNeighbor(node, function (neighbor, __) {
					if (!visited.has(neighbor)) {
						queue.push(neighbor);
					}
				});
			}
		}

		// Remove nodes that are not visited
		this.subGraph.forEachNode((node) => {
			if (!visited.has(node)) {
				this.subGraph.dropNode(parseInt(node));
			}
		});
	}

	getSubGraph(): DirectedGraph {
		return this.subGraph;
	}

	highlightEdges(node: number) {
		const nodeStr = node.toString();
		this.subGraph.forEachEdge((edge, attributes, source, target) => {
			if (source === nodeStr || target === nodeStr) {
				this.subGraph.mergeEdgeAttributes(edge, { color: EDGE_COLORS[1], size: 3 });
			}
		});
	}

	resetHighlight() {
		this.subGraph.forEachEdge((edge) => {
			this.subGraph.mergeEdgeAttributes(edge, { color: EDGE_COLORS[0], size: 2 });
		});
	}
}
