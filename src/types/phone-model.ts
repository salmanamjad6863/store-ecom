export type PhoneModel = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

export type PhoneModelDocument = Omit<PhoneModel, "id">;
