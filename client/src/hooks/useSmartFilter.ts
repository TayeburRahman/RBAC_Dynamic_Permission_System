"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

export interface SmartFilterOptions {
  debounce?: number;
  resetPage?: boolean;
  scroll?: boolean;
  method?: "push" | "replace";
}

export interface SmartFilterConfig {
  paginationKey?: string;
  defaultDebounce?: number;
}

/**
 * A powerful hook for managing URL search parameters in Next.js App Router.
 * Supports debouncing, batch updates, toggling values, and pagination sync.
 */
export const useSmartFilter = <T extends string = string>(config: SmartFilterConfig = {}) => {
  const { paginationKey = "page", defaultDebounce = 0 } = config;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const updateFilter = useCallback(
    (key: T, value: string | number | null, options: SmartFilterOptions | number = {}) => {
      // Handle legacy debounceTime as 3rd argument
      const opt = typeof options === "number" ? { debounce: options } : options;
      const { 
        debounce = defaultDebounce, 
        resetPage = true, 
        scroll = false, 
        method = "push" 
      } = opt;

      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]);
      }

      const executeUpdate = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }

        if (resetPage && key !== paginationKey) {
          params.set(paginationKey, "1");
        }

        const url = `${pathname}?${params.toString()}`;
        if (method === "replace") {
          router.replace(url, { scroll });
        } else {
          router.push(url, { scroll });
        }
        
        delete timeoutRefs.current[key];
      };

      if (debounce > 0) {
        timeoutRefs.current[key] = setTimeout(executeUpdate, debounce);
      } else {
        executeUpdate();
      }
    },
    [searchParams, pathname, router, paginationKey, defaultDebounce]
  );

  const updateBatch = useCallback(
    (updates: Partial<Record<T, string | number | null>>, options: SmartFilterOptions | number = {}) => {
      const opt = typeof options === "number" ? { debounce: options } : options;
      const { 
        debounce = defaultDebounce, 
        resetPage = true, 
        scroll = false, 
        method = "push" 
      } = opt;

      const keys = Object.keys(updates) as T[];
      
      keys.forEach(key => {
        if (timeoutRefs.current[key]) {
          clearTimeout(timeoutRefs.current[key]);
        }
      });

      const executeUpdate = () => {
        const params = new URLSearchParams(searchParams.toString());
        let hasFilterChanged = false;

        Object.entries(updates).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            params.set(key, String(value));
          } else {
            params.delete(key);
          }

          if (key !== paginationKey) {
            hasFilterChanged = true;
          }
        });
        
        if (resetPage && hasFilterChanged) {
          params.set(paginationKey, "1");
        }

        const url = `${pathname}?${params.toString()}`;
        if (method === "replace") {
          router.replace(url, { scroll });
        } else {
          router.push(url, { scroll });
        }

        keys.forEach(key => delete timeoutRefs.current[key]);
      };

      if (debounce > 0) {
        const firstKey = keys[0];
        timeoutRefs.current[firstKey] = setTimeout(executeUpdate, debounce);
      } else {
        executeUpdate();
      }
    },
    [searchParams, pathname, router, paginationKey, defaultDebounce]
  );

  const toggleFilter = useCallback(
    (key: T, value: string, options?: SmartFilterOptions) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentVal = params.get(key);
      let newValues = currentVal ? currentVal.split(",") : [];

      if (newValues.includes(value)) {
        newValues = newValues.filter((v) => v !== value);
      } else {
        newValues.push(value);
      }
      
      const finalValue = newValues.length > 0 ? newValues.join(",") : null;
      updateFilter(key, finalValue, options); 
    },
    [searchParams, updateFilter]
  );

  const clearAll = useCallback((options: { exclude?: T[], scroll?: boolean, method?: "push" | "replace" } = {}) => {
    const { exclude = [], scroll = false, method = "push" } = options;
    const params = new URLSearchParams(searchParams.toString());
    
    Array.from(params.keys()).forEach((key) => {
      if (!exclude.includes(key as T)) {
        params.delete(key);
      }
    });

    const url = `${pathname}?${params.toString()}`;
    if (method === "replace") {
      router.replace(url, { scroll });
    } else {
      router.push(url, { scroll });
    }
  }, [searchParams, pathname, router]);

  const getFilter = useCallback((key: T) => {
    return searchParams.get(key) || "";
  }, [searchParams]);
  
  const getArrayFilter = useCallback((key: T) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  }, [searchParams]);
  
  const isSelected = useCallback((key: T, value: string) => {
    const val = searchParams.get(key);
    return val ? val.split(",").includes(value) : false;
  }, [searchParams]);

  const isFilterActive = useCallback((keys?: T[]) => {
    if (keys && keys.length > 0) {
      return keys.some((key) => searchParams.has(key));
    }

    const allKeys = Array.from(searchParams.keys());
    return allKeys.some((key) => key !== paginationKey);
  }, [searchParams, paginationKey]);

  const getActiveCount = useCallback((keys?: T[]) => {
    if (keys && keys.length > 0) {
      return keys.filter((key) => searchParams.has(key)).length;
    }

    const allKeys = Array.from(searchParams.keys());
    return allKeys.filter((key) => key !== paginationKey).length;
  }, [searchParams, paginationKey]);

  return { 
    updateFilter, 
    updateBatch, 
    toggleFilter, 
    clearAll,
    getFilter, 
    getArrayFilter, 
    isSelected,
    isFilterActive,
    getActiveCount
  };
};
