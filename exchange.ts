import axios from "axios";

// Get Delta Exchange prices for all available options
export const getDeltaPrices = async (legType: string) => {
  let data: any[] = [];
  await axios
    .get(`https://api.delta.exchange/v2/tickers?contract_types=${legType}`)
    .then((res) => {
      if (res.status == 200) {
        data = res.data.result;
      }
    })
    .catch((err) => {
      console.error(err);
    });

  // Return output
  return data;
};

// Get Delta Exchange prices for all available options
export const getDeribitPrices = async (symbol: string) => {
  let data: any[] = [];
  await axios
    .get(
      `https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=${symbol}&kind=option`
    )
    .then((res) => {
      if (res.status == 200) {
        data = res.data.result;
      }
    })
    .catch((err) => {
      console.error(err);
    });

  // Return output
  return data;
};
