import { internshipRouter } from "H_o_R/server/api/routers/internship";
import { applicationRouter } from "H_o_R/server/api/routers/application";
import { createCallerFactory, createTRPCRouter } from "H_o_R/server/api/trpc";

export const appRouter = createTRPCRouter({
	internship: internshipRouter,
	application: applicationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
