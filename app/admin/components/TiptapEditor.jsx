import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import { motion } from "framer-motion";
import {
	Bold,
	Italic,
	Heading1,
	Heading2,
	List,
	ListOrdered,
	Upload,
	Eye,
} from "lucide-react";
import { toast } from "react-toastify";

// Helper function to check if content is HTML and normalize it
const normalizeContent = (content) => {
	if (!content || typeof content !== "string") return "";
	
	// Check if it's HTML (contains HTML tags)
	const isHTML = content.includes("<") && content.includes(">") && content.match(/<\/?[a-z][\s\S]*>/i);
	
	if (isHTML) {
		// If it's HTML, let Tiptap parse it (it handles HTML natively)
		// But we'll extract text for comparison
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = content;
		const text = (tempDiv.textContent || tempDiv.innerText || "").trim();
		return { content, text, isHTML: true };
	}
	
	// Plain text - wrap in paragraph for Tiptap
	return { content: `<p>${content}</p>`, text: content.trim(), isHTML: false };
};

const TiptapEditor = ({
	placeholder = "Start writing...",
	content = "",
	onChange,
	onImageUpload,
	showPreview,
	onPreview,
}) => {
	const fileInputRef = useRef(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2],
				},
			}),
			Image,
			Link.configure({
				protocols: ["http", "https", "mailto"],
			}),
			Placeholder.configure({
				placeholder: placeholder,
			}),
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
				html: false,
			}),
		],
		content: content || "",
		editorProps: {
			attributes: {
				class:
					"prose prose-zinc prose-sm max-w-none p-4 h-full overflow-y-auto focus:outline-none outline-none focus-visible:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			if (onChange) {
				// Simple: get text content directly
				onChange(editor.getText());
			}
		},
	});

	// Update content when prop changes
	React.useEffect(() => {
		if (!editor) return;
		
		// Get current text content for comparison
		const currentText = (editor.getText() || "").trim();
		
		// Normalize incoming content (handle both HTML and plain text)
		const normalized = normalizeContent(content);
		
		// Only update if content is different
		if (currentText === normalized.text && content) return;

		// Set content - Tiptap will parse HTML or plain text
		if (normalized.content) {
			editor.commands.setContent(normalized.content, false);
		} else {
			editor.commands.clearContent(false);
		}
	}, [content, editor]);

	const handleImageUpload = useCallback(
		(event) => {
			const file = event.target.files[0];
			if (file) {
				if (!file.type.startsWith("image/")) {
					toast.warning("Please select an image file");
					return;
				}
				const reader = new FileReader();
				reader.onload = (e) => {
					const imageUrl = e.target.result;
					editor?.chain().focus().setImage({ src: imageUrl }).run();
					if (onImageUpload) {
						onImageUpload(imageUrl);
					}
				};
				reader.readAsDataURL(file);
			}
			event.target.value = "";
		},
		[editor, onImageUpload]
	);

	if (!editor) {
		return null;
	}

	return (
		<div className="border border-zinc-300 rounded-xl overflow-hidden flex flex-col h-full">
			{/* Editor Toolbar */}
			<div className="border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 flex items-center gap-1 sticky top-0 z-10 flex-shrink-0">
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={`p-1.5 rounded-xl ${
						editor.isActive("bold")
							? "bg-zinc-200 text-zinc-900"
							: "text-zinc-600 hover:bg-zinc-100"
					}`}
					title="Bold"
				>
					<Bold className="w-3.5 h-3.5" />
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={`p-1.5 rounded-xl ${
						editor.isActive("italic")
							? "bg-zinc-200 text-zinc-900"
							: "text-zinc-600 hover:bg-zinc-100"
					}`}
					title="Italic"
				>
					<Italic className="w-3.5 h-3.5" />
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={`p-1.5 rounded-xl ${
						editor.isActive("heading", { level: 1 })
							? "bg-zinc-200 text-zinc-900"
							: "text-zinc-600 hover:bg-zinc-100"
					}`}
					title="Heading 1"
				>
					<Heading1 className="w-3.5 h-3.5" />
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={`p-1.5 rounded-xl ${
						editor.isActive("heading", { level: 2 })
							? "bg-zinc-200 text-zinc-900"
							: "text-zinc-600 hover:bg-zinc-100"
					}`}
					title="Heading 2"
				>
					<Heading2 className="w-3.5 h-3.5" />
				</motion.button>
				<div className="w-px h-5 bg-zinc-200 mx-1" />
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={`p-1.5 rounded-xl ${
						editor.isActive("bulletList")
							? "bg-zinc-200 text-zinc-900"
							: "text-zinc-600 hover:bg-zinc-100"
					}`}
					title="Bullet List"
				>
					<List className="w-3.5 h-3.5" />
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={`p-1.5 rounded-xl ${
						editor.isActive("orderedList")
							? "bg-zinc-200 text-zinc-900"
							: "text-zinc-600 hover:bg-zinc-100"
					}`}
					title="Ordered List"
				>
					<ListOrdered className="w-3.5 h-3.5" />
				</motion.button>
				{showPreview && (
					<>
						<div className="w-px h-5 bg-zinc-200 mx-1" />
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={onPreview}
							className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100"
							title="Preview"
						>
							<Eye className="w-3.5 h-3.5" />
						</motion.button>
					</>
				)}
				<div className="w-px h-5 bg-zinc-200 mx-1" />
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => fileInputRef.current?.click()}
					className="p-1.5 rounded-xl text-zinc-600 hover:bg-zinc-100"
					title="Upload Image"
				>
					<Upload className="w-3.5 h-3.5" />
				</motion.button>
			</div>
			<div className="flex-1 overflow-y-auto" style={{ minHeight: "100%" }}>
				<EditorContent editor={editor} />
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleImageUpload}
				style={{ display: "none" }}
			/>
		</div>
	);
};

export default TiptapEditor;
