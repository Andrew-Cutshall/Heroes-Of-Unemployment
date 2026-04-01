import { applicationRouter } from "H_o_R/server/api/routers/application";
import { authRouter } from "H_o_R/server/api/routers/auth";
import { internshipRouter } from "H_o_R/server/api/routers/internship";
import { createCallerFactory, createTRPCRouter } from "H_o_R/server/api/trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	internship: internshipRouter,
	application: applicationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
