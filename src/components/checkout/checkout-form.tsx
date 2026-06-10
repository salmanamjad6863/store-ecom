"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { isAdminEmail } from "@/lib/auth/admin";
import { queryKeys } from "@/lib/queries/keys";
import { isValidPkPhone, normalizePkPhone } from "@/lib/validation/phone";
import { useToast } from "@/providers/toast-provider";
import type { CartItem } from "@/types/cart";
import { getCartLineKey } from "@/types/cart";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(10, "Enter a valid Pakistani mobile number")
    .refine((value) => isValidPkPhone(value), {
      message: "Use format 03XX XXXXXXX or +92 3XX XXXXXXX",
    }),
  email: z.string().email("Enter a valid email"),
  addressLine1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CheckoutFormProps = {
  items: CartItem[];
  subtotal: number;
  onCompletingChange?: (completing: boolean) => void;
};

export function CheckoutForm({ items, subtotal, onCompletingChange }: CheckoutFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      addressLine1: "",
      city: "",
      postalCode: "",
      notes: "",
    },
  });

  const checkoutUserId =
    user?.uid && !isAdminEmail(user.email) ? user.uid : undefined;

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitError(null);

    const customer = {
      name: values.name.trim(),
      phone: normalizePkPhone(values.phone.trim()),
      email: values.email.trim(),
      addressLine1: values.addressLine1.trim(),
      city: values.city.trim(),
      postalCode: values.postalCode?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer,
          userId: checkoutUserId,
        }),
      });

      const data = (await response.json()) as {
        orderId?: string;
        orderNumber?: string;
        error?: string;
      };

      if (!response.ok || !data.orderId) {
        setSubmitError(data.error ?? "Could not place your order. Please try again.");
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        checkoutUserId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.orders.byUser(checkoutUserId) })
          : Promise.resolve(),
      ]);

      onCompletingChange?.(true);

      const trackParams = new URLSearchParams({
        orderId: data.orderId,
        placed: "1",
        email: "pending",
      });

      toast("Order placed! Save your order ID on the next screen.", "success");
      router.replace(`/track-order?${trackParams.toString()}`);
    } catch {
      setSubmitError("Could not place your order. Please try again.");
    }
  };

  const isBusy = isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
      <Card className="space-y-6">
        <Text variant="h2" as="h2" className="text-xl">
          Delivery details
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.name.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Pakistan)</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="03XX XXXXXXX"
              {...register("phone")}
            />
            {errors.phone ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.phone.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.email.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input id="addressLine1" autoComplete="street-address" {...register("addressLine1")} />
            {errors.addressLine1 ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.addressLine1.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" autoComplete="address-level2" {...register("city")} />
            {errors.city ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.city.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code (optional)</Label>
            <Input id="postalCode" autoComplete="postal-code" {...register("postalCode")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
        </div>

        <div className="rounded-lg border border-muted/20 bg-background p-4">
          <Text variant="small" as="p" className="font-medium text-foreground">
            Payment method
          </Text>
          <Text variant="body" as="p" className="mt-1">
            Cash on Delivery (COD)
          </Text>
          <Text variant="small" as="p" className="mt-2 text-muted">
            Pay with cash when your order is delivered. Please keep your phone reachable for
            delivery confirmation.
          </Text>
        </div>

        {submitError ? (
          <Text variant="small" as="p" className="text-danger">
            {submitError}
          </Text>
        ) : null}

        <Button type="submit" size="lg" disabled={isBusy} className="w-full">
          {isBusy ? "Placing order…" : "Place order"}
        </Button>
      </Card>

      <Card className="h-fit space-y-4">
        <Text variant="h2" as="h2" className="text-xl">
          Your order
        </Text>
        <ul className="space-y-3 border-b border-muted/20 pb-4">
          {items.map((item) => (
            <li
              key={getCartLineKey(item.productId, item.colorId, item.variantId)}
              className="flex justify-between gap-4 text-sm"
            >
              <span className="text-muted">
                {item.name}
                {item.modelName && item.colorName
                  ? ` (${item.modelName} · ${item.colorName})`
                  : ""}{" "}
                × {item.quantity}
              </span>
              <Price amount={item.unitPrice * item.quantity} />
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between">
          <Text variant="h2" as="span" className="text-lg">
            Total (COD)
          </Text>
          <Price amount={subtotal} className="text-lg" />
        </div>
      </Card>
    </form>
  );
}
