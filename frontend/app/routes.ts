import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "pages/dashboard.tsx"),
  route("/accounts", "pages/accounts.tsx"),
  route("/transactions", "pages/transactions.tsx"),
  route("/goals", "pages/goals.tsx")
] satisfies RouteConfig;
