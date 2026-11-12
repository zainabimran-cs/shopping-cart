"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ReduxProvider from "./redux/Provider";
import CartPersistence from "./redux/CartPersistence";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReduxProvider>
      <CartPersistence />
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
