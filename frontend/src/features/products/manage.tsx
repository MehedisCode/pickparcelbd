"use client";
import { useAction, useSession } from "@/components/providers";
import {
  BackLink,
  ConfirmAction,
  Empty,
  ErrorState,
  Form,
  Loading,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, money } from "@/lib/api";
import type { Paged, Product } from "@/lib/types";
import { ArrowRight, Plus, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function MyProductsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useResource<Paged<Product>>(
    `/products?mine=1&page=${page}&search=${encodeURIComponent(search)}`,
  );
  const { session } = useSession();
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE SHOP WITH BIG POSSIBILITIES"
        title="Your products"
        description="Good things deserve to be discovered."
        action={
          <Link href="/dashboard/products/new" className="button primary">
            <Plus size={15} />
            List a product
          </Link>
        }
      />
      <div className="filter-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Find a product in your shop…"
        />
        {session?.user && (
          <Link
            href={`/sellers/${session.user.public_id}`}
            className="button secondary"
          >
            <Store size={15} />
            Visit my shop
          </Link>
        )}
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : data?.data.length ? (
        <Panel>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current price</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <small>#{p.id}</small>
                    </td>
                    <td className="capitalize">{p.category}</td>
                    <td>{money(p.price)}</td>
                    <td>{money(p.effective_price)}</td>
                    <td>
                      <div className="button-row">
                        <Link
                          className="text-link"
                          href={`/dashboard/products/${p.id}/edit`}
                        >
                          Edit <ArrowRight size={13} />
                        </Link>
                        <ConfirmAction
                          title="Remove this product?"
                          description="The product will leave the marketplace. Existing order records remain available."
                          onConfirm={() => api.delete(`/products/${p.id}`)}
                        >
                          Remove
                        </ConfirmAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.current_page}
            last={data.last_page}
            onChange={setPage}
          />
        </Panel>
      ) : (
        <Panel>
          <Empty
            title="Every great shop starts with one good thing."
            description="List your first product and share it with your community."
            action={
              <Link href="/dashboard/products/new" className="button primary">
                List a product <Plus size={15} />
              </Link>
            }
          />
        </Panel>
      )}
    </>
  );
}
export function ProductFormScreen({ id }: { id?: string }) {
  const { data, error, loading } = useResource<{ product: Product }>(
    id ? `/products/${id}` : null,
  );
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>();
  const { run, busy } = useAction();
  return (
    <>
      <BackLink href="/dashboard/products" label="Back to your products" />
      <PageHeading
        eyebrow="MAKE ROOM FOR A NEW DISCOVERY"
        title={
          id
            ? "A little update to your product."
            : "What are you bringing to the marketplace?"
        }
        description="Tell the story, set the price, and let the good things find their people."
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="detail-grid">
          <Panel title="Product details">
            <Form
              initial={{
                active: true,
                ...(data?.product || {}),
                ...(imageUrl ? { image_url: imageUrl } : {}),
              }}
              fields={[
                {
                  name: "name",
                  label: "Product name",
                  required: true,
                  placeholder: "A name that tells its story",
                },
                {
                  name: "category",
                  label: "Category",
                  required: true,
                  options: [
                    "fashion",
                    "home",
                    "electronics",
                    "beauty",
                    "food",
                    "other",
                  ].map((v) => ({
                    value: v,
                    label: v.charAt(0).toUpperCase() + v.slice(1),
                  })),
                },
                {
                  name: "description",
                  label: "Description",
                  type: "textarea",
                  placeholder: "The details that make it special",
                },
                {
                  name: "price",
                  label: "Price (৳)",
                  type: "number",
                  required: true,
                  min: 0.01,
                  step: "0.01",
                },
                {
                  name: "discount_price",
                  label: "Discounted price (optional)",
                  type: "number",
                  min: 0.01,
                  step: "0.01",
                },
                {
                  name: "discount_percent",
                  label: "Discount percentage (optional)",
                  type: "number",
                  min: 0,
                  max: 99.99,
                  step: "0.01",
                  help: "A valid discounted price takes priority over percentage.",
                },
                {
                  name: "image_url",
                  refreshKey: imageUrl,
                  label: "Image or supported media URL",
                  placeholder: "https://… or upload an image alongside",
                },
                {
                  name: "active",
                  label: "Show this product in the marketplace",
                  type: "checkbox",
                },
              ]}
              submit={id ? "Save product" : "Publish product"}
              onSubmit={async (d) => {
                if (id) await api.patch(`/products/${id}`, d);
                else await api.post("/products", d);
                router.push("/dashboard/products");
              }}
            />
          </Panel>
          <Panel title="A picture makes the introduction">
            <div className="panel-body">
              <p style={{ fontSize: 12 }}>
                Use a clear product photo. JPG, PNG and WebP up to 8 MB are
                supported.
              </p>
              <label className="field">
                <span>Upload product image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void run(async () => {
                        const fd = new FormData();
                        fd.set("image", file);
                        const result = await api.post<{ url: string }>(
                          "/products/image",
                          fd,
                        );
                        setImageUrl(window.location.origin + result.url);
                      }, "Image uploaded. Continue with the product details.");
                  }}
                />
              </label>
              <p style={{ fontSize: 10, marginTop: 20 }}>
                Upload your image before completing the form. Your product
                details are only published when you choose “Publish product”.
              </p>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
