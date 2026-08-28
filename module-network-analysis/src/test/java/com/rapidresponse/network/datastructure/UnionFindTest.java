package com.rapidresponse.network.datastructure;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;
import java.util.Random;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for the Union-Find (Disjoint Set Forest) data structure: initialization,
 * path compression, union by rank, cycle detection, component counting, and index validation.
 */
class UnionFindTest {

    private UnionFind uf;

    @BeforeEach
    void setUp() {
        uf = new UnionFind(10);
    }

    // ======================== Constructor Tests ========================

    @Test
    void constructor_shouldMakeEveryElementItsOwnParentWithRankZero() {
        int[] parent = parentArray(uf);
        int[] rank = rankArray(uf);

        for (int i = 0; i < 10; i++) {
            assertEquals(i, parent[i], "element " + i + " should be its own parent");
            assertEquals(0, rank[i], "element " + i + " should start at rank 0");
        }
    }

    @Test
    void constructor_shouldStartWithOneComponentPerElement() {
        assertEquals(10, uf.getComponentCount());
        assertEquals(10, uf.getSize());
    }

    @Test
    void constructor_zeroOrNegativeSize_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> new UnionFind(0));
        assertThrows(IllegalArgumentException.class, () -> new UnionFind(-1));
    }

    @Test
    void constructor_singleElement_shouldBeValid() {
        UnionFind single = new UnionFind(1);

        assertEquals(1, single.getComponentCount());
        assertEquals(0, single.find(0));
        assertTrue(single.connected(0, 0));
    }

    // ======================== find() / Path Compression Tests ========================

    @Test
    void find_isolatedElement_shouldReturnItself() {
        assertEquals(7, uf.find(7));
    }

    @Test
    void find_shouldCompressEntirePathToRoot() {
        // Build a degenerate chain 0 <- 1 <- 2 <- 3 <- 4 (root is 0) bypassing union(),
        // so that compression has something to flatten.
        int[] parent = parentArray(uf);
        for (int i = 1; i < 5; i++) {
            parent[i] = i - 1;
        }

        assertEquals(0, uf.find(4));

        // Every node on the traversed path must now point directly at the root.
        for (int i = 1; i < 5; i++) {
            assertEquals(0, parent[i], "node " + i + " should point directly at the root");
        }
    }

    @Test
    void find_shouldNotAlterRootOrComponentCount() {
        uf.union(1, 2);
        uf.union(2, 3);
        int countBefore = uf.getComponentCount();

        int root = uf.find(3);

        assertEquals(root, uf.find(3), "find should be idempotent");
        assertEquals(root, uf.find(1));
        assertEquals(countBefore, uf.getComponentCount(), "find must not merge components");
    }

    @Test
    void find_longChain_shouldNotOverflowStack() {
        // The iterative implementation must survive a chain far deeper than the call stack.
        int size = 200_000;
        UnionFind deep = new UnionFind(size);
        int[] parent = parentArray(deep);
        for (int i = 1; i < size; i++) {
            parent[i] = i - 1;
        }

        assertEquals(0, deep.find(size - 1));
        assertEquals(0, parent[size / 2], "compression should have flattened the chain");
    }

    @Test
    void find_indexOutOfRange_shouldThrow() {
        assertThrows(IndexOutOfBoundsException.class, () -> uf.find(-1));
        assertThrows(IndexOutOfBoundsException.class, () -> uf.find(10));
        assertThrows(IndexOutOfBoundsException.class, () -> uf.find(Integer.MAX_VALUE));
    }

    // ======================== union() Tests ========================

    @Test
    void union_twoIsolatedElements_shouldMergeAndReturnTrue() {
        assertTrue(uf.union(0, 1));

        assertTrue(uf.connected(0, 1));
        assertEquals(uf.find(0), uf.find(1));
        assertEquals(9, uf.getComponentCount());
    }

    @Test
    void union_alreadyConnected_shouldReturnFalse() {
        uf.union(0, 1);

        assertFalse(uf.union(0, 1), "re-uniting the same pair must report no merge");
        assertFalse(uf.union(1, 0), "order must not matter");
        assertEquals(9, uf.getComponentCount(), "component count must not change");
    }

    @Test
    void union_sameElement_shouldReturnFalse() {
        assertFalse(uf.union(4, 4));
        assertEquals(10, uf.getComponentCount());
    }

    @Test
    void union_closingACycle_shouldReturnFalse() {
        // Kruskal's cycle detection: edges 0-1, 1-2, 2-0 form a triangle;
        // the third edge must be rejected.
        assertTrue(uf.union(0, 1));
        assertTrue(uf.union(1, 2));
        assertFalse(uf.union(2, 0), "third edge of a triangle closes a cycle");

        assertEquals(8, uf.getComponentCount());
    }

    @Test
    void union_equalRanks_shouldIncrementSurvivingRoot() {
        int[] rank = rankArray(uf);

        uf.union(0, 1); // both rank 0 -> root 0 becomes rank 1

        assertEquals(0, uf.find(1), "first argument's root should survive on a rank tie");
        assertEquals(1, rank[0]);
        assertEquals(0, rank[1]);
    }

    @Test
    void union_byRank_shouldAttachShallowerTreeUnderDeeperTree() {
        // Tree A: {0,1} rooted at 0 with rank 1. Element 5 is a singleton with rank 0.
        uf.union(0, 1);
        int[] rank = rankArray(uf);
        assertEquals(1, rank[0]);

        // Deeper root passed second: the singleton must still sink under it.
        assertTrue(uf.union(5, 0));

        assertEquals(0, uf.find(5), "shallower tree must hang under the deeper root");
        assertEquals(1, rank[0], "attaching a shallower tree must not raise the root's rank");
    }

    @Test
    void union_indexOutOfRange_shouldThrow() {
        assertThrows(IndexOutOfBoundsException.class, () -> uf.union(-1, 0));
        assertThrows(IndexOutOfBoundsException.class, () -> uf.union(0, 10));
    }

    // ======================== connected() Tests ========================

    @Test
    void connected_isolatedElements_shouldReturnFalse() {
        assertFalse(uf.connected(3, 8));
    }

    @Test
    void connected_sameElement_shouldReturnTrue() {
        assertTrue(uf.connected(3, 3));
    }

    @Test
    void connected_shouldBeTransitiveAcrossChainedUnions() {
        uf.union(0, 1);
        uf.union(1, 2);
        uf.union(2, 3);

        assertTrue(uf.connected(0, 3), "connectivity must propagate along the chain");
        assertTrue(uf.connected(3, 0), "connectivity must be symmetric");
        assertFalse(uf.connected(0, 4), "unrelated elements must stay disconnected");
    }

    @Test
    void connected_separateComponents_shouldStayIndependent() {
        uf.union(0, 1);
        uf.union(2, 3);

        assertTrue(uf.connected(0, 1));
        assertTrue(uf.connected(2, 3));
        assertFalse(uf.connected(1, 2));
        assertEquals(8, uf.getComponentCount());
    }

    @Test
    void connected_indexOutOfRange_shouldThrow() {
        assertThrows(IndexOutOfBoundsException.class, () -> uf.connected(0, -1));
        assertThrows(IndexOutOfBoundsException.class, () -> uf.connected(10, 0));
    }

    // ======================== Component Counting Tests ========================

    @Test
    void getComponentCount_shouldDecrementOnlyOnSuccessfulUnions() {
        assertEquals(10, uf.getComponentCount());

        uf.union(0, 1);
        assertEquals(9, uf.getComponentCount());

        uf.union(1, 2);
        assertEquals(8, uf.getComponentCount());

        uf.union(0, 2); // redundant edge
        assertEquals(8, uf.getComponentCount());
    }

    @Test
    void getComponentCount_fullyConnectedNetwork_shouldBeOne() {
        for (int i = 1; i < 10; i++) {
            assertTrue(uf.union(i - 1, i));
        }

        assertEquals(1, uf.getComponentCount());
        assertTrue(uf.connected(0, 9));
    }

    @Test
    void getComponentCount_shouldMatchNumberOfDistinctRoots() {
        uf.union(0, 1);
        uf.union(2, 3);
        uf.union(3, 4);

        long distinctRoots = java.util.stream.IntStream.range(0, 10)
                .map(uf::find)
                .distinct()
                .count();

        assertEquals(distinctRoots, uf.getComponentCount());
    }

    // ======================== Randomized Cross-Check ========================

    @Test
    void randomOperations_shouldMatchNaiveLabelPropagationModel() {
        int size = 120;
        UnionFind subject = new UnionFind(size);
        int[] label = new int[size]; // naive model: label[i] is i's component id
        for (int i = 0; i < size; i++) {
            label[i] = i;
        }
        int expectedComponents = size;

        Random random = new Random(20260828L);
        for (int op = 0; op < 4000; op++) {
            int x = random.nextInt(size);
            int y = random.nextInt(size);

            boolean expectedMerge = label[x] != label[y];
            assertEquals(expectedMerge, subject.union(x, y),
                    "union(" + x + ", " + y + ") disagreed with the naive model");

            if (expectedMerge) {
                int from = label[y];
                int to = label[x];
                for (int i = 0; i < size; i++) {
                    if (label[i] == from) {
                        label[i] = to;
                    }
                }
                expectedComponents--;
            }

            assertEquals(expectedComponents, subject.getComponentCount());
            assertEquals(label[x] == label[y], subject.connected(x, y));
        }
    }

    // ======================== Reflection Helpers ========================

    private static int[] parentArray(UnionFind target) {
        return intArrayField(target, "parent");
    }

    private static int[] rankArray(UnionFind target) {
        return intArrayField(target, "rank");
    }

    /**
     * Reads a private int[] field so tests can assert on the internal forest shape
     * (path compression, rank bookkeeping) without widening the public API.
     */
    private static int[] intArrayField(UnionFind target, String name) {
        try {
            Field field = UnionFind.class.getDeclaredField(name);
            field.setAccessible(true);
            return (int[]) field.get(target);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Could not read UnionFind." + name, e);
        }
    }
}
