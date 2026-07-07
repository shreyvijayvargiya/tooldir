import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const ConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	title = "Confirm Action",
	message = "Are you sure you want to proceed?",
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "danger",
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div
							className={
								variant === "danger"
									? "p-2 rounded-full bg-destructive/10 text-destructive"
									: variant === "warning"
										? "p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
										: "p-2 rounded-full bg-muted text-muted-foreground"
							}
						>
							<AlertTriangle className="w-5 h-5" />
						</div>
						<DialogTitle>{title}</DialogTitle>
					</div>
					<DialogDescription className="pt-2">{message}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={onClose}>
						{cancelText}
					</Button>
					<Button
						variant={variant === "danger" ? "destructive" : "default"}
						onClick={() => {
							onConfirm();
							onClose();
						}}
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
