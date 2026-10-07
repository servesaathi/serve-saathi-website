import { apiSource } from "./api";
import { mockSource } from "./mock";
import { ADMIN_DATA_MODE, type AdminDataSource } from "./source";

/** The data source every admin screen uses — see source.ts for how to switch. */
export const adminSource: AdminDataSource = ADMIN_DATA_MODE === "mock" ? mockSource : apiSource;

export { ADMIN_DATA_MODE, USER_WRITE_UNSUPPORTED, type AdminDataSource } from "./source";
export * from "./types";
export { useAdminQuery } from "./useAdminQuery";
