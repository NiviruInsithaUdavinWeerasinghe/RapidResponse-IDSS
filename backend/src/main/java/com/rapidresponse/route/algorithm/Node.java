package com.rapidresponse.route.algorithm;

import java.util.Objects;

public final class Node {
    private final String id;

    public Node(String id) {
        this.id = Objects.requireNonNull(id);
    }

    public String getId() {
        return id;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        return other instanceof Node node && id.equals(node.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}