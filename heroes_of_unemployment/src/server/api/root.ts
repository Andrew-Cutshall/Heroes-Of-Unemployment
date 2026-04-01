import { internshipRouter } from "H_o_R/server/api/routers/internship";
import { applicationRouter } from "H_o_R/server/api/routers/application";
import { userRouter } from "H_o_R/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "H_o_R/server/api/trpc";

export const appRouter = createTRPCRouter({
	internship: internshipRouter,
	application: applicationRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
