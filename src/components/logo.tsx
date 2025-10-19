import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function KhsayemTekstilLogo({
  className,
  fallbackText,
}: {
  className?: string;
  fallbackText?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 font-bold tracking-tighter text-primary font-headline w-full h-10",
        className
      )}
    >
       <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
