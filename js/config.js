export const VERTEX = {
  PROJECT_ID: "741580083810",
  REGION: "us-central1",
  ENDPOINT_ID: "1976575560578498560"
};

export const buildVertexUrl = (apiKey) =>
  `https://${VERTEX.REGION}-aiplatform.googleapis.com/v1/projects/${VERTEX.PROJECT_ID}/locations/${VERTEX.REGION}/endpoints/${VERTEX.ENDPOINT_ID}:generateContent?key=${apiKey}`;
