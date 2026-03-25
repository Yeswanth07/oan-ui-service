import { createFileRoute } from "@tanstack/react-router";
import ServerDown from ".";

export const Route = createFileRoute("/500")({
  component: ServerDown,
});

