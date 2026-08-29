const BASE_URL = 'http://localhost:8080/api/v1';

async function postRequest(endpoint, body) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}

async function getRequest(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error (${response.status})`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  optimizeRoute: (body) => postRequest('/routes/compare', body),
  listRouteNodes: () => getRequest('/routes/nodes'),
  runDijkstra: (body) => postRequest('/routes/dijkstra', body),
  runAstar: (body) => postRequest('/routes/astar', body),

  // Module 2 (Resource Allocation)
  allocateResources: (body) => postRequest('/resources/allocate/compare', body),
  listItems: () => getRequest('/resources/items'),
  listHelicopters: () => getRequest('/resources/helicopters'),

  // Module 3 (Network Analysis)
  getMST: () => postRequest('/network/mst', {}),
  getReachability: () => postRequest('/network/reachability', {}),
  getComponents: () => postRequest('/network/components', {}),
  toggleEdgeBlock: (body) => postRequest('/network/edges/toggle-block', body),
  resetEdges: () => postRequest('/network/edges/reset', {}),
  listEdges: () => getRequest('/network/edges'),

  // Module 4 (Intelligent Decision)
  optimizeDecisions: (body) => postRequest('/decisions/optimize/compare', body),
  listSOSRequests: () => getRequest('/decisions/sos-requests'),

  // Module 5 (TSP Sequencing)
  sequenceTour: (body) => postRequest('/sequencing/optimize/compare', body),
  getDistanceMatrix: (body) => postRequest('/sequencing/distance-matrix', body),
};
