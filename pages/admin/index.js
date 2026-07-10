import dynamic from "next/dynamic";

const Admin = dynamic(() => import("../../app/admin"), {
	ssr: false,
	loading: () => (
		<div className="h-screen w-screen bg-muted flex items-center justify-center text-sm text-muted-foreground">
			Loading admin…
		</div>
	),
});

export default Admin;
