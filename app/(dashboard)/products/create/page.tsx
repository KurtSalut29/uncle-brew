"use client";

import ProductForm from "../../../../components/ProductForm";

export default function CreateProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Product</h1>
      <ProductForm
        submitLabel="Create Product"
        onSubmit={async (data) => {
          const res = await fetch("/api/products", {
            method: "POST",
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
