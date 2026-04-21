import { applicationRouter } from "H_o_R/server/api/routers/application";
import { internshipRouter } from "H_o_R/server/api/routers/internship";
import { userRouter } from "H_o_R/server/api/routers/user";
import { categoryRouter } from "H_o_R/server/api/routers/category";
import { analyticsRouter } from "H_o_R/server/api/routers/analytics";
import { createCallerFactory, createTRPCRouter } from "H_o_R/server/api/trpc";

export const appRouter = createTRPCRouter({
	internship: internshipRouter,
	application: applicationRouter,
	user: userRouter,
	category: categoryRouter,
	analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
