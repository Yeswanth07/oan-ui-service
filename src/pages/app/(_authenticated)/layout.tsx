import DefaultLayout from "@/layouts/default-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticate/_app-layout")({
  component: DefaultLayout,
});
