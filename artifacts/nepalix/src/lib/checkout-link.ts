import pako from "pako";

interface Customer {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  landmark: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  images: string[];
}

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    size: string;
    color: string;
  };
  product: Product;
}

interface CheckoutData {
  customer: Customer;
  items: CartItem[];
}

export function compressCheckoutData(data: CheckoutData): string {
  const json = JSON.stringify(data);
  const compressed = pako.deflate(json, { to: "string" });
  return btoa(compressed);
}

export function generateCheckoutLink(data: CheckoutData, baseUrl: string): string {
  const compressed = compressCheckoutData(data);
  return `${baseUrl}/checkout?o=${encodeURIComponent(compressed)}`;
}