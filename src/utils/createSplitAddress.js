import axios from 'axios';

const DONATION_PERCENT = 1;
const DONATION_ADDRESSES = [
  'nostrbuild@getalby.com',
  'sepehr@getalby.com', // nostr-hooks
];

export async function createSplitAddress(splitAddresses) {
  const splits = {};
  for (const address of DONATION_ADDRESSES) {
    splits[address] = DONATION_PERCENT;
  }
  
  for (const address of splitAddresses) {
    splits[address] = Math.floor(100 / splitAddresses.length);
  }

  // ensure split sum does not exceed 100%
  while (Object.values(splits).reduce((a, b) => a + b, 0) > 100) {
    const greatestSplit = Object.entries(splits).find(entry => !Object.entries(splits).find(other => entry[1] < other[1]));
    --splits[greatestSplit[0]];
  }

  const response = await axios
      .post('https://splitaddress.fly.dev/splits', splits, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  if (response.status !== 200) {
    console.error("Failed to create splits", response);
    throw new Error("Failed to create split address: " + response.status);
  }

  return response.data;
}