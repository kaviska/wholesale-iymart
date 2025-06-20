// import { StockPriceType } from "@/types/type";

// export default function discountCalcuator(stocks: StockPriceType[]): string | boolean {
  
    
  
//     // Filter stocks with quantity greater than 0
//     const validStocks = stocks.filter((stock) => stock.quantity > 0);
  
//     if (validStocks.length === 0) {
//       return "No valid stocks available";
//     }
  
//     // Check if any stock has a discount
//     const hasDiscount = validStocks.some(
//       (stock: StockPriceType) => stock.web_discount > 0
//     );
  
//     if (!hasDiscount) {
//       return false; // No discounts available
//     }
  
//     // If stock has only one item, return the discounted price of that item
//     if (validStocks.length === 1) {
//       const discountedPrice =
//         validStocks[0].web_price - validStocks[0].web_discount;
//       return `${discountedPrice}`;
//     }
  
//     // Extract web prices and discounts from valid stocks
//     const webPrices = validStocks.map((stock) => stock.web_price);
//     const discountPrices = validStocks.map((stock) => stock.web_discount);
  
//     // Calculate price after discount
//     const priceAfterDiscount = webPrices.map((price: number, index: number) => {
//       const discountedPrice = price - discountPrices[index];
//       return discountedPrice;
//     });
  
//     // Find the minimum and maximum discounted prices
//     const minDiscountedPrice = Math.min(...priceAfterDiscount);
//     const maxDiscountedPrice = Math.max(...priceAfterDiscount);
  
  
//     // Return the price range or single discounted price
//     return minDiscountedPrice === maxDiscountedPrice
//       ? `${minDiscountedPrice}`
//       : `${minDiscountedPrice}-${maxDiscountedPrice}`;
//   }