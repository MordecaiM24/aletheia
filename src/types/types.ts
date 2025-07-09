export type SidebarUser = {
  username: string;
  email: string;
  orgRole: string | null | undefined;
  orgName: string;
  imageUrl: string;
  orgImageUrl: string;
};

export type RecentSearch = {
  query: string;
  timestamp: string;
  results: number;
};

export type RecentChat = {
  title: string;
  timestamp: string;
  messages: number;
};

export type RecentDoc = {
  title: string;
  type: string;
  accessed: string;
};

export type PinnedItem = {
  title: string;
  icon: React.ReactNode;
};

export type Notification = {
  title: string;
  description: string;
  time: string;
};

export type UsageStat = {
  label: string;
  value: string;
  change: string;
};
