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
import { slugify } from "@/lib/utils/slug";
import type { Product } from "@/types/product";

import { ImageUploader } from "./image-uploader";

const productFormSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    slug: z.string().min(2, "Slug is required"),
    type: z.string().min(1, "Type is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priceDollars: z.number().positive("Price must be greater than 0"),
    salePriceDollars: z.number().positive().optional(),
    onSale: z.boolean(),
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
    hidden: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.onSale) {
        return true;
      }

      return typeof data.salePriceDollars === "number" && data.salePriceDollars > 0;
    },
    {
      message: "Sale price is required when product is on sale",
      path: ["salePriceDollars"],
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
      salePriceDollars: product?.salePrice ? fromMinorUnits(product.salePrice) : undefined,
      onSale: product?.onSale ?? false,
      quantity: product?.quantity ?? 0,
      hidden: product?.hidden ?? false,
    },
  });

  const name = watch("name");
  const onSale = watch("onSale");

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

    const salePriceDollars =
      typeof values.salePriceDollars === "number" && !Number.isNaN(values.salePriceDollars)
        ? values.salePriceDollars
        : undefined;

    try {
      await onSubmit({
        name: values.name.trim(),
        slug: slugify(values.slug),
        type: values.type.trim(),
        description: values.description.trim(),
        images,
        price: toMinorUnits(values.priceDollars),
        salePrice: values.onSale && salePriceDollars ? toMinorUnits(salePriceDollars) : undefined,
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
            <Label htmlFor="salePriceDollars">Sale price (PKR)</Label>
            <Input
              id="salePriceDollars"
              type="number"
              step="1"
              min="0"
              {...register("salePriceDollars", { valueAsNumber: true })}
            />
            {errors.salePriceDollars ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.salePriceDollars.message}
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
