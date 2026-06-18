"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useCasesPerModel } from "@/hooks/use-admin-catalog";
import { useAdminPhoneModels } from "@/hooks/use-phone-models";
import {
  createPhoneModel,
  createPhoneModelsBatch,
  deletePhoneModel,
  seedDefaultPhoneModels,
  updatePhoneModel,
  type PhoneModelInput,
} from "@/lib/queries/phone-models";
import {
  getPhoneModelVariantLabel,
  groupPhoneModelsByGeneration,
} from "@/lib/utils/phone-model-groups";
import {
  buildIphoneModelName,
  buildIphoneModelSlug,
  getAvailableStandardVariants,
  getGenerationNumbers,
  getMissingStandardGenerationModels,
  isDuplicatePhoneModel,
} from "@/lib/utils/iphone-model-variants";
import { slugify } from "@/lib/utils/slug";
import { cn } from "@/lib/utils/cn";
import type { PhoneModel } from "@/types/phone-model";

const CUSTOM_VARIANT_VALUE = "__custom__";
const selectClassName =
  "w-full rounded-lg border border-muted/20 bg-background px-3 py-2 text-sm text-foreground";

type ConfirmAction =
  | { type: "delete"; model: PhoneModel }
  | { type: "toggle-active"; model: PhoneModel }
  | { type: "save-edit"; model: PhoneModel; nextName: string }
  | { type: "add-generation"; generation: string; models: PhoneModelInput[] };

export function PhoneModelsManager() {
  const { data: models = [], isLoading, refetch } = useAdminPhoneModels();
  const { data: caseCounts = {} } = useCasesPerModel();
  const [isSeeding, setIsSeeding] = useState(false);
  const [generationNumber, setGenerationNumber] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [customVariantSuffix, setCustomVariantSuffix] = useState("");
  const [manualName, setManualName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openGenerations, setOpenGenerations] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const groups = useMemo(() => groupPhoneModelsByGeneration(models), [models]);
  const generationNumbers = useMemo(() => getGenerationNumbers(models), [models]);

  const availableVariants = useMemo(() => {
    if (!selectedGeneration) {
      return [];
    }

    return getAvailableStandardVariants(selectedGeneration, models);
  }, [models, selectedGeneration]);

  const nextSortOrderStart = useMemo(
    () => (models.length > 0 ? Math.min(...models.map((model) => model.sortOrder)) - 3 : 1),
    [models],
  );

  useEffect(() => {
    void seedDefaultPhoneModels().then((added) => {
      if (added > 0) {
        void refetch();
      }
    });
  }, [refetch]);

  useEffect(() => {
    if (generationNumbers.length === 0) {
      setSelectedGeneration("");
      return;
    }

    if (!generationNumbers.includes(selectedGeneration)) {
      setSelectedGeneration(generationNumbers[0] ?? "");
    }
  }, [generationNumbers, selectedGeneration]);

  useEffect(() => {
    if (availableVariants.length === 0) {
      setSelectedVariant(CUSTOM_VARIANT_VALUE);
      return;
    }

    if (
      selectedVariant !== CUSTOM_VARIANT_VALUE &&
      !availableVariants.includes(selectedVariant as (typeof availableVariants)[number])
    ) {
      setSelectedVariant(availableVariants[0] ?? CUSTOM_VARIANT_VALUE);
    }
  }, [availableVariants, selectedVariant]);

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

  const requestAddGeneration = () => {
    setError(null);
    const generation = generationNumber.trim();

    if (!/^\d+$/.test(generation)) {
      setError("Enter a valid iPhone generation number (e.g. 18).");
      return;
    }

    const toAdd = getMissingStandardGenerationModels(generation, models, nextSortOrderStart);

    if (toAdd.length === 0) {
      setError(`iPhone ${generation} and all standard variants already exist.`);
      return;
    }

    setConfirmError(null);
    setConfirmAction({ type: "add-generation", generation, models: toAdd });
  };

  const handleAddVariant = async () => {
    setError(null);

    if (!selectedGeneration) {
      setError("Select an iPhone generation first.");
      return;
    }

    const variantSuffix =
      selectedVariant === CUSTOM_VARIANT_VALUE ? customVariantSuffix.trim() : selectedVariant;

    if (!variantSuffix && selectedVariant === CUSTOM_VARIANT_VALUE) {
      setError("Enter a custom variant name (e.g. Plus).");
      return;
    }

    const name = buildIphoneModelName(selectedGeneration, variantSuffix);
    const slug = buildIphoneModelSlug(selectedGeneration, variantSuffix);

    if (isDuplicatePhoneModel(slug, models)) {
      setError(`"${name}" already exists.`);
      return;
    }

    const sortOrder =
      models.length > 0 ? Math.min(...models.map((model) => model.sortOrder)) - 1 : 1;

    try {
      await createPhoneModel({
        name,
        slug,
        sortOrder,
        active: true,
      });
      setCustomVariantSuffix("");
      setOpenGenerations((current) => new Set(current).add(selectedGeneration));
      await refetch();
    } catch {
      setError("Could not add variant.");
    }
  };

  const handleManualAdd = async () => {
    setError(null);
    const trimmedName = manualName.trim();

    if (!trimmedName) {
      setError("Model name is required.");
      return;
    }

    const slug = slugify(trimmedName);

    if (isDuplicatePhoneModel(slug, models)) {
      setError(`"${trimmedName}" already exists.`);
      return;
    }

    const sortOrder =
      models.length > 0 ? Math.min(...models.map((model) => model.sortOrder)) - 1 : 1;

    try {
      await createPhoneModel({
        name: trimmedName,
        slug,
        sortOrder,
        active: true,
      });
      setManualName("");
      await refetch();
    } catch {
      setError("Could not add phone model.");
    }
  };

  const startEditing = (model: PhoneModel) => {
    setEditingId(model.id);
    setEditName(model.name);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const requestSaveEdit = (model: PhoneModel) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setError("Model name is required.");
      return;
    }

    const nextSlug = slugify(trimmedName);
    if (nextSlug !== model.slug && isDuplicatePhoneModel(nextSlug, models)) {
      setError(`"${trimmedName}" already exists.`);
      return;
    }

    if (trimmedName === model.name) {
      cancelEditing();
      return;
    }

    setConfirmError(null);
    setConfirmAction({ type: "save-edit", model, nextName: trimmedName });
  };

  const requestToggleActive = (model: PhoneModel) => {
    setConfirmError(null);
    setConfirmAction({ type: "toggle-active", model });
  };

  const requestDelete = (model: PhoneModel) => {
    setConfirmError(null);
    setConfirmAction({ type: "delete", model });
  };

  const closeConfirm = () => {
    if (isConfirmLoading) {
      return;
    }

    setConfirmAction(null);
    setConfirmError(null);
  };

  const handleConfirm = async () => {
    if (!confirmAction) {
      return;
    }

    setIsConfirmLoading(true);
    setConfirmError(null);

    try {
      if (confirmAction.type === "delete") {
        await deletePhoneModel(confirmAction.model.id);
      }

      if (confirmAction.type === "toggle-active") {
        const { model } = confirmAction;
        await updatePhoneModel(model.id, {
          name: model.name,
          slug: model.slug,
          sortOrder: model.sortOrder,
          active: !model.active,
        });
      }

      if (confirmAction.type === "save-edit") {
        const { model, nextName } = confirmAction;
        await updatePhoneModel(model.id, {
          name: nextName,
          slug: slugify(nextName),
          sortOrder: model.sortOrder,
          active: model.active,
        });
        setEditingId(null);
        setEditName("");
      }

      if (confirmAction.type === "add-generation") {
        await createPhoneModelsBatch(confirmAction.models);
        setGenerationNumber("");
        setOpenGenerations((current) => new Set(current).add(confirmAction.generation));
      }

      setConfirmAction(null);
      await refetch();
    } catch {
      setConfirmError("Could not complete this action. Please try again.");
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const toggleGeneration = (generation: string) => {
    setOpenGenerations((current) => {
      const next = new Set(current);
      if (next.has(generation)) {
        next.delete(generation);
      } else {
        next.add(generation);
      }
      return next;
    });
  };

  const generationPreview = useMemo(() => {
    const generation = generationNumber.trim();
    if (!/^\d+$/.test(generation)) {
      return null;
    }

    const toAdd = getMissingStandardGenerationModels(generation, models, nextSortOrderStart);
    if (toAdd.length === 0) {
      return `iPhone ${generation} already has all standard variants.`;
    }

    return `Will add: ${toAdd.map((model) => model.name).join(", ")}`;
  }, [generationNumber, models, nextSortOrderStart]);

  const confirmCopy = useMemo(() => {
    if (!confirmAction) {
      return null;
    }

    const linkedCases = "model" in confirmAction ? (caseCounts[confirmAction.model.id] ?? 0) : 0;
    const casesNote =
      linkedCases > 0
        ? ` ${linkedCases} case design${linkedCases === 1 ? "" : "s"} use this model.`
        : "";

    if (confirmAction.type === "delete") {
      return {
        title: "Delete this model?",
        description: `"${confirmAction.model.name}" will be removed permanently.${casesNote} This cannot be undone.`,
        confirmLabel: "Delete model",
        destructive: true,
      };
    }

    if (confirmAction.type === "toggle-active") {
      const { model } = confirmAction;
      if (model.active) {
        return {
          title: "Mark model inactive?",
          description: `"${model.name}" will be hidden from shop filters and variant pickers.${casesNote}`,
          confirmLabel: "Mark inactive",
          destructive: false,
        };
      }

      return {
        title: "Mark model active?",
        description: `"${model.name}" will appear in shop filters and variant pickers again.`,
        confirmLabel: "Mark active",
        destructive: false,
      };
    }

    if (confirmAction.type === "add-generation") {
      return {
        title: `Add iPhone ${confirmAction.generation}?`,
        description: `This will add: ${confirmAction.models.map((model) => model.name).join(", ")}.`,
        confirmLabel: "Add generation",
        destructive: false,
      };
    }

    return {
      title: "Save model changes?",
      description: `Update "${confirmAction.model.name}" to "${confirmAction.nextName}"? The slug will update automatically.`,
      confirmLabel: "Save changes",
      destructive: false,
    };
  }, [caseCounts, confirmAction]);

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
          {isSeeding ? "Adding…" : "Add missing iPhone 11 → 17 models"}
        </Button>
        <Text variant="small" as="p" className="text-muted">
          Add a generation number to create Pro Max, Pro, and base models automatically.
        </Text>
      </div>

      <Card className="space-y-4">
        <Text variant="h2" as="h2" className="text-lg">
          Add iPhone generation
        </Text>
        <div className="space-y-2">
          <Label htmlFor="generation-number">Generation number</Label>
          <Input
            id="generation-number"
            inputMode="numeric"
            placeholder="18"
            value={generationNumber}
            onChange={(event) => setGenerationNumber(event.target.value.replace(/\D/g, ""))}
          />
          {generationPreview ? (
            <Text variant="small" as="p" className="text-muted">
              {generationPreview}
            </Text>
          ) : null}
        </div>
        <Button type="button" onClick={requestAddGeneration}>
          Add generation
        </Button>
      </Card>

      <Card className="space-y-4">
        <Text variant="h2" as="h2" className="text-lg">
          Add variant to existing generation
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="variant-generation">iPhone generation</Label>
            <select
              id="variant-generation"
              className={selectClassName}
              value={selectedGeneration}
              disabled={generationNumbers.length === 0}
              onChange={(event) => setSelectedGeneration(event.target.value)}
            >
              {generationNumbers.length === 0 ? (
                <option value="">No generations yet</option>
              ) : (
                generationNumbers.map((generation) => (
                  <option key={generation} value={generation}>
                    iPhone {generation}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant-type">Variant</Label>
            <select
              id="variant-type"
              className={selectClassName}
              value={selectedVariant}
              disabled={!selectedGeneration}
              onChange={(event) => setSelectedVariant(event.target.value)}
            >
              {availableVariants.map((suffix) => (
                <option key={suffix || "base"} value={suffix}>
                  {suffix ? `${selectedGeneration} ${suffix}` : selectedGeneration}
                </option>
              ))}
              <option value={CUSTOM_VARIANT_VALUE}>Custom variant…</option>
            </select>
          </div>
        </div>

        {selectedVariant === CUSTOM_VARIANT_VALUE ? (
          <div className="space-y-2">
            <Label htmlFor="custom-variant">Custom variant name</Label>
            <Input
              id="custom-variant"
              placeholder="Plus"
              value={customVariantSuffix}
              onChange={(event) => setCustomVariantSuffix(event.target.value)}
            />
            {selectedGeneration && customVariantSuffix.trim() ? (
              <Text variant="small" as="p" className="text-muted">
                Will add: {buildIphoneModelName(selectedGeneration, customVariantSuffix.trim())}
              </Text>
            ) : null}
          </div>
        ) : null}

        <Button
          type="button"
          disabled={!selectedGeneration}
          onClick={() => void handleAddVariant()}
        >
          Add variant
        </Button>
      </Card>

      <Card className="space-y-4">
        <Text variant="h2" as="h2" className="text-lg">
          Add custom model manually
        </Text>
        <Text variant="small" as="p" className="text-muted">
          For non-standard names only. Standard iPhone models should use the forms above.
        </Text>
        <div className="space-y-2">
          <Label htmlFor="manual-model-name">Full model name</Label>
          <Input
            id="manual-model-name"
            placeholder="iPhone SE (4th generation)"
            value={manualName}
            onChange={(event) => setManualName(event.target.value)}
          />
        </div>
        <Button type="button" onClick={() => void handleManualAdd()}>
          Add custom model
        </Button>
      </Card>

      <div className="space-y-2">
        {groups.length === 0 ? (
          <Card className="px-4 py-8 text-center">
            <Text variant="muted" as="p">
              No iPhone models yet.
            </Text>
          </Card>
        ) : (
          groups.map((group) => {
            const isExpanded = openGenerations.has(group.generation);
            const activeCount = group.models.filter((model) => model.active).length;

            return (
              <div
                key={group.generation}
                className="overflow-hidden rounded-xl border border-muted/20 bg-background"
              >
                <button
                  type="button"
                  onClick={() => toggleGeneration(group.generation)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-soft/60"
                  aria-expanded={isExpanded}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="font-serif text-base font-semibold text-foreground">
                      {group.label}
                    </span>
                    <span className="text-xs text-muted">
                      {group.models.length} variant{group.models.length === 1 ? "" : "s"}
                      {activeCount < group.models.length
                        ? ` · ${activeCount} active`
                        : null}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform duration-300",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-muted/15">
                      <div className="hidden gap-4 border-b border-muted/10 bg-soft/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_4rem_4rem_5.5rem_minmax(0,11rem)]">
                        <span>Variant</span>
                        <span>Slug</span>
                        <span>Cases</span>
                        <span>Order</span>
                        <span>Status</span>
                        <span>Actions</span>
                      </div>

                      <ul className="divide-y divide-muted/10">
                        {group.models.map((model) => {
                          const variantLabel = getPhoneModelVariantLabel(model, group.generation);
                          const isEditing = editingId === model.id;

                          return (
                            <li
                              key={model.id}
                              className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_4rem_4rem_5.5rem_minmax(0,11rem)] lg:items-center lg:gap-4"
                            >
                              <div>
                                {isEditing ? (
                                  <Input
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    aria-label={`Edit name for ${model.name}`}
                                  />
                                ) : (
                                  <>
                                    <p className="text-sm font-medium text-foreground">{variantLabel}</p>
                                    <p className="mt-0.5 text-xs text-muted lg:hidden">{model.name}</p>
                                  </>
                                )}
                              </div>

                              <p className="truncate font-mono text-xs text-muted">{model.slug}</p>

                              <p className="text-sm text-foreground lg:text-center">
                                {caseCounts[model.id] ?? 0}
                              </p>

                              <p className="text-sm text-muted lg:text-center">{model.sortOrder}</p>

                              <div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={model.active ? "secondary" : "ghost"}
                                  onClick={() => requestToggleActive(model)}
                                >
                                  {model.active ? "Active" : "Inactive"}
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {isEditing ? (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => requestSaveEdit(model)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={cancelEditing}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditing(model)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="text-danger hover:text-danger"
                                      onClick={() => requestDelete(model)}
                                    >
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error ? (
        <Text variant="small" as="p" className="text-danger">
          {error}
        </Text>
      ) : null}

      {confirmCopy ? (
        <ConfirmDialog
          open={Boolean(confirmAction)}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          destructive={confirmCopy.destructive}
          errorMessage={confirmError}
          isLoading={isConfirmLoading}
          onCancel={closeConfirm}
          onConfirm={() => {
            void handleConfirm();
          }}
        />
      ) : null}
    </div>
  );
}
