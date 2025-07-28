import { Badge } from "@/components/ui/badge";
import { Check, Clock, Heart } from "lucide-react";

type PetStatus = "available" | "pending" | "adopted";

interface StatusBadgeProps {
    status: PetStatus;
    selected: boolean;
    onClick: () => void;
}

export function StatusBadge({ status, selected, onClick }: StatusBadgeProps) {
    const getStatusConfig = (status: PetStatus) => {
        switch (status) {
            case "available":
                return {
                    label: "Available",
                    icon: <Check className="h-4 w-4 mr-1" />,
                    baseClass: "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
                    selectedClass: "bg-green-600 text-white hover:bg-green-700 border-green-600",
                };
            case "pending":
                return {
                    label: "Pending",
                    icon: <Clock className="h-4 w-4 mr-1" />,
                    baseClass: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200",
                    selectedClass: "bg-amber-600 text-white hover:bg-amber-700 border-amber-600",
                };
            case "adopted":
                return {
                    label: "Adopted",
                    icon: <Heart className="h-4 w-4 mr-1" />,
                    baseClass: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
                    selectedClass: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick();
                }
            }}
            className="inline-block"
        >
            <Badge
                variant="outline"
                className={`flex items-center justify-center cursor-pointer py-2 px-3 border ${selected ? config.selectedClass : config.baseClass
                    } transition-colors`}
            >
                {config.icon}
                {config.label}
            </Badge>
        </div>
    );
}
