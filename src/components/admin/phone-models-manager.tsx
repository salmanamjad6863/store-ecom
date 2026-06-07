"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useCasesPerModel } from "@/hooks/use-admin-catalog";
import { useAdminPhoneModels } from "@/hooks/use-phone-models";
import {
  createPhoneModel,
  seedDefaultPhoneModels,
  updatePhoneModel,
  type PhoneModelInput,
} from "@/lib/queries/phone-models";
import { slugify } from "@/lib/utils/slug";

export function PhoneModelsManager() {
  const { data: models = [], isLoading, refetch } = useAdminPhoneModels();
  const { data: caseCounts = {} } = useCasesPerModel();
  const [isSeeding, setIsSeeding] = useState(false);
  const [draft, setDraft] = useState<PhoneModelInput>({
    name: "",
    slug: "",
    sortOrder: models.length + 1,
    active: true,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    try {
      await seedDefaultPhoneModels();
      await refetch();
    } catch {
      setError("Could not seed phone models.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!draft.name.trim()) {
      setError("Model name is required.");
      return;
    }

    try {
      await createPhoneModel({
        ...draft,
        name: draft.name.trim(),
        slug: slugify(draft.slug || draft.name),
      });
      setDraft({ name: "", slug: "", sortOrder: models.length + 2, active: true });
      await refetch();
    } catch {
      setError("Could not add phone model.");
    }
  };

  const handleToggleActive = async (id: string, model: PhoneModelInput) => {
    try {
      await updatePhoneModel(id, { ...model, active: !model.active });
      await refetch();
    } catch {
      setError("Could not update phone model.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" disabled={isSeeding} onClick={() => void handleSeed()}>
          {isSeeding ? "Seeding…" : "Seed iPhone 11 → 17 models"}
        </Button>
        <Text variant="small" as="p" className="text-muted">
          Models are fully dynamic — add iPhone 18 or any future model anytime.
        </Text>
      </div>

      <Card className="space-y-4">
        <Text variant="h2" as="h2" className="text-lg">
          Add iPhone model
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="model-name">Name</Label>
            <Input
              id="model-name"
              placeholder="iPhone 18 Pro Max"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: current.slug || slugify(event.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model-slug">Slug</Label>
            <Input
              id="model-slug"
              placeholder="iphone-18-pro-max"
              value={draft.slug}
              onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
            />
          </div>
        </div>
        <Button type="button" onClick={() => void handleCreate()}>
          Add model
        </Button>
      </Card>

      <Card className="overflow-hidden p-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-muted/20 bg-background">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Case designs</th>
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id} className="border-b border-muted/10 last:border-b-0">
                <td className="px-4 py-3">{model.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{model.slug}</td>
                <td className="px-4 py-3">{caseCounts[model.id] ?? 0}</td>
                <td className="px-4 py-3">{model.sortOrder}</td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    size="sm"
                    variant={model.active ? "secondary" : "ghost"}
                    onClick={() =>
                      void handleToggleActive(model.id, {
                        name: model.name,
                        slug: model.slug,
                        sortOrder: model.sortOrder,
                        active: model.active,
                      })
                    }
                  >
                    {model.active ? "Active" : "Inactive"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {error ? (
        <Text variant="small" as="p" className="text-danger">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
