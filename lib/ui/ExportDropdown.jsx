import React, { useState } from "react";
import { Download, FileText, FileJson, FileSpreadsheet, File } from "lucide-react";
import { exportData } from "../api/export";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ExportDropdown = ({ dataType, data, className = "" }) => {
	const [isExporting, setIsExporting] = useState(false);

	const exportOptions = [
		{
			value: "csv",
			label: "Export as CSV",
			icon: FileText,
			color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
		},
		{
			value: "json",
			label: "Export as JSON",
			icon: FileJson,
			color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
		},
		{
			value: "pdf",
			label: "Export as PDF",
			icon: File,
			color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
		},
		{
			value: "excel",
			label: "Export as Excel",
			icon: FileSpreadsheet,
			color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
		},
	];

	const handleExport = async (format) => {
		if (!data || data.length === 0) {
			toast.error("No data to export");
			return;
		}

		setIsExporting(true);
		try {
			await exportData(format, dataType, data, {
				filename: `${dataType}-export`,
			});
			toast.success(`Exported ${data.length} items as ${format.toUpperCase()}`);
		} catch (error) {
			console.error("Export error:", error);
			toast.error(error.message || "Failed to export data");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					disabled={isExporting || !data || data.length === 0}
					className={`text-xs ${className}`}
				>
					<Download className="w-3.5 h-3.5" />
					{isExporting ? "Exporting..." : "Export"}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[160px]">
				{exportOptions.map((option) => {
					const Icon = option.icon;
					return (
						<DropdownMenuItem
							key={option.value}
							disabled={isExporting}
							onClick={() => handleExport(option.value)}
							className="text-xs"
						>
							<div className={`p-1 rounded ${option.color}`}>
								<Icon className="w-3 h-3" />
							</div>
							<span>{option.label}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ExportDropdown;
