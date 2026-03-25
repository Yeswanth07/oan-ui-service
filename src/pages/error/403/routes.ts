import { createFileRoute } from "@tanstack/react-router";
import Forbidden from ".";

export const Route = createFileRoute("/403")({
  component: Forbidden,
});

