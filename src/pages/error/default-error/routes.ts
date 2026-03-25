import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import DefaultError from ".";
import AuthError from "./auth-error";

export const Route = createFileRoute("/error")({
  component: () => {
    const searchParams = new URLSearchParams(window.location.search);
    const reason = searchParams.get('reason');
    
    if (reason === 'auth') {
      return React.createElement(AuthError);
    }
    
    return React.createElement(DefaultError);
  },
});
