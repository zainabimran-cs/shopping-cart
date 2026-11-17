"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ReduxProvider from "./redux/Provider";
import CartPersistence from "./redux/CartPersistence";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <ReduxProvider>
        <CartPersistence />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
