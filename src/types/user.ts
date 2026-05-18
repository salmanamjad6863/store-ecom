export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  createdAt: Date;
};

export type UserProfileDocument = Omit<UserProfile, "uid" | "createdAt"> & {
  createdAt: unknown;
};
