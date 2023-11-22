export type Notification =
  | {
      type: "newMatchs";
      count: number;
    }
  | { type: "newMatch" };
