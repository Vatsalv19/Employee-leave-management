import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Settings,
    Edit2,
    Plus,
    GripVertical,
    Package,
    AlertCircle,
    CheckCircle2,
    X,
    Tag,
    Layers,
    ChevronRight,
    ChevronDown,
    Clock,
    Archive,
    Lightbulb,
    FileText,
    Save,
    Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCategories } from "../../hooks/useCategories"
import CategoryForm from "../../components/categories/CategoryForm"
import FieldAssignmentSidebar from "../../components/categories/FieldAssignmentSidebar"
import { assignFields, updateCategoryLayout } from "../../api/categoriesApi"
import type {
    CategoryDetail,
    CategoryFormData,
    CategoryFieldSummary,
    ResolvedLayoutSection,
    ResolvedLayoutField,
    DisplaySectionSchema,
} from "../../types/categories/categoryTypes"

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = "overview" | "fields" | "products" | "channel-mappings" | "layout" | "settings" | "audit-log"

interface Toast {
    id: number
    type: "success" | "error"
    message: string
}

// ── Field type badge config — mirrors fieldTypeBadge.tsx exactly ─────────────

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
    text: { label: "Text", className: "bg-blue-100 text-blue-700" },
    textarea: { label: "Textarea", className: "bg-blue-100 text-blue-700" },
    number: { label: "Number", className: "bg-purple-100 text-purple-700" },
    currency: { label: "Currency", className: "bg-emerald-100 text-emerald-700" },
    boolean: { label: "Boolean", className: "bg-teal-100 text-teal-700" },
    date: { label: "Date", className: "bg-orange-100 text-orange-700" },
    select: { label: "Dropdown", className: "bg-green-100 text-green-700" },
    multiselect: { label: "Multi-select", className: "bg-green-100 text-green-700" },
    rich_text: { label: "Rich Text", className: "bg-pink-100 text-pink-700" },
    richtext: { label: "Rich Text", className: "bg-pink-100 text-pink-700" },
    url: { label: "URL", className: "bg-indigo-100 text-indigo-700" },
    email: { label: "Email", className: "bg-cyan-100 text-cyan-700" },
    phone: { label: "Phone", className: "bg-violet-100 text-violet-700" },
    json: { label: "JSON", className: "bg-gray-100 text-gray-600" },
    media: { label: "Media", className: "bg-rose-100 text-rose-700" },
}

function FieldTypeBadge({ type }: { type: string }) {
    const cfg = TYPE_CONFIG[type] || { label: type, className: "bg-accent text-accent-foreground" }
    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${cfg.className}`}>
            {cfg.label}
        </span>
    )
}

// ── Toast container ───────────────────────────────────────────────────────────

function ToastContainer({
    toasts,
    onDismiss,
}: {
    toasts: Toast[]
    onDismiss: (id: number) => void
}) {
    return (
        <div className="fixed bottom-6 right-6 z-60 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${toast.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm flex-1">{toast.message}</p>
                    <button
                        onClick={() => onDismiss(toast.id)}
                        className="shrink-0 rounded p-0.5 hover:bg-black/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background animate-pulse">
            {/* Breadcrumb bar */}
            <div className="h-10 border-b border-border bg-muted/30" />

            {/* Header */}
            <div className="shrink-0 border-b border-border bg-card px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-muted" />
                    <div className="h-12 w-12 rounded-xl bg-muted" />
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-7 w-48 rounded bg-muted" />
                            <div className="h-5 w-20 rounded bg-muted" />
                            <div className="h-5 w-14 rounded-full bg-muted" />
                        </div>
                        <div className="h-4 w-72 rounded bg-muted" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="h-12 border-b border-border bg-card px-6 flex items-center gap-8">
                {[80, 60, 120, 64, 72].map((w, i) => (
                    <div key={i} className="h-4 rounded bg-muted" style={{ width: `${w}px` }} />
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-5xl space-y-5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/20">
                            <div className="h-5 w-40 rounded bg-muted" />
                        </div>
                        <div className="divide-y divide-border/50">
                            {Array.from({ length: i === 1 ? 5 : i === 2 ? 4 : 3 }).map((_, j) => (
                                <div key={j} className="flex items-center gap-4 px-6 py-4">
                                    <div className="h-4 w-4 rounded bg-muted" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-28 rounded bg-muted" />
                                            <div className="h-3 w-20 rounded bg-muted" />
                                        </div>
                                        <div className="h-3 w-56 rounded bg-muted" />
                                    </div>
                                    <div className="h-6 w-16 rounded-full bg-muted" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Placeholder for unimplemented tabs ────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-muted/60 p-4 mb-4">
                <Layers className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">{label}</h3>
            <p className="text-sm text-muted-foreground max-w-xs text-center">
                This section will be available once the API is connected.
            </p>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CategoryDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { getCategoryDetail, allCategories, updateCategory } = useCategories()

    const [category, setCategory] = useState<CategoryDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabId>("overview")

    // Edit drawer
    const [showEditForm, setShowEditForm] = useState(false)
    const [isDrawerAnimating, setIsDrawerAnimating] = useState(false)

    // Field assignment sidebar
    const [showFieldSidebar, setShowFieldSidebar] = useState(false)
    const [isFieldSidebarAnimating, setIsFieldSidebarAnimating] = useState(false)
    const [suggestedFieldIds, setSuggestedFieldIds] = useState<string[]>([])
    const [showSuggestedFieldsDialog, setShowSuggestedFieldsDialog] = useState(false)
    const [isDialogAnimating, setIsDialogAnimating] = useState(false)

    // Layout editing state
    const [editingLayout, setEditingLayout] = useState<ResolvedLayoutSection[] | null>(null)
    const [layoutDirty, setLayoutDirty] = useState(false)
    const [savingLayout, setSavingLayout] = useState(false)
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
    const [editingSectionTitle, setEditingSectionTitle] = useState("")
    const [editingSectionDescription, setEditingSectionDescription] = useState("")
    const [editingSectionCollapsible, setEditingSectionCollapsible] = useState(true)
    const [addingSectionInLayout, setAddingSectionInLayout] = useState(false)
    const [newLayoutSectionName, setNewLayoutSectionName] = useState("")
    const [newLayoutSectionDesc, setNewLayoutSectionDesc] = useState("")
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
    const [editingFieldSectionId, setEditingFieldSectionId] = useState<string | null>(null)
    const [editFieldLabel, setEditFieldLabel] = useState("")
    const [editFieldColSpan, setEditFieldColSpan] = useState<number>(1)
    const [editFieldReadOnly, setEditFieldReadOnly] = useState(false)
    const sectionInputRef = useRef<HTMLInputElement>(null)
    // Drag-and-drop state for moving fields between layout sections
    const dragState = useRef<{ fieldId: string; fromSectionId: string } | null>(null)
    const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)

    // Collapsible sections state (tracks which resolvedLayout sections are collapsed)
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

    // Toasts
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((type: "success" | "error", message: string) => {
        const toastId = Date.now()
        setToasts((prev) => [...prev, { id: toastId, type, message }])
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 4000)
    }, [])

    // ── Layout Editing ───────────────────────────────────────────

    // Get the working copy of layout (editingLayout if in edit mode, else from category)
    const workingLayout = useMemo(() => {
        if (editingLayout) return editingLayout
        if (!category?.resolvedLayout) return []

        // Build set of valid field IDs
        const validFieldIds = new Set([
            ...category.ownFields.map((f) => f.id),
            ...category.inheritedFields.map((f) => f.id),
        ])

        // Clean the layout - filter out any fields not assigned to category
        const sorted = [...category.resolvedLayout].sort((a, b) => a.position - b.position)
        return sorted.map((section) => ({
            ...section,
            fields: section.fields.filter((f) => validFieldIds.has(f.fieldId))
        }))
    }, [editingLayout, category])

    function startLayoutEditing() {
        if (!category) return

        // Build set of valid field IDs (own + inherited)
        const validFieldIds = new Set([
            ...category.ownFields.map((f) => f.id),
            ...category.inheritedFields.map((f) => f.id),
        ])

        // Deep copy and clean the layout - remove any fields not assigned to category
        const rawCopy = JSON.parse(JSON.stringify(
            [...(category.resolvedLayout || [])].sort((a, b) => a.position - b.position)
        )) as ResolvedLayoutSection[]

        // Filter out invalid fields and show warning if any found
        let removedCount = 0
        const cleanedCopy = rawCopy.map((section) => {
            const validFields = section.fields.filter((f) => {
                const isValid = validFieldIds.has(f.fieldId)
                if (!isValid) removedCount++
                return isValid
            })
            return { ...section, fields: validFields }
        })

        if (removedCount > 0) {
            addToast("error", `Removed ${removedCount} invalid field(s) from layout. These fields are no longer assigned to this category.`)
        }

        setEditingLayout(cleanedCopy)
        setLayoutDirty(false)
    }

    function cancelLayoutEditing() {
        setEditingLayout(null)
        setLayoutDirty(false)
        setEditingSectionId(null)
        setAddingSectionInLayout(false)
        setEditingFieldId(null)
    }

    function updateLayoutState(newLayout: ResolvedLayoutSection[]) {
        setEditingLayout(newLayout)
        setLayoutDirty(true)
    }

    // Add a new section
    function addLayoutSection() {
        const title = newLayoutSectionName.trim()
        if (!title) return
        if (!editingLayout) return

        const newSection: ResolvedLayoutSection = {
            id: `sec-${Date.now()}`,
            title,
            description: newLayoutSectionDesc.trim() || null,
            position: editingLayout.length,
            isCollapsible: true,
            isCollapsed: false,
            fields: [],
        }
        updateLayoutState([...editingLayout, newSection])
        setAddingSectionInLayout(false)
        setNewLayoutSectionName("")
        setNewLayoutSectionDesc("")
    }

    // Delete a section (moves fields to "Unassigned" / first section or removes them)
    function deleteLayoutSection(sectionId: string) {
        if (!editingLayout) return
        const section = editingLayout.find((s) => s.id === sectionId)
        if (!section) return

        // If section has fields, move them to the first remaining section
        const remaining = editingLayout.filter((s) => s.id !== sectionId)
        if (section.fields.length > 0 && remaining.length > 0) {
            remaining[0] = {
                ...remaining[0],
                fields: [
                    ...remaining[0].fields,
                    ...section.fields.map((f, idx) => ({
                        ...f,
                        position: remaining[0].fields.length + idx,
                    })),
                ],
            }
        }

        // Reindex positions
        const reindexed = remaining.map((s, idx) => ({ ...s, position: idx }))
        updateLayoutState(reindexed)
        if (editingSectionId === sectionId) setEditingSectionId(null)
    }

    // Start editing a section's properties
    function startEditSection(section: ResolvedLayoutSection) {
        setEditingSectionId(section.id)
        setEditingSectionTitle(section.title)
        setEditingSectionDescription(section.description || "")
        setEditingSectionCollapsible(section.isCollapsible)
    }

    // Save section property edits
    function saveEditSection() {
        if (!editingLayout || !editingSectionId) return
        const title = editingSectionTitle.trim()
        if (!title) return

        const updated = editingLayout.map((s) =>
            s.id === editingSectionId
                ? {
                    ...s,
                    title,
                    description: editingSectionDescription.trim() || null,
                    isCollapsible: editingSectionCollapsible,
                }
                : s
        )
        updateLayoutState(updated)
        setEditingSectionId(null)
    }

    // Move section up/down
    function moveSectionUp(sectionId: string) {
        if (!editingLayout) return
        const idx = editingLayout.findIndex((s) => s.id === sectionId)
        if (idx <= 0) return
        const copy = [...editingLayout]
            ;[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
        updateLayoutState(copy.map((s, i) => ({ ...s, position: i })))
    }

    function moveSectionDown(sectionId: string) {
        if (!editingLayout) return
        const idx = editingLayout.findIndex((s) => s.id === sectionId)
        if (idx === -1 || idx >= editingLayout.length - 1) return
        const copy = [...editingLayout]
            ;[copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
        updateLayoutState(copy.map((s, i) => ({ ...s, position: i })))
    }

    // Move field up/down within a section
    function moveFieldUp(sectionId: string, fieldIdx: number) {
        if (!editingLayout) return
        const updated = editingLayout.map((s) => {
            if (s.id !== sectionId) return s
            if (fieldIdx <= 0) return s
            const fields = [...s.fields]
                ;[fields[fieldIdx - 1], fields[fieldIdx]] = [fields[fieldIdx], fields[fieldIdx - 1]]
            return { ...s, fields: fields.map((f, i) => ({ ...f, position: i })) }
        })
        updateLayoutState(updated)
    }

    function moveFieldDown(sectionId: string, fieldIdx: number) {
        if (!editingLayout) return
        const updated = editingLayout.map((s) => {
            if (s.id !== sectionId) return s
            if (fieldIdx >= s.fields.length - 1) return s
            const fields = [...s.fields]
                ;[fields[fieldIdx], fields[fieldIdx + 1]] = [fields[fieldIdx + 1], fields[fieldIdx]]
            return { ...s, fields: fields.map((f, i) => ({ ...f, position: i })) }
        })
        updateLayoutState(updated)
    }

    // Move field to a different section
    function moveFieldToSection(fromSectionId: string, fieldId: string, toSectionId: string) {
        if (!editingLayout || fromSectionId === toSectionId) return
        const fromSection = editingLayout.find((s) => s.id === fromSectionId)
        if (!fromSection) return
        const field = fromSection.fields.find((f) => f.fieldId === fieldId)
        if (!field) return

        const updated = editingLayout.map((s) => {
            if (s.id === fromSectionId) {
                const fields = s.fields.filter((f) => f.fieldId !== fieldId)
                return { ...s, fields: fields.map((f, i) => ({ ...f, position: i })) }
            }
            if (s.id === toSectionId) {
                const fields = [...s.fields, { ...field, position: s.fields.length }]
                return { ...s, fields }
            }
            return s
        })
        updateLayoutState(updated)
    }

    // Remove field from a section (puts it back as unassigned in layout)
    function removeFieldFromSection(sectionId: string, fieldId: string) {
        if (!editingLayout) return
        const updated = editingLayout.map((s) => {
            if (s.id !== sectionId) return s
            const fields = s.fields.filter((f) => f.fieldId !== fieldId)
            return { ...s, fields: fields.map((f, i) => ({ ...f, position: i })) }
        })
        updateLayoutState(updated)
    }

    // Start editing a field's layout properties
    function startEditField(sectionId: string, layoutField: ResolvedLayoutField) {
        setEditingFieldId(layoutField.fieldId)
        setEditingFieldSectionId(sectionId)
        setEditFieldLabel(layoutField.label || "")
        setEditFieldColSpan(layoutField.colSpan)
        setEditFieldReadOnly(layoutField.isReadOnly)
    }

    // Save field property edits
    function saveEditField() {
        if (!editingLayout || !editingFieldId || !editingFieldSectionId) return
        const updated = editingLayout.map((s) => {
            if (s.id !== editingFieldSectionId) return s
            return {
                ...s,
                fields: s.fields.map((f) =>
                    f.fieldId === editingFieldId
                        ? {
                            ...f,
                            label: editFieldLabel.trim() || null,
                            colSpan: editFieldColSpan,
                            isReadOnly: editFieldReadOnly,
                        }
                        : f
                ),
            }
        })
        updateLayoutState(updated)
        setEditingFieldId(null)
        setEditingFieldSectionId(null)
    }

    // Get fields not in any section (unassigned to layout)
    const unassignedFields = useMemo(() => {
        if (!category) return []
        const allFieldIds = new Set([
            ...category.ownFields.map((f) => f.id),
            ...category.inheritedFields.map((f) => f.id),
        ])
        const layoutFieldIds = new Set<string>()
        for (const section of workingLayout) {
            for (const f of section.fields) {
                layoutFieldIds.add(f.fieldId)
            }
        }
        return [...allFieldIds].filter((id) => !layoutFieldIds.has(id))
    }, [category, workingLayout])

    // Add unassigned field to a section
    function addFieldToSection(sectionId: string, fieldId: string) {
        if (!editingLayout) return
        const updated = editingLayout.map((s) => {
            if (s.id !== sectionId) return s
            // Check if already in this section
            if (s.fields.some((f) => f.fieldId === fieldId)) return s
            return {
                ...s,
                fields: [
                    ...s.fields,
                    {
                        fieldId,
                        label: null,
                        position: s.fields.length,
                        colSpan: 1,
                        isReadOnly: false,
                    },
                ],
            }
        })
        updateLayoutState(updated)
    }

    // ── Auto-assign unplaced fields into "General Information" section ──────────

    async function autoAssignToGeneralInfo(cat: CategoryDetail) {
        const allFieldIds = [
            ...cat.ownFields.map((f) => f.id),
            ...cat.inheritedFields.map((f) => f.id),
        ]

        const existingLayout = [...(cat.resolvedLayout || [])].sort(
            (a, b) => a.position - b.position
        )

        // Collect field IDs already placed in any layout section
        const placedFieldIds = new Set<string>()
        for (const section of existingLayout) {
            for (const f of section.fields) placedFieldIds.add(f.fieldId)
        }

        const unplacedFieldIds = allFieldIds.filter((id) => !placedFieldIds.has(id))
        if (unplacedFieldIds.length === 0) return // nothing to auto-place

        const GENERAL_INFO_TITLE = "General Information"
        let newLayout = [...existingLayout]
        let generalInfoIdx = newLayout.findIndex((s) => s.title === GENERAL_INFO_TITLE)

        if (generalInfoIdx === -1) {
            // No "General Information" section exists yet — create it as the first section
            const newSection: ResolvedLayoutSection = {
                id: `sec-general-${Date.now()}`,
                title: GENERAL_INFO_TITLE,
                description: null,
                position: 0,
                isCollapsible: true,
                isCollapsed: false,
                fields: [],
            }
            // Shift existing sections down by 1
            newLayout = [newSection, ...newLayout.map((s, i) => ({ ...s, position: i + 1 }))]
            generalInfoIdx = 0
        }

        // Append unplaced fields to the General Information section
        const existingFieldCount = newLayout[generalInfoIdx].fields.length
        newLayout[generalInfoIdx] = {
            ...newLayout[generalInfoIdx],
            fields: [
                ...newLayout[generalInfoIdx].fields,
                ...unplacedFieldIds.map((fieldId, idx) => ({
                    fieldId,
                    label: null,
                    position: existingFieldCount + idx,
                    colSpan: 1 as const,
                    isReadOnly: false,
                })),
            ],
        }

        // Build and save the layout payload
        await updateCategoryLayout({
            category_id: cat.id,
            sections: newLayout.map((section, sIdx) => ({
                id: section.id,
                title: section.title,
                description: section.description || null,
                position: sIdx,
                is_collapsible: section.isCollapsible,
                is_collapsed: section.isCollapsed,
                fields: section.fields.map((f, fIdx) => ({
                    field_id: f.fieldId,
                    label: f.label || null,
                    position: fIdx,
                    col_span: f.colSpan,
                    is_read_only: f.isReadOnly,
                })),
            })),
        })
    }

    // Build the save payload for the API
    function buildLayoutPayload(): DisplaySectionSchema[] {
        return workingLayout.map((section, sIdx) => ({
            id: section.id,
            title: section.title,
            description: section.description || null,
            position: sIdx,
            is_collapsible: section.isCollapsible,
            is_collapsed: section.isCollapsed,
            fields: section.fields.map((f, fIdx) => ({
                field_id: f.fieldId,
                label: f.label || null,
                position: fIdx,
                col_span: f.colSpan,
                is_read_only: f.isReadOnly,
            })),
        }))
    }

    // Save layout to backend
    async function saveLayout() {
        if (!category || !editingLayout) return

        // Validate: section titles are required and max 255 chars
        for (const section of editingLayout) {
            if (!section.title.trim()) {
                addToast("error", "All sections must have a title")
                return
            }
            if (section.title.length > 255) {
                addToast("error", `Section "${section.title.slice(0, 30)}..." title exceeds 255 characters`)
                return
            }
        }

        // Validate: all field_ids must be assigned to the category
        const validFieldIds = new Set([
            ...category.ownFields.map((f) => f.id),
            ...category.inheritedFields.map((f) => f.id),
        ])
        for (const section of editingLayout) {
            for (const f of section.fields) {
                if (!validFieldIds.has(f.fieldId)) {
                    addToast("error", `Field "${f.fieldId}" is not assigned to this category`)
                    return
                }
            }
        }

        // Validate: col_span must be 1 or 2
        for (const section of editingLayout) {
            for (const f of section.fields) {
                if (f.colSpan !== 1 && f.colSpan !== 2) {
                    addToast("error", "Column span must be 1 (half-width) or 2 (full-width)")
                    return
                }
            }
        }

        // Validate: no duplicate field_ids across sections
        const seenFieldIds = new Set<string>()
        for (const section of editingLayout) {
            for (const f of section.fields) {
                if (seenFieldIds.has(f.fieldId)) {
                    const fieldInfo = fieldLookup.get(f.fieldId)
                    addToast("error", `Field "${fieldInfo?.name || f.fieldId}" appears in multiple sections`)
                    return
                }
                seenFieldIds.add(f.fieldId)
            }
        }

        setSavingLayout(true)
        try {
            const payload = {
                category_id: category.id,
                sections: buildLayoutPayload(),
            }
            await updateCategoryLayout(payload)

            // Refresh from backend
            const refreshed = await getCategoryDetail(category.id)
            if (refreshed) {
                setCategory(refreshed)
            }
            setEditingLayout(null)
            setLayoutDirty(false)
            addToast("success", "Layout saved successfully")
        } catch (err: any) {
            addToast("error", err?.message || "Failed to save layout")
        } finally {
            setSavingLayout(false)
        }
    }

    // ── Toggle resolvedLayout section collapse ────────────────────────

    function toggleSectionCollapse(sectionId: string) {
        setCollapsedSections((prev) => {
            const next = new Set(prev)
            if (next.has(sectionId)) {
                next.delete(sectionId)
            } else {
                next.add(sectionId)
            }
            return next
        })
    }

    // ── Load ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!id) {
            navigate("/retailsync/categories")
            return
        }
        setLoading(true)
        setError(null)
        getCategoryDetail(id).then((detail) => {
            if (detail) {
                setCategory(detail)
                // Initialize collapsed sections from API defaults
                const defaultCollapsed = new Set<string>()
                detail.resolvedLayout?.forEach((section) => {
                    if (section.isCollapsed) {
                        defaultCollapsed.add(section.id)
                    }
                })
                setCollapsedSections(defaultCollapsed)
            } else {
                setError("Category not found")
            }
            setLoading(false)
        })
    }, [id, getCategoryDetail, navigate])

    const fieldCount = useMemo(
        () => {
            if (!category) return 0
            return (category.ownFields?.length ?? 0) + (category.inheritedFields?.length ?? 0)
        },
        [category]
    )

    // ── Build a field lookup from ownFields + inheritedFields ──────────────

    const fieldLookup = useMemo(() => {
        if (!category) return new Map<string, CategoryFieldSummary>()
        const map = new Map<string, CategoryFieldSummary>()
        for (const f of category.ownFields) map.set(f.id, f)
        for (const f of category.inheritedFields) map.set(f.id, f)
        return map
    }, [category])

    // ── Check if a field is inherited ──────────────────────────────────────

    const inheritedFieldIds = useMemo(() => {
        if (!category) return new Set<string>()
        return new Set(category.inheritedFields.map((f) => f.id))
    }, [category])

    // ── Field assignment ───────────────────────────────────────────────────

    function openFieldAssignment() {
        setShowFieldSidebar(true)
        requestAnimationFrame(() => setIsFieldSidebarAnimating(true))
    }

    function openSuggestedFieldsDialog() {
        if (!category) return
        setSuggestedFieldIds(category.suggestedFields.map((f) => f.id))
        setShowSuggestedFieldsDialog(true)
        requestAnimationFrame(() => setIsDialogAnimating(true))
    }

    function closeSuggestedFieldsDialog() {
        setIsDialogAnimating(false)
        setTimeout(() => setShowSuggestedFieldsDialog(false), 300)
    }

    async function assignAllSuggestedFields() {
        if (!category || suggestedFieldIds.length === 0) return
        closeSuggestedFieldsDialog()
        try {
            await handleFieldAssignment(suggestedFieldIds, false, false)
        } catch (err: any) {
            addToast("error", err?.message || "Failed to assign suggested fields")
        }
    }

    function chooseFromSuggestedFields() {
        closeSuggestedFieldsDialog()
        openFieldAssignment()
    }

    function closeFieldAssignment() {
        setIsFieldSidebarAnimating(false)
        setTimeout(() => setShowFieldSidebar(false), 300)
    }

    async function handleFieldAssignment(fieldIds: string[], cascadeAdded: boolean, cascadeRemoved: boolean) {
        if (!category) return
        try {
            await assignFields({
                category_id: category.id,
                field_ids: fieldIds,
                cascade_added: cascadeAdded,
                cascade_removed: cascadeRemoved,
            })

            // Fetch updated category (fields now saved)
            const refreshed = await getCategoryDetail(category.id)
            if (refreshed) {
                // Auto-place any newly unassigned fields into "General Information" layout section
                await autoAssignToGeneralInfo(refreshed)
                // Fetch once more so the UI shows the persisted layout
                const finalDetail = await getCategoryDetail(category.id)
                const resolved = finalDetail ?? refreshed
                setCategory(resolved)
                // Reset layout editing state since fields + layout changed
                setEditingLayout(null)
                setLayoutDirty(false)
                setEditingSectionId(null)
                setEditingFieldId(null)
            }

            closeFieldAssignment()
            addToast("success", cascadeAdded
                ? "Fields assigned to this category and all children"
                : "Fields assigned successfully"
            )
        } catch (err: any) {
            addToast("error", err?.message || "Failed to assign fields")
            throw err
        }
    }

    async function removeFieldFromCategory(fieldIdToRemove: string, isInherited: boolean) {
        if (!category) return
        try {
            // Collect all remaining field IDs (excluding the one being removed)
            const remainingFieldIds = [
                ...category.ownFields
                    .filter((f) => f.id !== fieldIdToRemove)
                    .map((f) => f.id),
            ]

            // Call handleFieldAssignment with remaining IDs and cascade_removed = true
            await assignFields({
                category_id: category.id,
                field_ids: remainingFieldIds,
                cascade_added: false,
                cascade_removed: false,
            })

            const removedFieldName =
                category.ownFields.find((f) => f.id === fieldIdToRemove)?.name ||
                category.inheritedFields.find((f) => f.id === fieldIdToRemove)?.name ||
                "Field"

            // Refresh category
            const refreshed = await getCategoryDetail(category.id)
            if (refreshed) {
                setCategory(refreshed)
            }

            addToast("success", `"${removedFieldName}" removed from this category`)
        } catch (err: any) {
            addToast("error", err?.message || "Failed to remove field")
        }
    }

    // ── Edit drawer ─────────────────────────────────────────────────────────

    function openEdit() {
        setShowEditForm(true)
        requestAnimationFrame(() => setIsDrawerAnimating(true))
    }

    function closeEdit() {
        setIsDrawerAnimating(false)
        setTimeout(() => setShowEditForm(false), 300)
    }

    async function handleEditSubmit(data: CategoryFormData) {
        if (!category) return
        const result = await updateCategory(category.id, {
            name: data.name,
            description: data.description,
        })
        if (result.success) {
            setCategory((prev) =>
                prev ? { ...prev, name: data.name, description: data.description } : prev
            )
            closeEdit()
            addToast("success", result.message)
        } else {
            throw new Error(result.message)
        }
    }

    // ── Format date helper ──────────────────────────────────────────────────

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // ── Render: loading / error ───────────────────────────────────────────────

    if (loading) return <LoadingSkeleton />

    if (error || !category) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-base font-semibold text-foreground">{error ?? "Category not found"}</p>
                <Button variant="outline" onClick={() => navigate("/retailsync/categories")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Categories
                </Button>
            </div>
        )
    }

    const TABS: { id: TabId; label: string; count?: number }[] = [
        { id: "overview", label: "Overview" },
        { id: "fields", label: "Fields", count: fieldCount },
        { id: "products", label: "Products", count: category.productCount },
        { id: "channel-mappings", label: "Channel Mappings" },
        { id: "layout", label: "Layout" },
        { id: "settings", label: "Settings" },
        { id: "audit-log", label: "Audit Log" },
    ]

    return (
        <div className="flex flex-col min-h-screen bg-background">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-border bg-card px-6 py-5">
                {/* Breadcrumb inside header */}
                {category.breadcrumb.length > 0 && (
                    <nav className="flex items-center gap-1 text-sm mb-4">
                        <button
                            onClick={() => navigate("/retailsync/categories")}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Categories
                        </button>
                        {category.breadcrumb.map((crumb, i) => (
                            <span key={crumb.id} className="flex items-center gap-1">
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                                {i === category.breadcrumb.length - 1 ? (
                                    <span className="font-medium text-foreground">{crumb.name}</span>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/retailsync/categories/${crumb.id}`)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {crumb.name}
                                    </button>
                                )}
                            </span>
                        ))}
                    </nav>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Back button */}
                        <button
                            onClick={() => navigate("/retailsync/categories")}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        {/* Category icon */}
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${category.isArchive ? "bg-orange-100 dark:bg-orange-900/30" : "bg-primary/10"
                            }`}>
                            {category.isArchive ? (
                                <Archive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            ) : (
                                <Tag className="h-6 w-6 text-primary" />
                            )}
                        </div>

                        {/* Name + meta */}
                        <div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wide">
                                    Level {category.level}
                                </span>
                                {category.isArchive ? (
                                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 font-medium">
                                        <Archive className="h-3 w-3" />
                                        Archived
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>
                                    Slug: <span className="font-mono text-foreground/80">{category.slug}</span>
                                </span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/50 inline-block" />
                                <span className="flex items-center gap-1">
                                    <Package className="h-3.5 w-3.5" />
                                    {category.productCount} products
                                </span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/50 inline-block" />
                                <span>{fieldCount} fields</span>
                                {category.hasChildren && (
                                    <>
                                        <span className="h-1 w-1 rounded-full bg-muted-foreground/50 inline-block" />
                                        <span>Has children</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                        <Button
                            onClick={openEdit}
                            className="gap-2 shadow-sm hover:shadow-md transition-all"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Category
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-border bg-card px-6 flex items-end">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            // Guard: if we're leaving layout tab with unsaved changes, confirm
                            if (activeTab === "layout" && editingLayout && layoutDirty && tab.id !== "layout") {
                                if (!confirm("You have unsaved layout changes. Discard them?")) return
                                cancelLayoutEditing()
                            }
                            setActiveTab(tab.id)
                        }}
                        className={`flex items-center gap-1.5 px-1 mr-6 pb-3.5 pt-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={`text-xs tabular-nums ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Content ──────────────────────────────────────────────────────── */}
            <div className="flex-1 p-6">

                {/* ─── Overview tab ───────────────────────────────────────────── */}
                {activeTab === "overview" && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Description */}
                        {category.description && (
                            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-border bg-muted/20">
                                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Description
                                    </h3>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-sm text-foreground leading-relaxed">{category.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Products</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{category.productCount.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Fields</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{fieldCount}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {category.ownFields.length} own · {category.inheritedFields.length} inherited
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Created</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">{formatDate(category.createdAt)}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Updated</span>
                                </div>
                                <p className="text-sm font-medium text-foreground">{formatDate(category.updatedAt)}</p>
                            </div>
                        </div>

                        {/* Suggested Fields (from ancestors, not yet assigned) */}
                        {category.suggestedFields.length > 0 && (
                            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-900/20">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            Suggested Fields
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            Available from parent categories
                                        </span>
                                    </div>
                                </div>
                                <div className="divide-y divide-blue-100 dark:divide-blue-800/50">
                                    {category.suggestedFields.map((field) => (
                                        <div key={field.id} className="flex items-center gap-4 px-6 py-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground">{field.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{field.slug}</span>
                                                    {field.isRequired && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                                                            Required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <FieldTypeBadge type={field.fieldType} />
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-3 border-t border-blue-200 dark:border-blue-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={openFieldAssignment}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Assign Suggested Fields
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Fields tab ─────────────────────────────────────────────── */}
                {activeTab === "fields" && (
                    <>
                        {fieldCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="rounded-full bg-muted/60 p-4 mb-4">
                                    <Layers className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1">
                                    No fields assigned yet
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
                                    Assign fields to define the data structure for products in this category.
                                </p>
                                <Button
                                    variant="default"
                                    className="gap-2"
                                    onClick={openFieldAssignment}
                                >
                                    <Plus className="h-4 w-4" />
                                    Assign Fields
                                </Button>
                            </div>
                        ) : (
                            <div className="max-w-5xl mx-auto">
                                {/* Toolbar */}
                                <div className="flex justify-between items-center mb-5">
                                    <Button
                                        variant="default"
                                        className="gap-2"
                                        onClick={openFieldAssignment}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Assign Fields
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        To organize fields into sections, use the{" "}
                                        <button
                                            onClick={() => setActiveTab("layout")}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Layout
                                        </button>{" "}
                                        tab
                                    </p>
                                </div>

                                {/* Own Fields */}
                                {category.ownFields.length > 0 && (
                                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-5">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                                            <h3 className="text-base font-semibold text-foreground">
                                                Own Fields
                                            </h3>
                                            <span className="text-sm text-muted-foreground">
                                                {category.ownFields.length} field{category.ownFields.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <div>
                                            {category.ownFields.map((field, idx) => (
                                                <div
                                                    key={field.id}
                                                    className={`flex items-center gap-4 px-6 py-4 hover:bg-accent/30 transition-colors group ${idx < category.ownFields.length - 1
                                                        ? "border-b border-border/50"
                                                        : ""
                                                        }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-medium text-sm text-foreground">
                                                                {field.name}
                                                            </span>
                                                            {field.isRequired && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {field.slug}
                                                        </div>
                                                        {field.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {field.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <FieldTypeBadge type={field.fieldType} />
                                                    <button
                                                        onClick={() => removeFieldFromCategory(field.id, false)}
                                                        className="shrink-0 p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove field"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Inherited Fields */}
                                {category.inheritedFields.length > 0 && (
                                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-5">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-blue-50/50 dark:bg-blue-950/20">
                                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                                Inherited Fields
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    (from parent categories)
                                                </span>
                                            </h3>
                                            <span className="text-sm text-muted-foreground">
                                                {category.inheritedFields.length} field{category.inheritedFields.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <div>
                                            {category.inheritedFields.map((field, idx) => (
                                                <div
                                                    key={field.id}
                                                    className={`flex items-center gap-4 px-6 py-4 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-accent/30 transition-colors group ${idx < category.inheritedFields.length - 1
                                                        ? "border-b border-border/50"
                                                        : ""
                                                        }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-medium text-sm text-foreground">
                                                                {field.name}
                                                            </span>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                                                Inherited
                                                            </span>
                                                            {field.isRequired && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                                                                    Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {field.slug}
                                                        </div>
                                                        {field.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {field.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <FieldTypeBadge type={field.fieldType} />
                                                    <button
                                                        onClick={() => removeFieldFromCategory(field.id, true)}
                                                        className="shrink-0 p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove inherited field"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ─── Layout tab ─────────────────────────────────────────────── */}
                {activeTab === "layout" && (
                    <div className="max-w-5xl mx-auto">
                        {fieldCount === 0 ? (
                            /* No fields assigned at all */
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="rounded-full bg-muted/60 p-4 mb-4">
                                    <Layers className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1">
                                    No fields assigned yet
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
                                    Assign fields to this category first, then configure the layout sections here.
                                </p>
                                <Button
                                    variant="default"
                                    onClick={openFieldAssignment}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Assign Fields
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Layout Editor Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Display Layout</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Configure how fields are organized and displayed for this category
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {editingLayout ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="gap-2"
                                                    onClick={cancelLayoutEditing}
                                                    disabled={savingLayout}
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    className="gap-2"
                                                    onClick={saveLayout}
                                                    disabled={savingLayout || !layoutDirty}
                                                >
                                                    {savingLayout ? (
                                                        <>
                                                            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4" />
                                                            Save Layout
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="default"
                                                className="gap-2"
                                                onClick={startLayoutEditing}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Edit Layout
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Dirty state indicator */}
                                {editingLayout && layoutDirty && (
                                    <div className="mb-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2.5 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            You have unsaved layout changes. Click "Save Layout" to persist them.
                                        </p>
                                    </div>
                                )}

                                {/* Add Section button (edit mode) */}
                                {editingLayout && (
                                    <div className="mb-5">
                                        {addingSectionInLayout ? (
                                            <div className="rounded-xl border border-dashed border-primary bg-primary/5 p-5">
                                                <h4 className="text-sm font-semibold text-foreground mb-3">New Section</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-foreground mb-1">
                                                            Section Title <span className="text-destructive">*</span>
                                                        </label>
                                                        <input
                                                            ref={sectionInputRef}
                                                            type="text"
                                                            value={newLayoutSectionName}
                                                            onChange={(e) => setNewLayoutSectionName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") addLayoutSection()
                                                                if (e.key === "Escape") {
                                                                    setAddingSectionInLayout(false)
                                                                    setNewLayoutSectionName("")
                                                                    setNewLayoutSectionDesc("")
                                                                }
                                                            }}
                                                            placeholder="e.g., Basic Details"
                                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm
                                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                            autoFocus
                                                            maxLength={255}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-foreground mb-1">
                                                            Description <span className="text-muted-foreground">(optional)</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newLayoutSectionDesc}
                                                            onChange={(e) => setNewLayoutSectionDesc(e.target.value)}
                                                            placeholder="Brief description of this section..."
                                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm
                                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Button
                                                            size="sm"
                                                            onClick={addLayoutSection}
                                                            disabled={!newLayoutSectionName.trim()}
                                                            className="gap-1.5"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Section
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setAddingSectionInLayout(false)
                                                                setNewLayoutSectionName("")
                                                                setNewLayoutSectionDesc("")
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="gap-2 border-dashed"
                                                onClick={() => {
                                                    setAddingSectionInLayout(true)
                                                    setTimeout(() => sectionInputRef.current?.focus(), 50)
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Section
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Layout Sections */}
                                {workingLayout.length === 0 && !editingLayout ? (
                                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-muted/10">
                                        <Layers className="h-8 w-8 text-muted-foreground/40 mb-3" />
                                        <p className="text-sm text-muted-foreground mb-1">No layout sections yet</p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Click "Edit Layout" to start organizing fields into sections
                                        </p>
                                        <Button variant="default" className="gap-2" onClick={startLayoutEditing}>
                                            <Edit2 className="h-4 w-4" />
                                            Edit Layout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {workingLayout.map((section, sectionIdx) => {
                                            const isCollapsed = collapsedSections.has(section.id)
                                            const sortedFields = [...section.fields].sort(
                                                (a, b) => a.position - b.position
                                            )
                                            const isEditingThisSection = editingSectionId === section.id

                                            return (
                                                <div
                                                    key={section.id}
                                                    className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-colors ${dragOverSectionId === section.id
                                                        ? "border-primary ring-2 ring-primary/30"
                                                        : "border-border"
                                                        }`}
                                                    onDragOver={(e) => {
                                                        if (!editingLayout) return
                                                        e.preventDefault()
                                                        e.dataTransfer.dropEffect = "move"
                                                        if (dragOverSectionId !== section.id) setDragOverSectionId(section.id)
                                                    }}
                                                    onDragLeave={(e) => {
                                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                            setDragOverSectionId(null)
                                                        }
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault()
                                                        setDragOverSectionId(null)
                                                        const drag = dragState.current
                                                        if (editingLayout && drag && drag.fromSectionId !== section.id) {
                                                            moveFieldToSection(drag.fromSectionId, drag.fieldId, section.id)
                                                        }
                                                        dragState.current = null
                                                    }}
                                                >
                                                    {/* Section Header */}
                                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {editingLayout && (
                                                                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                {isEditingThisSection ? (
                                                                    /* Section Edit Form */
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            value={editingSectionTitle}
                                                                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") saveEditSection()
                                                                                if (e.key === "Escape") setEditingSectionId(null)
                                                                            }}
                                                                            placeholder="Section title..."
                                                                            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold
                                               text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                                            autoFocus
                                                                            maxLength={255}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={editingSectionDescription}
                                                                            onChange={(e) => setEditingSectionDescription(e.target.value)}
                                                                            placeholder="Description (optional)..."
                                                                            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs
                                               text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                                        />
                                                                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={editingSectionCollapsible}
                                                                                onChange={(e) => setEditingSectionCollapsible(e.target.checked)}
                                                                                className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                                                            />
                                                                            Collapsible
                                                                        </label>
                                                                        <div className="flex gap-2 pt-1">
                                                                            <Button size="sm" onClick={saveEditSection} disabled={!editingSectionTitle.trim()}>
                                                                                Save
                                                                            </Button>
                                                                            <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(null)}>
                                                                                Cancel
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex items-center gap-3">
                                                                            <h3 className="text-base font-semibold text-foreground">
                                                                                {section.title}
                                                                            </h3>
                                                                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                                                {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
                                                                            </span>
                                                                            {section.isCollapsible && (
                                                                                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                                    Collapsible
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {section.description && (
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                {section.description}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {editingLayout && !isEditingThisSection && (
                                                                <>
                                                                    {/* Move Up */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => moveSectionUp(section.id)}
                                                                        disabled={sectionIdx === 0}
                                                                        className="h-8 w-8 p-0"
                                                                        title="Move section up"
                                                                    >
                                                                        <ChevronRight className="h-4 w-4 -rotate-90" />
                                                                    </Button>
                                                                    {/* Move Down */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => moveSectionDown(section.id)}
                                                                        disabled={sectionIdx === workingLayout.length - 1}
                                                                        className="h-8 w-8 p-0"
                                                                        title="Move section down"
                                                                    >
                                                                        <ChevronRight className="h-4 w-4 rotate-90" />
                                                                    </Button>
                                                                    {/* Edit Section */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => startEditSection(section)}
                                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                                        title="Edit section"
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    {/* Delete Section */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            if (section.fields.length > 0) {
                                                                                if (workingLayout.length <= 1) {
                                                                                    addToast("error", "Cannot delete the only section. Fields need at least one section.")
                                                                                    return
                                                                                }
                                                                                if (!confirm(`Delete "${section.title}"? Its ${section.fields.length} field(s) will be moved to the first remaining section.`)) return
                                                                            }
                                                                            deleteLayoutSection(section.id)
                                                                        }}
                                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                                        title="Delete section"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {/* Collapse/Expand toggle (always visible) */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleSectionCollapse(section.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                {isCollapsed ? (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Section Fields */}
                                                    {!isCollapsed && (
                                                        <div>
                                                            {sortedFields.length === 0 ? (
                                                                <div className="px-6 py-8 text-center">
                                                                    <p className="text-sm text-muted-foreground">No fields in this section</p>
                                                                    {editingLayout && unassignedFields.length > 0 && (
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Use the "Unassigned Fields" panel below to add fields here
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="divide-y divide-border/50">
                                                                    {sortedFields.map((layoutField, fieldIdx) => {
                                                                        const field = fieldLookup.get(layoutField.fieldId)
                                                                        if (!field) return null
                                                                        const isInherited = inheritedFieldIds.has(layoutField.fieldId)
                                                                        const isEditingThisField = editingFieldId === layoutField.fieldId && editingFieldSectionId === section.id

                                                                        if (isEditingThisField) {
                                                                            return (
                                                                                <div key={layoutField.fieldId} className="px-6 py-4 bg-primary/5 border-l-2 border-l-primary">
                                                                                    <div className="flex items-center gap-2 mb-3">
                                                                                        <span className="font-semibold text-sm text-foreground">{field.name}</span>
                                                                                        <FieldTypeBadge type={field.fieldType} />
                                                                                    </div>
                                                                                    <div className="grid grid-cols-2 gap-3">
                                                                                        <div>
                                                                                            <label className="block text-xs font-medium text-foreground mb-1">
                                                                                                Custom Label
                                                                                            </label>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={editFieldLabel}
                                                                                                onChange={(e) => setEditFieldLabel(e.target.value)}
                                                                                                placeholder={field.name}
                                                                                                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm
                                                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                                                            />
                                                                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                                                Leave empty to use default field name
                                                                                            </p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <label className="block text-xs font-medium text-foreground mb-1">
                                                                                                Column Span
                                                                                            </label>
                                                                                            <select
                                                                                                value={editFieldColSpan}
                                                                                                onChange={(e) => setEditFieldColSpan(Number(e.target.value))}
                                                                                                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm
                                                         focus:outline-none focus:ring-2 focus:ring-ring"
                                                                                            >
                                                                                                <option value={1}>1 — Half width</option>
                                                                                                <option value={2}>2 — Full width</option>
                                                                                            </select>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="mt-3 flex items-center justify-between">
                                                                                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={editFieldReadOnly}
                                                                                                onChange={(e) => setEditFieldReadOnly(e.target.checked)}
                                                                                                className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                                                                                            />
                                                                                            Read-only
                                                                                        </label>
                                                                                        <div className="flex gap-2">
                                                                                            <Button size="sm" variant="ghost" onClick={() => { setEditingFieldId(null); setEditingFieldSectionId(null) }}>
                                                                                                Cancel
                                                                                            </Button>
                                                                                            <Button size="sm" onClick={saveEditField}>
                                                                                                Apply
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                    {/* Move to section */}
                                                                                    {workingLayout.length > 1 && (
                                                                                        <div className="mt-3 pt-3 border-t border-border/50">
                                                                                            <label className="block text-xs font-medium text-foreground mb-1">
                                                                                                Move to Section
                                                                                            </label>
                                                                                            <select
                                                                                                value={section.id}
                                                                                                onChange={(e) => {
                                                                                                    moveFieldToSection(section.id, layoutField.fieldId, e.target.value)
                                                                                                    setEditingFieldId(null)
                                                                                                    setEditingFieldSectionId(null)
                                                                                                }}
                                                                                                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm
                                                         focus:outline-none focus:ring-2 focus:ring-ring"
                                                                                            >
                                                                                                {workingLayout.map((s) => (
                                                                                                    <option key={s.id} value={s.id}>
                                                                                                        {s.title}{s.id === section.id ? " (current)" : ""}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        }

                                                                        return (
                                                                            <div
                                                                                key={layoutField.fieldId}
                                                                                draggable={!!editingLayout}
                                                                                onDragStart={(e) => {
                                                                                    if (!editingLayout) return
                                                                                    dragState.current = { fieldId: layoutField.fieldId, fromSectionId: section.id }
                                                                                    e.dataTransfer.effectAllowed = "move"
                                                                                    e.dataTransfer.setData("text/plain", layoutField.fieldId)
                                                                                }}
                                                                                onDragEnd={() => {
                                                                                    dragState.current = null
                                                                                    setDragOverSectionId(null)
                                                                                }}
                                                                                className={`flex items-center gap-4 px-6 py-4 hover:bg-accent/20 transition-colors group ${editingLayout ? "cursor-grab active:cursor-grabbing" : ""
                                                                                    }`}
                                                                            >
                                                                                {editingLayout && (
                                                                                    <div className="flex flex-col gap-0.5 shrink-0">
                                                                                        <button
                                                                                            onClick={() => moveFieldUp(section.id, fieldIdx)}
                                                                                            disabled={fieldIdx === 0}
                                                                                            className="h-4 w-4 flex items-center justify-center text-muted-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                                                                            title="Move up"
                                                                                        >
                                                                                            <ChevronRight className="h-3 w-3 -rotate-90" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => moveFieldDown(section.id, fieldIdx)}
                                                                                            disabled={fieldIdx === sortedFields.length - 1}
                                                                                            className="h-4 w-4 flex items-center justify-center text-muted-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                                                                            title="Move down"
                                                                                        >
                                                                                            <ChevronRight className="h-3 w-3 rotate-90" />
                                                                                        </button>
                                                                                    </div>
                                                                                )}

                                                                                {/* Field Info */}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                                                        <span className="font-semibold text-foreground text-sm">
                                                                                            {layoutField.label || field.name}
                                                                                        </span>
                                                                                        {layoutField.label && (
                                                                                            <span className="font-mono text-[10px] text-muted-foreground/60">
                                                                                                ({field.name})
                                                                                            </span>
                                                                                        )}
                                                                                        <span className="font-mono text-xs text-muted-foreground">
                                                                                            {field.slug}
                                                                                        </span>
                                                                                        {field.isRequired && (
                                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                                                                                                Required
                                                                                            </span>
                                                                                        )}
                                                                                        {isInherited && (
                                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                                                                                Inherited
                                                                                            </span>
                                                                                        )}
                                                                                        {layoutField.isReadOnly && (
                                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                                                                                Read-only
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                                        <span>Col Span: {layoutField.colSpan === 2 ? "Full" : "Half"}</span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Field Type Badge */}
                                                                                <FieldTypeBadge type={field.fieldType} />

                                                                                {/* Edit / Remove buttons (edit mode only) */}
                                                                                {editingLayout && (
                                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            className="h-8 w-8 p-0"
                                                                                            onClick={() => startEditField(section.id, layoutField)}
                                                                                            title="Edit field settings"
                                                                                        >
                                                                                            <Edit2 className="h-3.5 w-3.5" />
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                                                            onClick={() => removeFieldFromSection(section.id, layoutField.fieldId)}
                                                                                            title="Remove from section"
                                                                                        >
                                                                                            <X className="h-3.5 w-3.5" />
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Unassigned Fields (edit mode only) */}
                                {editingLayout && unassignedFields.length > 0 && (
                                    <div className="mt-6 rounded-xl border border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-orange-200 dark:border-orange-800 bg-orange-100/50 dark:bg-orange-900/20">
                                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                Unassigned Fields
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    ({unassignedFields.length} field{unassignedFields.length !== 1 ? "s" : ""} not in any section)
                                                </span>
                                            </h4>
                                        </div>
                                        <div className="divide-y divide-orange-200/50 dark:divide-orange-800/50">
                                            {unassignedFields.map((fieldId) => {
                                                const field = fieldLookup.get(fieldId)
                                                if (!field) return null
                                                const isInherited = inheritedFieldIds.has(fieldId)

                                                return (
                                                    <div key={fieldId} className="flex items-center gap-4 px-6 py-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm text-foreground">{field.name}</span>
                                                                {isInherited && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                                                        Inherited
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground font-mono">{field.slug}</span>
                                                        </div>
                                                        <FieldTypeBadge type={field.fieldType} />
                                                        {/* Add to section dropdown */}
                                                        {workingLayout.length > 0 && (
                                                            <select
                                                                value=""
                                                                onChange={(e) => {
                                                                    if (e.target.value) {
                                                                        addFieldToSection(e.target.value, fieldId)
                                                                    }
                                                                }}
                                                                className="rounded-lg border border-input bg-background px-2 py-1 text-xs
                                         focus:outline-none focus:ring-2 focus:ring-ring"
                                                            >
                                                                <option value="">Add to section...</option>
                                                                {workingLayout.map((s) => (
                                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Layout Info Card */}
                                <div className="mt-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-6">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-2">About Layout Configuration</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                                                <li>Click "Edit Layout" to enter edit mode and make changes</li>
                                                <li>Sections organize fields into logical groups</li>
                                                <li>Use the arrow buttons to reorder sections and fields</li>
                                                <li>Collapsible sections can be expanded/collapsed by users</li>
                                                <li>Column span determines field width (1 = half, 2 = full width)</li>
                                                <li>Custom labels override default field names in the UI</li>
                                                <li>Read-only fields cannot be edited by users</li>
                                                <li>Changes are only saved when you click "Save Layout"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ─── Other tabs ─────────────────────────────────────────────── */}
                {activeTab === "products" && <PlaceholderTab label="Products" />}
                {activeTab === "channel-mappings" && <PlaceholderTab label="Channel Mappings" />}
                {activeTab === "settings" && <PlaceholderTab label="Category Settings" />}
                {activeTab === "audit-log" && <PlaceholderTab label="Audit Log" />}
            </div>

            {/* ── Edit Category Drawer ──────────────────────────────────────────── */}
            {showEditForm && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-100 ease-out ${isDrawerAnimating ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={() => {
                            if (confirm("Discard unsaved changes?")) closeEdit()
                        }}
                    />
                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                        <div
                            className={`w-screen max-w-3xl pointer-events-auto transform transition-transform duration-300 ease-out ${isDrawerAnimating ? "translate-x-0" : "translate-x-full"
                                }`}
                        >
                            <div className="flex h-full flex-col bg-card shadow-2xl border-l border-border">
                                <CategoryForm
                                    category={category}
                                    parentCategories={allCategories}
                                    onSubmit={handleEditSubmit}
                                    onCancel={closeEdit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Field Assignment Sidebar ──────────────────────────────────────── */}
            {showFieldSidebar && category && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className={`absolute inset-0 transition-opacity duration-100 ease-out ${isFieldSidebarAnimating ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={closeFieldAssignment}
                    />
                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                        <div
                            className={`w-screen max-w-xl pointer-events-auto transform transition-transform duration-300 ease-out ${isFieldSidebarAnimating ? "translate-x-0" : "translate-x-full"
                                }`}
                        >
                            <div className="flex h-full flex-col bg-card shadow-2xl border-l border-border">
                                <FieldAssignmentSidebar
                                    categoryId={category.id}
                                    categoryName={category.name}
                                    hasChildren={category.hasChildren}
                                    currentFieldIds={category.ownFields.map((f) => f.id)}
                                    onSubmit={handleFieldAssignment}
                                    onCancel={closeFieldAssignment}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toasts ────────────────────────────────────────────────────────── */}
            <ToastContainer
                toasts={toasts}
                onDismiss={(toastId) => setToasts((prev) => prev.filter((t) => t.id !== toastId))}
            />
        </div>

    )
}

