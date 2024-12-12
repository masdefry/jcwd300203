'use client';
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ITanstackProviderProps } from "./types";

const queryClient = new QueryClient()

const ReactQueryProvider = ({children}: ITanstackProviderProps) => {

    return <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
    
}

export default ReactQueryProvider;