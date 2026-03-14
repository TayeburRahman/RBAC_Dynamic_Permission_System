

"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../button";

const DashboardHeader = ({
  title,
  description,
  length,
  showBack,
  children,
}: {
  title: string;
  description: string;
  length?: number;
  showBack?: boolean;
  children?: React.ReactNode;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-start gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft />
            </Button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-semibold text-primary uppercase tracking-tight">
                {title}
              </h1>
              {length && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                  {length}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-150 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

export default DashboardHeader