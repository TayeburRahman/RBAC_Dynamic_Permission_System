"use client";

import React, { useState } from "react";
import { ModalWrapper } from "@/components/ui/custom/modal-wrapper";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { QuoteFormValues } from "@/schemas/quote.schema";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuotePreviewModalProps {
  data: QuoteFormValues;
  lead: {
    name: string;
    email: string;
    eventDate: string;
    location: string;
  };
}

export function QuotePreviewModal({ data, lead }: QuotePreviewModalProps) {
  const [open, setOpen] = useState(false);
  
  const subtotal = (data.items || []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const taxRate = 0.0875;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title="WePlan Photography"
      description="Professional Wedding Photography Services"
      actionTrigger={
        <Button type="button" variant="outline" className="w-full gap-2">
          <Eye  />
          Preview Quote
        </Button>
      }
    >
      <ScrollArea className="max-h-[80vh]">
        <div className="p-6 md:p-8 text-foreground/90 font-sans">
          {/* Info Section */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-foreground/70">Quote For:</h4>
              <div className="space-y-0.5">
                <p className="font-semibold text-lg">{lead.name}</p>
                <p className="text-muted-foreground text-sm">{lead.email}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <h4 className="text-base font-semibold text-foreground/70">Event Details:</h4>
              <div className="space-y-0.5 text-sm font-medium">
                <p>Wedding — {lead.eventDate}</p>
                <p className="text-muted-foreground">{lead.location}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-primary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-7">Service</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div>
              {(data.items || []).map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 py-4 items-start">
                  <div className="col-span-7">
                    <p className="font-semibold text-base mb-0.5">{item.name || "Untitled Service"}</p>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-normal">{item.description || "No description provided."}</p>
                  </div>
                  <div className="col-span-1 text-center font-medium text-muted-foreground">{item.quantity || 0}</div>
                  <div className="col-span-2 text-right font-medium text-muted-foreground">PKR {((item.unitPrice || 0)).toLocaleString()}</div>
                  <div className="col-span-2 text-right font-semibold">PKR {(((item.quantity || 0) * (item.unitPrice || 0))).toLocaleString()}</div>
                </div>
              ))}

              <Separator className="w-64 bg-primary/40" />
              
              {/* Padding row as in screenshot */}
              <div className="grid grid-cols-12 gap-4 py-3">
                 <div className="col-span-8"></div>
                 <div className="col-span-2 text-right font-medium text-muted-foreground">PKR 0</div>
                 <div className="col-span-2 text-right font-semibold">PKR 0</div>
              </div>
            </div>
          </div>

          {/* Calculations */}
          <div className="flex flex-col items-end gap-3 mb-8">
            <div className="flex justify-between w-64 text-sm">
              <span className="text-muted-foreground font-semibold">Subtotal:</span>
              <span className="font-semibold">PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-64 text-sm">
              <span className="text-muted-foreground font-semibold">Tax (8.75%):</span>
              <span className="font-semibold">PKR {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <Separator className="w-64 bg-primary/40" />
            <div className="flex justify-between w-64 items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-semibold text-primary">PKR {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Terms */}
          <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border/50">
            <h4 className="text-base font-semibold mb-3">Terms & Conditions:</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal whitespace-pre-wrap">
              {data.terms || "Payment terms: 50% deposit required to secure booking. Balance due on the event date. Cancellation policy: Deposit is non-refundable if cancelled within 30 days of the event. All files will be delivered within 4-6 weeks after the event date."}
            </p>
          </div>

          {/* Validity */}
          <div className="bg-primary/5 rounded-lg py-3 px-6 text-center border border-primary/10">
            <p className="text-sm font-semibold text-primary">
              This quote is valid until {data.validUntil || "December 12, 2026"}
            </p>
          </div>
        </div>
      </ScrollArea>
    </ModalWrapper>
  );
}
