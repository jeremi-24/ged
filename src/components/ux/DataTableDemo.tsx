"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  Settings,
  UserCheck,
  FileText,
  FileImage,
  FileCode,
  FileQuestion,
  Calendar,
  Layers,
  HardDrive,
  FilePlus2,
  TrashIcon,
  SearchIcon
} from "lucide-react";
import { ButtonAnimation } from "@/components/snippet/button-animation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentData } from "@/types/types";
import { fetchDocuments } from "@/lib/services/CRUD/fetchDocument";
import DropdownMenuplus from "@/components/ui/DropdownMenu";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/Badge";

interface DataTableDemoProps {
  onDocumentClick: (document: DocumentData) => void;
  setSelectedIds: (ids: string) => void;
  onRefresh: (refresh: () => void) => void;
  viewMode?: 'list' | 'grid';
}

const formatDate = (date: any) => {
  if (!date) return "N/A";
  try {
    // Check if it's a Firestore Timestamp
    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  } catch (e) {
    return "N/A";
  }
};

const getFileIcon = (type: string, name: string) => {
  const isImage = type.includes('image');
  const isPDF = type.includes('pdf');

  return (
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-black/5 dark:border-white/5",
      isPDF ? "bg-orange-500/10 text-orange-500" :
        isImage ? "bg-blue-500/10 text-blue-500" :
          "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
    )}>
      {isPDF ? <FileText className="w-5 h-5" /> :
        isImage ? <FileImage className="w-5 h-5" /> :
          <FileQuestion className="w-5 h-5" />}
    </div>
  );
};

const getClassificationBadge = (classification: string) => {
  const c = classification?.toLowerCase() || "";
  const config: Record<string, { label: string, color: string }> = {
    'facture': { label: 'Facture', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50' },
    'contrat': { label: 'Contrat', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50' },
    'identite': { label: 'Identité', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' },
  };

  const matched = Object.entries(config).find(([key]) => c.includes(key));

  if (matched) {
    return <Badge className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-none border", matched[1].color)}>{matched[1].label}</Badge>;
  }

  return <Badge variant="outline" className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight text-zinc-500 border-zinc-200/50 dark:border-zinc-800/50 shadow-none">{classification || "Inconnu"}</Badge>;
};

export const columns: ColumnDef<DocumentData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="p-0 hover:bg-transparent -ml-2 font-bold text-zinc-500 text-xs uppercase tracking-wider"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Document
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">{row.getValue("name")}</span>
        <span className="text-[10px] text-zinc-500 font-mono">{(row.original.size / 1024).toFixed(1)} KB</span>
      </div>
    ),
  },
  {
    accessorKey: "classification",
    header: () => (
      <div className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Type</div>
    ),
    cell: ({ row }) => getClassificationBadge(row.getValue("classification")),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <div className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Ajouté le</div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
        <Calendar className="w-3 h-3 opacity-50" />
        {formatDate(row.getValue("createdAt"))}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const document = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 py-1.5">Options</DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-lg gap-2 cursor-pointer text-xs font-semibold"
              onClick={() => navigator.clipboard.writeText(document.id)}
            >
              <Layers className="w-4 h-4" />
              Copier l&apos;ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem className="rounded-lg gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer text-xs font-semibold">
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTableDemo({ onRefresh, onDocumentClick, setSelectedIds, viewMode = 'list' }: DataTableDemoProps) {
  const [documents, setDocuments] = React.useState<DocumentData[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedIds, setSelectedIdsState] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: viewMode === 'grid' ? 12 : 8,
  });

  const loadDocuments = React.useCallback(async () => {
    try {
      const fetchedDocuments = await fetchDocuments();
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
    }
  }, []);

  React.useEffect(() => {
    loadDocuments();
    onRefresh(loadDocuments);
  }, [loadDocuments, onRefresh]);


  const handleRowClick = (document: DocumentData) => {
    onDocumentClick(document);
  };

  const items = [
    { icon: <FilePlus2 size={16} />, name: "Nouveau document", href: "/documents/nouveau_document" },
    { icon: <Search size={16} />, name: "Nouvelle recherche", href: "/recherche" },
    { icon: <UserCheck size={16} />, name: "Inviter un contact", href: "/inviter-contact" },
    { icon: <Settings size={16} />, name: "Réglage", href: "/account" },
  ];

  const table = useReactTable({
    data: documents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const ids = selectedRows.map(row => row.original.id).join(",");
    setSelectedIds(ids);
  }, [rowSelection, table, setSelectedIds]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight italic text-zinc-900 dark:text-zinc-100">Bibliothèque</h1>
          <p className="text-sm text-zinc-500 font-medium">Gérez, visualisez et organisez vos documents.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenuplus items={items} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Recherchez un document..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-blue-500 shadow-sm"
          />
        </div>

        {viewMode === 'list' && (
          <div className="flex items-center gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-2xl gap-2 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                  <Layers className="w-4 h-4" />
                  Colonnes
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-zinc-200 shadow-xl p-1">
                {table.getAllColumns().filter(c => c.getCanHide()).map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize rounded-lg"
                    checked={column.getIsVisible()}
                    onCheckedChange={v => column.toggleVisibility(!!v)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/30 dark:bg-zinc-950/30 backdrop-blur-sm shadow-sm transition-all duration-300"
          >
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-14">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => handleRowClick(row.original)}
                      className="cursor-pointer group hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-900 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 opacity-10" />
                        <p className="font-bold italic text-sm">Aucun résultat trouvé dans la bibliothèque</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const doc = row.original;
                return (
                  <motion.div
                    key={doc.id}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Card
                      className="cursor-pointer relative overflow-hidden h-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                      onClick={() => handleRowClick(doc)}
                    >
                      <CardContent className="p-5 flex flex-col items-center gap-4">
                        <div className="w-full flex justify-between items-start mb-2">
                          {getClassificationBadge(doc.classification)}
                          <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(v) => row.toggleSelected(!!v)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-full w-5 h-5"
                          />
                        </div>

                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center shadow-inner relative">
                          {getFileIcon(doc.type, doc.name)}
                          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded-3xl" />
                        </div>

                        <div className="flex flex-col items-center text-center w-full px-2">
                          <h3 className="font-bold text-sm truncate w-full italic text-zinc-900 dark:text-zinc-100 mb-1">
                            {doc.name}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 font-medium">
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span>{formatDate(doc.createdAt)}</span>
                          </div>
                        </div>

                        <div className="w-full pt-4 mt-auto border-t border-zinc-200/50 dark:border-zinc-800/50 flex justify-center">
                          <Button variant="ghost" size="sm" className="w-full rounded-xl gap-2 font-bold text-[10px] uppercase tracking-wider text-blue-500 hover:bg-blue-500/5">
                            Visualiser
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full h-48 flex flex-col items-center justify-center text-zinc-500 gap-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/50 mt-4">
                <Search className="w-12 h-12 opacity-10" />
                <p className="font-bold italic text-sm text-center px-4">Aucun résultat trouvé dans la bibliothèque</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} sélectionnés
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-xs font-bold text-zinc-500 tabular-nums">
            {table.getState().pagination.pageIndex + 1} <span className="text-zinc-300 dark:text-zinc-700 mx-1">/</span> {table.getPageCount()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 w-9 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
