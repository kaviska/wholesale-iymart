import { Stock } from '@/types/type';

export function quantityCalculator(stocks: Stock[]): number {
    if (stocks.length === 0) {
        return 0;
    }

    return stocks.reduce((total, stock) => total + stock.quantity, 0);
}