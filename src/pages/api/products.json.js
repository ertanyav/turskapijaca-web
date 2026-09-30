import { getProducts } from '../../lib/sheets';

export async function GET() {
  const products = await getProducts();
  return new Response(JSON.stringify({
    status: "success",
    brand: "TURSKA PIJACA",
    owner: "UNIVERCERT MNE D.O.O.",
    total: products.length,
    data: products
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
