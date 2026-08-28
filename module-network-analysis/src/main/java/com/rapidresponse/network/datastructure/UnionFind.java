package com.rapidresponse.network.datastructure;

/**
 * Union-Find (Disjoint Set Forest) with <strong>path compression</strong> and
 * <strong>union by rank</strong>.
 *
 * <p><strong>Purpose:</strong> Tracks a partition of {@code size} elements into disjoint
 * connected components. Used by Kruskal's MST to reject cycle-forming edges in O(1) effective
 * time, and for instant connectivity queries on the road network ("is camp X still reachable
 * from HQ Y after these roads collapsed?").</p>
 *
 * <p><strong>Representation:</strong> Each component is a tree stored implicitly in the
 * {@code parent} array; the component is identified by its root, where
 * {@code parent[root] == root}. The {@code rank} array holds an upper bound on the height of
 * the tree rooted at each element.</p>
 *
 * <p><strong>The two optimizations:</strong></p>
 * <ol>
 *   <li><strong>Path compression</strong> ({@link #find(int)}): after locating the root, every
 *       node on the traversed path is re-pointed directly at the root, flattening the tree so
 *       subsequent queries on those nodes are O(1).</li>
 *   <li><strong>Union by rank</strong> ({@link #union(int, int)}): the shallower tree is
 *       attached under the deeper tree's root, which keeps tree height logarithmic even before
 *       compression. Rank increments only when two equal-rank trees merge.</li>
 * </ol>
 *
 * <p><strong>Time Complexity:</strong> O(&alpha;(V)) amortized per {@code find}, {@code union},
 * or {@code connected} call, where &alpha; is the inverse Ackermann function
 * (&alpha;(V) &lt; 5 for any practical V, so effectively constant).
 * Construction is O(V). <strong>Space Complexity:</strong> O(V).</p>
 *
 * <p><strong>Thread safety:</strong> This class is <em>not</em> thread-safe. It is designed for
 * single-threaded algorithm execution (one instance per algorithm run) and must not be shared
 * across threads without external synchronization.</p>
 */
public class UnionFind {

    /** parent[i] is the parent of element i; a root satisfies parent[i] == i. */
    private final int[] parent;

    /** rank[i] is an upper bound on the height of the tree rooted at i (valid for roots). */
    private final int[] rank;

    /** Number of disjoint components; starts at size and decreases on each successful union. */
    private int componentCount;

    /**
     * Creates a forest of {@code size} singleton components, where every element is its own
     * parent with rank 0.
     *
     * @param size number of elements, addressed as {@code 0 .. size - 1}
     * @throws IllegalArgumentException if {@code size} is not positive
     */
    public UnionFind(int size) {
        if (size <= 0) {
            throw new IllegalArgumentException("UnionFind size must be positive, got: " + size);
        }

        this.parent = new int[size];
        this.rank = new int[size];
        this.componentCount = size;

        for (int i = 0; i < size; i++) {
            parent[i] = i;
            // rank[i] is already 0 from array initialization
        }
    }

    /**
     * Returns the representative (root) of the component containing {@code x}, applying full
     * path compression: every element on the path from {@code x} to the root is re-pointed
     * directly at the root.
     *
     * <p>Implemented iteratively rather than recursively so that a long path in a large network
     * cannot overflow the call stack.</p>
     *
     * @param x element index
     * @return root of {@code x}'s component
     * @throws IndexOutOfBoundsException if {@code x} is not a valid element index
     */
    public int find(int x) {
        validateIndex(x);

        // Pass 1: walk up to the root.
        int root = x;
        while (parent[root] != root) {
            root = parent[root];
        }

        // Pass 2: re-point every node on the path directly at the root.
        int current = x;
        while (parent[current] != root) {
            int next = parent[current];
            parent[current] = root;
            current = next;
        }

        return root;
    }

    /**
     * Merges the components containing {@code x} and {@code y} using union by rank: the root of
     * the lower-rank tree is attached under the root of the higher-rank tree. When ranks are
     * equal, {@code y}'s root is attached under {@code x}'s root and the surviving root's rank
     * is incremented.
     *
     * <p>The {@code false} return is what makes Kruskal's cycle detection a single call: an edge
     * whose endpoints are already connected would close a cycle and must be skipped.</p>
     *
     * @param x first element index
     * @param y second element index
     * @return {@code true} if two distinct components were merged;
     *         {@code false} if {@code x} and {@code y} were already in the same component
     * @throws IndexOutOfBoundsException if either index is not a valid element index
     */
    public boolean union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        // Already connected: merging would create a cycle.
        if (rootX == rootY) {
            return false;
        }

        // Attach the shallower tree under the deeper tree's root.
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        componentCount--;
        return true;
    }

    /**
     * Reports whether two elements currently belong to the same component.
     *
     * @param x first element index
     * @param y second element index
     * @return {@code true} if both elements share a root
     * @throws IndexOutOfBoundsException if either index is not a valid element index
     */
    public boolean connected(int x, int y) {
        return find(x) == find(y);
    }

    /**
     * Returns the number of disjoint components currently in the forest. Equals the element
     * count immediately after construction and drops by one on each successful union, so a
     * fully connected network reports 1.
     *
     * @return current component count
     */
    public int getComponentCount() {
        return componentCount;
    }

    /**
     * Returns the total number of elements this structure was built for.
     *
     * @return element count
     */
    public int getSize() {
        return parent.length;
    }

    private void validateIndex(int x) {
        if (x < 0 || x >= parent.length) {
            throw new IndexOutOfBoundsException(
                    "Element index out of range: " + x + " (size: " + parent.length + ")");
        }
    }
}
