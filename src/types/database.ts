import { auth, currentMatch, user } from "../core/database/schema";

export type UserTable = typeof user.$inferSelect;
export type AuthTable = typeof auth.$inferSelect;
export type CurrentMatchTable = typeof currentMatch.$inferSelect;