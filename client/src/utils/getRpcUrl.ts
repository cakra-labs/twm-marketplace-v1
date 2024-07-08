import sample from "lodash/sample";

// Array of available nodes to connect to
export const nodes = [
  "https://eth-sepolia.g.alchemy.com/v2/26t6Od2wqkhFyeYUyM9wUH1k9T-nMx_J",
  "https://sepolia.infura.io/v3/385a9dae8105429fa86b6cd0c0d1dedc",
  "https://sepolia.infura.io/v3/",
];

const getNodeUrl = () => {
  return sample(nodes);
};

export default getNodeUrl;
