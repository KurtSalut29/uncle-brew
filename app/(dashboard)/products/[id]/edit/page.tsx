"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../../../../../components/ProductForm";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r) => r.json()).then(setProduct);
  }, [id]);

  if (!product) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h1>
      <ProductForm
        submitLabel="Save Changes"
        initial={{
          name: product.name,
          description: product.description ?? "",
          price: String(product.price),
          stock: String(product.stock),
          category: product.category,
          imageUrl: product.imageUrl ?? "",
        }}
        onSubmit={async (data) => {
          const res = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error);
          }
        }}
      />
    </div>
  );
}
