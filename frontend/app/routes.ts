import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("/dashboard", "pages/dashboard.tsx"),
  route("/accounts", "pages/accounts.tsx"),
  route("/transactions", "pages/transactions.tsx"),
  route("/goals", "pages/goals.tsx"),
  route("/budgets", "pages/budget.tsx")
] satisfies RouteConfig;
