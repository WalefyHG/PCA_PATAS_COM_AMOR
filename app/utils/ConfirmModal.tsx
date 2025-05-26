import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useThemeContext } from "../utils/ThemeContext";

type ConfirmModalProps = {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmModal({
    visible,
    message,
    onConfirm,
    onCancel
}: ConfirmModalProps) {
    const { isDarkTheme, colors } = useThemeContext();

    return (
        <AlertDialog open={visible} onOpenChange={onCancel}>
            <AlertDialogContent
                className="sm:max-w-[425px] border shadow-lg"
                style={{
                    backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
                    borderColor: isDarkTheme ? '#374151' : '#e5e7eb'
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle
                        className="text-lg font-semibold"
                        style={{
                            color: isDarkTheme ? '#ffffff' : '#111827'
                        }}
                    >
                        Confirmar ação
                    </AlertDialogTitle>
                    <AlertDialogDescription
                        className="text-sm"
                        style={{
                            color: isDarkTheme ? '#d1d5db' : '#6b7280'
                        }}
                    >
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="mt-2 sm:mt-0 border transition-colors"
                        style={{
                            backgroundColor: isDarkTheme ? '#374151' : '#f3f4f6',
                            color: isDarkTheme ? '#ffffff' : '#374151',
                            borderColor: isDarkTheme ? '#4b5563' : '#d1d5db'
                        }}
                    >
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="shadow-sm transition-colors"
                        style={{
                            backgroundColor: colors.primary || (isDarkTheme ? '#dc2626' : '#ef4444'),
                            color: '#ffffff'
                        }}
                    >
                        Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}