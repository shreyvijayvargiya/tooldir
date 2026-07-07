import React from "react";

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
	return (
		<>
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<tr
					key={rowIndex}
					className="border-b animate-pulse"
				>
					{Array.from({ length: columns }).map((_, colIndex) => (
						<td key={colIndex} className="py-3 px-4">
							<div className="h-4 bg-muted rounded w-3/4"></div>
						</td>
					))}
				</tr>
			))}
		</>
	);
};

export default TableSkeleton;
