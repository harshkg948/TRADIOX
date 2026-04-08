import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface PriceAlertProps {
  isOpen: boolean;
  onClose: () => void;
  stock: any;
}

export const PriceAlert: React.FC<PriceAlertProps> = ({ isOpen, onClose, stock }) => {
  const [price, setPrice] = useState(stock?.price?.toString() || "");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const handleSave = () => {
    toast.success(`Alert set for ${stock?.symbol || "Stock"} when price goes ${condition} $${price}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Set Price Alert
          </DialogTitle>
          <DialogDescription>
            Get notified when {stock?.name} reaches your target price.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex gap-2">
            <Button
              variant={condition === "above" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setCondition("above")}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Above
            </Button>
            <Button
              variant={condition === "below" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setCondition("below")}
            >
              <TrendingDown className="w-4 h-4 mr-2" /> Below
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Target Price ($)</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="font-mono text-lg"
              placeholder="0.00"
            />
          </div>

          <div className="p-3 rounded bg-secondary/30 border border-border text-[10px] text-muted-foreground">
            Current Price: <span className="text-foreground font-mono">${(stock?.price || 0).toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Create Alert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
