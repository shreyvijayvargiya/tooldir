import React from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

/**
 * Client-only chart (imported with next/dynamic ssr:false).
 * ResponsiveContainer reads layout on mount and breaks SSR hydration.
 */
export default function AnalyticsAreaChart({ data }) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data}>
				<defs>
					<linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
						<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray="3 3"
					vertical={false}
					stroke="#e5e7eb"
				/>
				<XAxis
					dataKey="date"
					axisLine={false}
					tickLine={false}
					tick={{ fill: "#6b7280", fontSize: 12 }}
					dy={10}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fill: "#6b7280", fontSize: 12 }}
				/>
				<Tooltip
					contentStyle={{
						borderRadius: "8px",
						border: "1px solid #e5e7eb",
						boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
					}}
				/>
				<Area
					type="monotone"
					dataKey="visitors"
					stroke="#3b82f6"
					strokeWidth={2}
					fillOpacity={1}
					fill="url(#colorVisitors)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
