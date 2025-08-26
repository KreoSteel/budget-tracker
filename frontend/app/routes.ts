import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "pages/dashboard.tsx"),
  route("/accounts", "pages/accounts.tsx"),
] satisfies RouteConfig;
