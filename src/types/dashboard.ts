export type DashboardData = {
  startOfMonth: Date;
  endOfMonth: Date;
  lastStartOfMonth: Date;
  lastEndOfMonth: Date;
  total: {
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  transactionCount: {
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  orderedProductsCount: {
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  highestSellingProduct: {
    product: string;
    quantity: number;
  };
  graphData: {
    date: string;
    qris: number;
    cash: number;
  }[];
};
