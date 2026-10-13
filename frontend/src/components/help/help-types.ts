export type HelpMessageView = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorRole: "MENTOR" | "MENTEE" | "ADMIN";
};

export type HelpThreadView = {
  id: string;
  status: "OPEN" | "RESOLVED";
  messages: HelpMessageView[];
};
