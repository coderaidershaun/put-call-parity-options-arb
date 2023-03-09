// Converts Delta expiry into Deribit Expiry format
const constructDeribitExpiry = (deltaExpiry: string) => {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // Extract delta periods
  const dayStr = deltaExpiry.substring(0, 2);
  const monthStr = deltaExpiry.substring(2, 4);
  const yearStr = deltaExpiry.substring(4, 6);

  // Construct Derebit equivalent
  const month = months[Number(monthStr) - 1];
  const deribitExpiry = dayStr + month + yearStr;
  return deribitExpiry;
};

// Extract Deribit items for matching symbol
const extractDeribitItems = (deribitData: any[], deribitEqv: string) => {
  let askDeribitLocal = 0;
  let bidDeribitLocal = 0;
  let askDeribitUSD = 0;
  let bidDeribitUSD = 0;
  let deribitUnderlyingPrice = 0;
  let deribitFuturesPrice = 0;
  let isMatch = false;
  for (let j = 0; j < deribitData.length; j++) {
    const deribitSymbol = deribitData[j].instrument_name;
    if (deribitSymbol == deribitEqv) {
      deribitUnderlyingPrice = deribitData[j].underlying_price;
      deribitFuturesPrice = deribitData[j].estimated_delivery_price;
      askDeribitLocal = deribitData[j].ask_price;
      bidDeribitLocal = deribitData[j].bid_price;
      askDeribitUSD = deribitUnderlyingPrice * askDeribitLocal;
      bidDeribitUSD = deribitUnderlyingPrice * bidDeribitLocal;
      if (askDeribitUSD > 0 && askDeribitUSD > 0) {
        isMatch = true;
      }
      break;
    }
  }

  // Return results
  return {
    askDeribitUSD,
    bidDeribitUSD,
    deribitUnderlyingPrice,
    isMatch,
    deribitFuturesPrice,
  };
};

// Combine Call and put data for delta
export const combineDeltaData = (deltaCalls: any[], deltaPuts: any[]) => {
  let data: any[] = deltaCalls;
  data = [...data, ...deltaPuts];
  return data;
};

// Combine Call and put data for deribit
export const combineDerbibitData = (deribitBTC: any[], deribitETH: any[]) => {
  let data: any[] = deribitBTC;
  data = [...data, ...deribitETH];
  return data;
};

// Structure both datasets into one common dataset
export const structureData = (deltaData: any[], deribitData: any[]) => {
  const resObjArr: any[] = [];

  // Loop through all delta prices first
  for (let i = 0; i < deltaData.length; i++) {
    // Extract delta option information
    const symbol = deltaData[i].symbol;
    const symbolSplit = symbol.split("-");
    const callPut = symbolSplit[0];
    const ticker = symbolSplit[1];
    const strikeStr = symbolSplit[2];
    const expiry = symbolSplit[3];
    const askDeltaUSD = Number(deltaData[i].quotes.best_ask);
    const bidDeltaUSD = Number(deltaData[i].quotes.best_bid);

    // Guard: Ensure enough liquidity
    if (askDeltaUSD == 0 || bidDeltaUSD == 0) {
      continue;
    }

    // Construct Deribit equivalent symbol
    const expiryDeribit = constructDeribitExpiry(expiry);
    const deribitEqv = `${ticker}-${expiryDeribit}-${strikeStr}-${callPut}`;

    // Extract Deribit items
    const deribitItems = extractDeribitItems(deribitData, deribitEqv);

    // Guard: Ensure matching Deribit item
    if (!deribitItems.isMatch) {
      continue;
    }

    // Guard: Ensure enough Deribit liquidity
    if (deribitItems.askDeribitUSD == 0 || deribitItems.bidDeribitUSD == 0) {
      continue;
    }

    // Structure object result
    const resObj = {
      deltaSymbol: symbol,
      deribitEqv,
      callPut,
      ticker,
      expiry,
      strike: Number(strikeStr),
      askDeltaUSD,
      bidDeltaUSD,
      askDeribitUSD: Number(deribitItems.askDeribitUSD.toFixed(3)),
      bidDeribitUSD: Number(deribitItems.bidDeribitUSD.toFixed(3)),
      futuresPrice: deribitItems.deribitFuturesPrice,
    };

    // Push to Array
    resObjArr.push(resObj);
  }

  // Return Arr
  return resObjArr;
};
