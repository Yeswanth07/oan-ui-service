import { createFileRoute } from "@tanstack/react-router";
import PageNotFound from ".";

export const Route = createFileRoute("/404")({
  component: PageNotFound,
});

