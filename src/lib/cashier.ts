import { OrdersProductsExtended } from "@/types/ordersProducts";

// Function to calculate subtotal
function calculateSubtotal(ordersProducts: OrdersProductsExtended) {
  if (!ordersProducts || !ordersProducts.OrdersProducts) return 0;
  return ordersProducts.OrdersProducts.reduce(
    (total: number, item: OrdersProductsExtended["OrdersProducts"][number]) =>
      total + (item.product.price || 0) * (item.quantity || 0),
    0
  );
}

// Function to calculate total items
function calculateTotalItems(ordersProducts: OrdersProductsExtended) {
  if (!ordersProducts || !ordersProducts.OrdersProducts) return 0;
  return ordersProducts.OrdersProducts.reduce(
    (total: number, item: OrdersProductsExtended["OrdersProducts"][number]) =>
      total + (item.quantity || 0),
    0
  );
}

// Function to calculate total discounts
function calculateTotalDiscount(
  ordersProducts: OrdersProductsExtended,
  discounts?: { productId: number; percentage: number }[]
) {
  if (!ordersProducts || !ordersProducts.OrdersProducts || !discounts) return 0;
  return ordersProducts.OrdersProducts.reduce(
    (total: number, item: OrdersProductsExtended["OrdersProducts"][number]) => {
      let discountAmount = 0;
      const productDiscounts = discounts.filter(
        d => d.productId === item.product.productId
      );
      productDiscounts.forEach(d => {
        discountAmount +=
          (((item.product.price || 0) * (d.percentage || 0)) / 100) *
          (item.quantity || 0);
      });
      return total + discountAmount;
    },
    0
  );
}

export { calculateSubtotal, calculateTotalItems, calculateTotalDiscount };
