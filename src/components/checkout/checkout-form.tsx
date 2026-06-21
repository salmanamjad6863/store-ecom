"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { useAuth } from "@/hooks/use-auth";
import { useRevalidateCart } from "@/hooks/use-revalidate-cart";
import { isAdminEmail } from "@/lib/auth/admin";
import { trackMetaPurchase } from "@/lib/meta-pixel";
import { queryKeys } from "@/lib/queries/keys";
import { isValidPkPhone, normalizePkPhone } from "@/lib/validation/phone";
import { useToast } from "@/providers/toast-provider";
import { useCartStore, selectCartSubtotal } from "@/stores/cart-store";

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

type RegisteredField = ReturnType<ReturnType<typeof useForm<CheckoutFormValues>>["register"]>;

const MANUAL_FIELD_IDS = {
  phone: "checkout-delivery-mobile",
  email: "checkout-delivery-contact",
} as const;

const AUTOFILL_SYNC_FIELDS: Array<keyof CheckoutFormValues> = [
  "name",
  "addressLine1",
  "city",
  "postalCode",
];

function mergeFieldHandlers(
  registration: RegisteredField,
  handlers: {
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onInput?: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onMouseDown?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  },
) {
  return {
    ...registration,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      registration.onChange(event);
      handlers.onChange?.(event);
    },
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      registration.onBlur(event);
      handlers.onBlur?.(event);
    },
    ...(handlers.onInput ? { onInput: handlers.onInput } : {}),
    ...(handlers.onFocus ? { onFocus: handlers.onFocus } : {}),
    ...(handlers.onMouseDown ? { onMouseDown: handlers.onMouseDown } : {}),
  };
}

function withAutofillSupport(registration: RegisteredField, autoComplete: string) {
  return {
    ...mergeFieldHandlers(registration, {
      onInput: (event) => {
        registration.onChange(event);
      },
      onBlur: (event) => {
        registration.onChange(event);
      },
    }),
    autoComplete,
  };
}

function withManualEntry(registration: RegisteredField, fieldId: string) {
  const unlockField = (element: HTMLInputElement | HTMLTextAreaElement) => {
    element.readOnly = false;
  };

  return {
    ...mergeFieldHandlers(registration, {
      onMouseDown: (event) => unlockField(event.currentTarget),
      onFocus: (event) => unlockField(event.currentTarget),
    }),
    id: fieldId,
    autoComplete: "new-password",
    "data-1p-ignore": true,
    "data-lpignore": "true",
    readOnly: true,
  };
}

function PhoneEmailAutofillTrap() {
  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
    >
      <input type="tel" name="phone" autoComplete="tel" tabIndex={-1} defaultValue="" readOnly />
      <input type="email" name="email" autoComplete="email" tabIndex={-1} defaultValue="" readOnly />
    </div>
  );
}

type CheckoutFormProps = {
  onCompletingChange?: (completing: boolean) => void;
};

export function CheckoutForm({ onCompletingChange }: CheckoutFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { revalidate } = useRevalidateCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
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

  useEffect(() => {
    const syncAutofilledValues = () => {
      for (const key of AUTOFILL_SYNC_FIELDS) {
        const element = formRef.current?.querySelector<HTMLInputElement>(`#${key}`);

        if (element?.value) {
          setValue(key, element.value, { shouldValidate: true, shouldDirty: true });
        }
      }
    };

    syncAutofilledValues();

    const timeoutIds = [100, 300, 700].map((delay) =>
      window.setTimeout(syncAutofilledValues, delay),
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [setValue]);

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitError(null);

    await revalidate();
    const freshItems = useCartStore.getState().items;

    if (freshItems.length === 0) {
      setSubmitError("Could not place your order. Please try again.");
      return;
    }

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
          items: freshItems,
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
        if (response.status === 400) {
          await revalidate();
        }

        setSubmitError(
          response.status === 400
            ? "Could not place your order. Please review your cart and try again."
            : (data.error ?? "Could not place your order. Please try again."),
        );
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.all,
          refetchType: "none",
        }),
        checkoutUserId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.orders.byUser(checkoutUserId) })
          : Promise.resolve(),
      ]);

      onCompletingChange?.(true);

      trackMetaPurchase(data.orderId, freshItems, selectCartSubtotal(useCartStore.getState()));

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
  const nameField = register("name");
  const addressField = register("addressLine1");
  const cityField = register("city");
  const postalField = register("postalCode");

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8"
    >
      <Card className="relative space-y-6">
        <PhoneEmailAutofillTrap />
        <Text variant="h2" as="h2" className="text-xl">
          Delivery details
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input {...withAutofillSupport(nameField, "name")} />
            {errors.name ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.name.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={MANUAL_FIELD_IDS.phone}>Phone (Pakistan)</Label>
            <Input
              type="tel"
              inputMode="tel"
              placeholder="03XX XXXXXXX"
              {...withManualEntry(register("phone"), MANUAL_FIELD_IDS.phone)}
            />
            {errors.phone ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.phone.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={MANUAL_FIELD_IDS.email}>Email</Label>
            <Input
              type="text"
              inputMode="email"
              spellCheck={false}
              {...withManualEntry(register("email"), MANUAL_FIELD_IDS.email)}
            />
            {errors.email ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.email.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input {...withAutofillSupport(addressField, "street-address")} />
            {errors.addressLine1 ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.addressLine1.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input {...withAutofillSupport(cityField, "address-level2")} />
            {errors.city ? (
              <Text variant="small" as="p" className="text-danger">
                {errors.city.message}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code (optional)</Label>
            <Input {...withAutofillSupport(postalField, "postal-code")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea id="notes" rows={3} autoComplete="off" {...register("notes")} />
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
            Pay with cash when your order is delivered — items plus delivery (free on orders Rs.
            5,000+). Please keep your phone reachable for delivery confirmation.
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

      <CheckoutOrderSummary />
    </form>
  );
}
