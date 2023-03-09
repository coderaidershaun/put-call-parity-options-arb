import { MIN_ARB_RATE } from "./constants";

// Find arbitrage opportunities
export const findArbitrage = (data: any[]) => {
  const checkedSymbols: string[] = [];
  const arbs: any[] = [];

  for (let i = 0; i < data.length; i++) {
    const item1 = data[i];

    // Find opposite item
    for (let j = 0; j < data.length; j++) {
      const item2 = data[j];

      // Guard: Ensure not a checked item
      if (
        checkedSymbols.includes(item1.deltaSymbol) ||
        checkedSymbols.includes(item2.deltaSymbol)
      ) {
        continue;
      }

      // Find matching side
      const searchType = item1.callPut == "P" ? "C" : "P";
      const findSymbol = item1.deltaSymbol.replace(item1.callPut, searchType);

      // Guard: Check matches
      if (findSymbol != item2.deltaSymbol) {
        continue;
      }

      // Check for arbitrage
      let callBal = 0;
      let putBal = 0;
      let callPrice = 0;
      let putPrice = 0;
      let callExch = "";
      let putExch = "";
      let callPriceSide = "";
      let putPriceSide = "";
      if (item1.callPut == "C") {
        callBal = item1.bidDeltaUSD + item1.strike;
        putBal = item2.askDeribitUSD + item2.futuresPrice;
        callPrice = item1.bidDeltaUSD;
        putPrice = item2.askDeribitUSD;
        callPriceSide = "bid";
        putPriceSide = "ask";
        callExch = "Delta";
        putExch = "Deribit";
      }

      if (item1.callPut == "P") {
        callBal = item2.bidDeltaUSD + item2.strike;
        putBal = item1.askDeribitUSD + item1.futuresPrice;
        callPrice = item2.bidDeltaUSD;
        putPrice = item1.askDeribitUSD;
        callPriceSide = "bid";
        putPriceSide = "ask";
        callExch = "Delta";
        putExch = "Deribit";
      }

      const callPutDiff = callBal - putBal;
      let diffPerc = 0;
      if (Math.abs(callPutDiff) > 0) {
        diffPerc = callPutDiff / item2.futuresPrice;
      }

      // Add arbitrage
      if (diffPerc > MIN_ARB_RATE) {
        const resObj = {
          item1Symbol: item1.deribitEqv,
          item2Symbol: item2.deribitEqv,
          expiration: item1.expiry,
          item1Type: item1.callPut,
          item2Type: item2.callPut,
          strike: item1.strike,
          futuresPrice: item1.futuresPrice,
          callPricesUsed: {
            callExch,
            priceSide: callPriceSide,
            price: callPrice,
            strike: item1.strike,
            callBal: Number(callBal.toFixed(5)),
          },
          putPricesUsed: {
            putExch,
            priceSide: putPriceSide,
            price: putPrice,
            futuresPrice: item2.futuresPrice,
            putBal: Number(putBal.toFixed(5)),
          },
          arbDiffUSD: Number(callPutDiff.toFixed(3)),
          diffPerc: Number((diffPerc * 100).toFixed(3)),
        };

        // Append Result
        arbs.push(resObj);
      }

      // Add to checked items
      checkedSymbols.push(item2.deltaSymbol);

      // Break
      break;
    }

    // Add to checked items
    checkedSymbols.push(item1.deltaSymbol);
  }

  // Return results
  return arbs;
};
