import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Heading1,
	Heading2,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Type,
	Plus,
	List,
	ListOrdered,
	Code,
	Upload,
	Loader2,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { uploadBlogContentImage } from "@/lib/api/storage";
import { isSupabaseConfigured } from "@/lib/config/supabase";
import { htmlToMarkdown } from "@/lib/utils/htmlToMarkdown";
import { cn } from "@/lib/utils";

const BlogTiptapEditor = ({
	content = "",
	onChange,
	blogId = null,
	placeholder = "Start writing your blog post... Type / for commands",
	className,
}) => {
	const [showSlashMenu, setShowSlashMenu] = useState(false);
	const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
	const [slashMenuItems, setSlashMenuItems] = useState([]);
	const [selectedItem, setSelectedItem] = useState(0);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const fileInputRef = useRef(null);
	const isInternalUpdateRef = useRef(false);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
				heading: {
					levels: [1, 2],
				},
				blockquote: false,
			}),
			Image,
			Link.configure({
				protocols: ["http", "https", "mailto"],
				openOnClick: false,
				HTMLAttributes: {
					class: "text-zinc-500 hover:text-zinc-700 underline",
				},
			}),
			Placeholder.configure({ placeholder }),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Underline,
			Highlight,
			TextStyle,
			Color,
			Typography,
			CharacterCount,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			Markdown.configure({
				html: true,
				transformPastedText: true,
				transformCopiedText: true,
			}),
		],
		content: content || "",
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"prose prose-zinc max-w-none p-6 h-full overflow-y-auto focus:outline-none outline-none focus-visible:outline-none blog-tiptap-editor",
			},
		},
		onUpdate: ({ editor: ed }) => {
			isInternalUpdateRef.current = true;
			if (!onChange) return;

			let markdown = "";
			try {
				if (ed.storage?.markdown) {
					markdown = ed.storage.markdown.getMarkdown() || "";
				}
			} catch {
				// fallback below
			}

			if (!markdown) {
				markdown = htmlToMarkdown(ed.getHTML()) || "";
			}

			onChange(markdown);
			requestAnimationFrame(() => {
				isInternalUpdateRef.current = false;
			});
		},
	});

	useEffect(() => {
		if (!editor || isInternalUpdateRef.current) return;
		const current =
			editor.storage?.markdown?.getMarkdown?.() || editor.getText() || "";
		if (content !== current) {
			editor.commands.setContent(content || "", false);
		}
	}, [content, editor]);

	const triggerImageUpload = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleImageUpload = useCallback(
		async (event) => {
			const file = event.target.files?.[0];
			if (!file) return;

			if (!file.type.startsWith("image/")) {
				toast.warning("Please select an image file");
				return;
			}

			setIsUploadingImage(true);
			try {
				let imageUrl;
				if (isSupabaseConfigured()) {
					imageUrl = await uploadBlogContentImage(file, blogId);
				} else {
					imageUrl = await new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = (e) => resolve(e.target.result);
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});
				}
				editor?.chain().focus().setImage({ src: imageUrl }).run();
			} catch (error) {
				console.error("Image upload failed:", error);
				toast.error("Failed to upload image");
			} finally {
				setIsUploadingImage(false);
				event.target.value = "";
			}
		},
		[editor, blogId]
	);

	const commands = useMemo(
		() => [
			{
				title: "Heading 1",
				description: "Large section heading",
				icon: <Heading1 className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
			},
			{
				title: "Heading 2",
				description: "Medium section heading",
				icon: <Heading2 className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			},
			{
				title: "Text",
				description: "Regular paragraph text",
				icon: <Type className="w-4 h-4" />,
				command: () => editor?.chain().focus().setParagraph().run(),
			},
			{
				title: "Bold",
				description: "Make text bold",
				icon: <Bold className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleBold().run(),
			},
			{
				title: "Italic",
				description: "Make text italic",
				icon: <Italic className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleItalic().run(),
			},
			{
				title: "Underline",
				description: "Underline text",
				icon: <UnderlineIcon className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleUnderline().run(),
			},
			{
				title: "Bullet List",
				description: "Create a bullet list",
				icon: <List className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleBulletList().run(),
			},
			{
				title: "Numbered List",
				description: "Create a numbered list",
				icon: <ListOrdered className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleOrderedList().run(),
			},
			{
				title: "Code Block",
				description: "Add a code block",
				icon: <Code className="w-4 h-4" />,
				command: () => editor?.chain().focus().toggleCodeBlock().run(),
			},
			{
				title: "Upload Image",
				description: "Upload an image from your computer",
				icon: <Upload className="w-4 h-4" />,
				command: triggerImageUpload,
			},
			{
				title: "Align Left",
				description: "Align text to the left",
				icon: <AlignLeft className="w-4 h-4" />,
				command: () => editor?.chain().focus().setTextAlign("left").run(),
			},
			{
				title: "Align Center",
				description: "Center align text",
				icon: <AlignCenter className="w-4 h-4" />,
				command: () => editor?.chain().focus().setTextAlign("center").run(),
			},
			{
				title: "Align Right",
				description: "Align text to the right",
				icon: <AlignRight className="w-4 h-4" />,
				command: () => editor?.chain().focus().setTextAlign("right").run(),
			},
		],
		[editor, triggerImageUpload]
	);

	const handleSlashCommand = useCallback(() => {
		if (!editor?.view) return;

		const { view } = editor;
		const { state } = view;
		const { selection } = state;
		const { $from } = selection;
		const textBefore = state.doc.textBetween($from.start(), $from.pos, false, "");

		if (textBefore.endsWith("/")) {
			const coords = view.coordsAtPos($from.pos);
			const editorRect = view.dom.getBoundingClientRect();
			setSlashMenuPosition({
				x: coords.left - editorRect.left,
				y: coords.bottom - editorRect.top + 10,
			});
			setSlashMenuItems(commands);
			setSelectedItem(0);
			setShowSlashMenu(true);
		} else {
			setShowSlashMenu(false);
		}
	}, [editor, commands]);

	const handleKeyDown = useCallback(
		(event) => {
			if (!showSlashMenu) return;

			if (event.key === "ArrowDown") {
				event.preventDefault();
				setSelectedItem((prev) => (prev + 1) % slashMenuItems.length);
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				setSelectedItem(
					(prev) => (prev - 1 + slashMenuItems.length) % slashMenuItems.length
				);
			} else if (event.key === "Enter") {
				event.preventDefault();
				slashMenuItems[selectedItem]?.command();
				setShowSlashMenu(false);
			} else if (event.key === "Escape") {
				setShowSlashMenu(false);
			}
		},
		[showSlashMenu, slashMenuItems, selectedItem]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		if (!editor) return;
		editor.on("update", handleSlashCommand);
		return () => editor.off("update", handleSlashCommand);
	}, [editor, handleSlashCommand]);

	if (!editor) {
		return (
			<div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
				Loading editor...
			</div>
		);
	}

	const toolbarBtn = (active, onClick, children, title) => (
		<motion.button
			type="button"
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			title={title}
			className={cn(
				"p-2 rounded-xl transition-colors",
				active
					? "bg-zinc-200 text-zinc-900"
					: "text-zinc-600 hover:bg-zinc-100"
			)}
		>
			{children}
		</motion.button>
	);

	return (
		<div className={cn("flex flex-col h-full", className)}>
			<div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
				<div className="border-b border-border bg-muted/40 px-6 py-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-foreground">Blog Editor</h2>
						<span className="text-sm text-muted-foreground">Type "/" for commands</span>
					</div>
				</div>

				<div className="border-b border-border bg-card px-6 py-3 overflow-x-auto">
					<div className="flex items-center gap-1 min-w-max">
						{toolbarBtn(
							editor.isActive("bold"),
							() => editor.chain().focus().toggleBold().run(),
							<Bold className="w-4 h-4" />,
							"Bold"
						)}
						{toolbarBtn(
							editor.isActive("italic"),
							() => editor.chain().focus().toggleItalic().run(),
							<Italic className="w-4 h-4" />,
							"Italic"
						)}
						{toolbarBtn(
							editor.isActive("underline"),
							() => editor.chain().focus().toggleUnderline().run(),
							<UnderlineIcon className="w-4 h-4" />,
							"Underline"
						)}
						<div className="w-px h-6 bg-border mx-1" />
						{toolbarBtn(
							editor.isActive("heading", { level: 1 }),
							() => editor.chain().focus().toggleHeading({ level: 1 }).run(),
							<Heading1 className="w-4 h-4" />,
							"Heading 1"
						)}
						{toolbarBtn(
							editor.isActive("heading", { level: 2 }),
							() => editor.chain().focus().toggleHeading({ level: 2 }).run(),
							<Heading2 className="w-4 h-4" />,
							"Heading 2"
						)}
						<div className="w-px h-6 bg-border mx-1" />
						{toolbarBtn(
							editor.isActive("bulletList"),
							() => editor.chain().focus().toggleBulletList().run(),
							<List className="w-4 h-4" />,
							"Bullet List"
						)}
						{toolbarBtn(
							editor.isActive("orderedList"),
							() => editor.chain().focus().toggleOrderedList().run(),
							<ListOrdered className="w-4 h-4" />,
							"Numbered List"
						)}
						{toolbarBtn(
							editor.isActive("codeBlock"),
							() => editor.chain().focus().toggleCodeBlock().run(),
							<Code className="w-4 h-4" />,
							"Code Block"
						)}
						<div className="w-px h-6 bg-border mx-1" />
						{toolbarBtn(
							editor.isActive({ textAlign: "left" }),
							() => editor.chain().focus().setTextAlign("left").run(),
							<AlignLeft className="w-4 h-4" />,
							"Align Left"
						)}
						{toolbarBtn(
							editor.isActive({ textAlign: "center" }),
							() => editor.chain().focus().setTextAlign("center").run(),
							<AlignCenter className="w-4 h-4" />,
							"Align Center"
						)}
						{toolbarBtn(
							editor.isActive({ textAlign: "right" }),
							() => editor.chain().focus().setTextAlign("right").run(),
							<AlignRight className="w-4 h-4" />,
							"Align Right"
						)}
						<div className="w-px h-6 bg-border mx-1" />
						<motion.button
							type="button"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={triggerImageUpload}
							disabled={isUploadingImage}
							className="p-2 rounded-xl transition-colors text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
							title="Upload Image"
						>
							{isUploadingImage ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Upload className="w-4 h-4" />
							)}
						</motion.button>
					</div>
				</div>

				<div className="relative flex-1 min-h-[500px]">
					<EditorContent editor={editor} className="h-full blog-tiptap-content" />

					<BubbleMenu
						editor={editor}
						tippyOptions={{ duration: 100 }}
						className="bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-1"
					>
						{toolbarBtn(
							editor.isActive("bold"),
							() => editor.chain().focus().toggleBold().run(),
							<Bold className="w-4 h-4" />,
							"Bold"
						)}
						{toolbarBtn(
							editor.isActive("italic"),
							() => editor.chain().focus().toggleItalic().run(),
							<Italic className="w-4 h-4" />,
							"Italic"
						)}
						{toolbarBtn(
							editor.isActive("underline"),
							() => editor.chain().focus().toggleUnderline().run(),
							<UnderlineIcon className="w-4 h-4" />,
							"Underline"
						)}
						<div className="w-px h-6 bg-border mx-1" />
						{toolbarBtn(
							editor.isActive("heading", { level: 1 }),
							() => editor.chain().focus().toggleHeading({ level: 1 }).run(),
							<Heading1 className="w-4 h-4" />,
							"H1"
						)}
						{toolbarBtn(
							editor.isActive("heading", { level: 2 }),
							() => editor.chain().focus().toggleHeading({ level: 2 }).run(),
							<Heading2 className="w-4 h-4" />,
							"H2"
						)}
					</BubbleMenu>

					<AnimatePresence>
						{showSlashMenu && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: -10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -10 }}
								transition={{ duration: 0.15 }}
								style={{
									position: "absolute",
									left: slashMenuPosition.x,
									top: slashMenuPosition.y,
									zIndex: 50,
								}}
								className="bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[280px]"
							>
								<div className="p-2">
									<div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b border-border">
										Commands
									</div>
									<div className="max-h-64 overflow-y-auto">
										{slashMenuItems.map((item, index) => (
											<button
												key={item.title}
												type="button"
												onClick={() => {
													item.command();
													setShowSlashMenu(false);
												}}
												className={cn(
													"w-full flex items-center rounded-xl my-1 gap-3 px-3 py-2 text-left transition-colors",
													index === selectedItem
														? "bg-muted"
														: "hover:bg-muted/60"
												)}
											>
												<div className="shrink-0 w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
													{item.icon}
												</div>
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium truncate">
														{item.title}
													</div>
													<div className="text-xs text-muted-foreground truncate">
														{item.description}
													</div>
												</div>
												<Plus className="w-4 h-4 text-muted-foreground shrink-0" />
											</button>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="border-t border-border bg-muted/40 px-6 py-3">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div className="flex items-center gap-4">
							<span>
								Characters: {editor.storage.characterCount?.characters() || 0}
							</span>
							<span>Words: {editor.storage.characterCount?.words() || 0}</span>
						</div>
						<span className="text-xs bg-muted px-2 py-1 rounded-xl">TipTap</span>
					</div>
				</div>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleImageUpload}
				className="hidden"
			/>

			<style jsx global>{`
				.blog-tiptap-content .ProseMirror {
					outline: none !important;
					min-height: 500px;
				}
				.blog-tiptap-content .ProseMirror:focus {
					outline: none !important;
				}
				.blog-tiptap-content .ProseMirror p {
					margin: 0;
					line-height: 2em;
				}
				.blog-tiptap-content .ProseMirror h1 {
					font-size: 1.5em !important;
					font-weight: 700 !important;
					padding: 0.5em 0;
				}
				.blog-tiptap-content .ProseMirror h2 {
					font-size: 1.2em !important;
					font-weight: 600 !important;
					padding: 0.5em 0;
				}
				.blog-tiptap-content .ProseMirror ul,
				.blog-tiptap-content .ProseMirror ol {
					padding: 0 1em !important;
					margin: 1em 0 !important;
				}
				.blog-tiptap-content .ProseMirror ul {
					list-style-type: disc !important;
				}
				.blog-tiptap-content .ProseMirror ol {
					list-style-type: decimal !important;
				}
				.blog-tiptap-content .ProseMirror li {
					margin: 0.5em 0 !important;
					line-height: 2em !important;
				}
				.blog-tiptap-content .ProseMirror img {
					width: 100% !important;
					height: auto !important;
					border-radius: 8px !important;
					margin: 1em 0 !important;
				}
				.blog-tiptap-content .ProseMirror code {
					background: hsl(var(--muted)) !important;
					padding: 0.2em 0.4em !important;
					border-radius: 3px !important;
					font-family: monospace !important;
				}
				.blog-tiptap-content .ProseMirror pre {
					background: hsl(var(--muted)) !important;
					padding: 1em !important;
					border-radius: 4px !important;
					margin: 1em 0 !important;
					overflow-x: auto !important;
				}
				.blog-tiptap-content .ProseMirror a {
					color: hsl(var(--primary)) !important;
					text-decoration: underline !important;
				}
				.blog-tiptap-content .ProseMirror ul[data-type="taskList"] {
					list-style: none !important;
					padding: 0 !important;
				}
				.blog-tiptap-content .ProseMirror li[data-type="taskItem"] {
					display: flex !important;
					align-items: center !important;
				}
			`}</style>
		</div>
	);
};

export default BlogTiptapEditor;
