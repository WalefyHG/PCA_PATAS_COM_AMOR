import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface PetFormFieldProps {
    label: string;
    children: ReactNode;
    required?: boolean;
    className?: string;
}

export function PetFormField({ label, children, required = false, className = "" }: PetFormFieldProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center gap-1">
                <Label className="font-medium">{label}</Label>
                {required && <span className="text-red-500">*</span>}
            </div>
            {children}
        </div>
    );
}