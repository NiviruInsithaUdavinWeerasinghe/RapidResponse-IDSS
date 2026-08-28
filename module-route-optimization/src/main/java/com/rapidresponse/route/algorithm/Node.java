package com.rapidresponse.route.algorithm;

public class Node {
    private Long id;
    private double lat;
    private double lon;

    public Node() {}

    public Node(Long id) {
        this.id = id;
    }
    
    public Node(Long id, double lat, double lon) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }
}
