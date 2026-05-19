"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import type { ProductInput } from "@/lib/queries/products";
import {
  computeSalePriceFromPercent,
  getProductSalePercent,
} from "@/lib/utils/product";
import { slugify } from "@/lib/utils/slug";
import { formatCurrency } from "@/lib/utils/format";
import { env } from "@/lib/env";
import type { Product } from "@/types/product";

import { ImageUploader } from "./image-uploader";

const productFormSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    slug: z.string().min(2, "Slug is required"),
    type: z.string().min(1, "Type is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priceDollars: z.number().positive("Price must be greater than 0"),
    salePercent: z.number().int().min(1).max(99).optional(),
    onSale: z.boolean(),
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
    hidden: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.onSale) {
        return true;
      }

      return typeof data.salePercent === "number" && data.salePercent >= 1 && data.salePercent <= 99;
    },
    {
      message: "Discount percentage is required when product is on sale (1–99%)",
      path: ["salePercent"],
    },
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

type ProductFormProps = {
  product?: Product;
  onSubmit: (input: ProductInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
};

function fromMinorUnits(minor: number): number {
  return minor / 100;
}

function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

export function ProductForm({
  product,
  onSubmit,
  submitLabel = "Save product",
  isSubmitting = false,
}: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [slugManual, setSlugManual] = useState(Boolean(product));
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      type: product?.type ?? "Clothing",
      description: product?.description ?? "",
      priceDollars: product ? fromMinorUnits(product.price) : 2999,
      salePercent: product ? (getProductSalePercent(product) ?? undefined) : undefined,
      onSale: product?.onSale ?? false,
      quantity: product?.quantity ?? 0,
      hidden: product?.hidden ?? false,
    },
  });

  const name = watch("name");
  const onSale = watch("onSale");
  const priceDollars = watch("priceDollars");
  const salePercent = watch("salePercent");

  const previewSalePriceMinor =
    onSale &&
    typeof priceDollars === "number" &&
    priceDollars > 0 &&
    typeof salePercent === "number" &&
    salePercent >= 1 &&
    salePercent <= 99
      ? computeSalePriceFromPercent(toMinorUnits(priceDollars), salePercent)
      : null;

  useEffect(() => {
    if (!slugManual && name) {
      setValue("slug", slugify(name));
    }
  }, [name, slugManual, setValue]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    setFormError(null);

    if (images.length === 0) {
      setFormError("Add at least one product image.");
      return;
    }

    const percent =
      typeof values.salePercent === "number" && !Number.isNaN(values.salePercent)
        ? values.salePercent
        : undefined;
    const priceMinor = toMinorUnits(values.priceDollars);
    const salePriceMinor =
      values.onSale && percent !== undefined
        ? computeSalePriceFromPercent(priceMinor, percent)
        : undefined;

    try {
      await onSubmit({
        name: values.name.trim(),
        slug: slugify(values.slug),
        type: values.type.trim(),
        description: values.description.trim(),
        images,
        price: priceMinor,
        salePrice: salePriceMinor,
        salePercent: values.onSale ? percent : undefined,
        onSale: values.onSale,
        quantity: values.quantity,
        hidden: values.hidden,
      });
    } catch {
      setFormError("Could not save product. Please try again.");
    }
  };

  return (
    <Card className="max-w-3xl space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.name.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              onChange={(event) => {
                setSlugManual(true);
                setValue("slug", event.target.value);
              }}
            />
            {errors.slug ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.slug.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type / category</Label>
            <Input id="type" placeholder="Clothing" {...register("type")} />
            {errors.type ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.type.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.description.message}
              </Text>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Images</Label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priceDollars">Price (PKR)</Label>
            <Input
              id="priceDollars"
              type="number"
              step="1"
              min="0"
              {...register("priceDollars", { valueAsNumber: true })}
            />
            {errors.priceDollars ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.priceDollars.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity in stock</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="1"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.quantity.message}
              </Text>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...register("onSale")} />
            On sale
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...register("hidden")} />
            Hidden from shop
          </label>
        </div>

        {onSale ? (
          <div className="space-y-2">
            <Label htmlFor="salePercent">Discount (% off)</Label>
            <Input
              id="salePercent"
              type="number"
              step="1"
              min="1"
              max="99"
              placeholder="e.g. 25"
              {...register("salePercent", { valueAsNumber: true })}
            />
            {errors.salePercent ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.salePercent.message}
              </Text>
            ) : null}
            {previewSalePriceMinor !== null ? (
              <Text variant="small" as="p" className="text-muted">
                Sale price:{" "}
                {formatCurrency(
                  previewSalePriceMinor,
                  env.currency.code,
                  env.currency.locale,
                )}
              </Text>
            ) : null}
          </div>
        ) : null}

        {formError ? (
          <Text variant="small" as="p" className="text-danger">
            {formError}
          </Text>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
