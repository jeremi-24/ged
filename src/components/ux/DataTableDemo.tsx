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
import { DocumentData } from "@/types/types";
import { fetchDocuments } from "@/lib/services/CRUD/fetchDocument";
import DropdownMenuplus from "@/components/ui/DropdownMenu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataTableDemoProps {
  onDocumentClick: (document: DocumentData) => void;
  setSelectedIds: (ids: string) => void;
  onRefresh: (refresh: () => void) => void;
}

const getFileIcon = (type: string, name: string) => {
  if (type.includes('pdf')) return <FileText className="w-4 h-4 text-orange-500" />;
  if (type.includes('image')) return <FileImage className="w-4 h-4 text-blue-500" />;
  return <FileQuestion className="w-4 h-4 text-zinc-400" />;
};

const getClassificationBadge = (classification: string) => {
  const c = classification?.toLowerCase() || "";
  if (c.includes('facture')) return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20 shadow-none capitalize">Facture</Badge>;
  if (c.includes('contrat')) return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 shadow-none capitalize">Contrat</Badge>;
  if (c.includes('identite')) return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20 shadow-none capitalize">Identité</Badge>;
  return <Badge variant="outline" className="capitalize text-zinc-500 border-zinc-200">{classification || "Inconnu"}</Badge>;
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
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {getFileIcon(row.original.type, row.original.name)}
        </div>
        <span className="font-bold text-sm italic">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "classification",
    header: () => (
      <div className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Classification</div>
    ),
    cell: ({ row }) => getClassificationBadge(row.getValue("classification")),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <div className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Date</div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <Calendar className="w-3 h-3" />
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "size",
    header: () => (
      <div className="font-bold text-zinc-500 text-xs uppercase tracking-wider text-right">Taille</div>
    ),
    cell: ({ row }) => {
      const bytes = row.getValue("size") as number;
      const kb = (bytes / 1024).toFixed(1);
      return (
        <div className="text-right font-mono text-xs text-zinc-400">
          {kb} KB
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const document = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-500 rounded-full transition-colors">
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 py-1.5">Options</DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-lg gap-2 cursor-pointer"
              onClick={() => navigator.clipboard.writeText(document.id)}
            >
              <Layers className="w-4 h-4" />
              Copier l&apos;ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem className="rounded-lg gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer">
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTableDemo({ onRefresh, onDocumentClick, setSelectedIds }: DataTableDemoProps) {
  const [documents, setDocuments] = React.useState<DocumentData[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedIds, setSelectedIdsState] = React.useState<string>("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 8,
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
    const currentIds = selectedIds.split(",").filter(Boolean);
    const newSelectedIds = currentIds.includes(document.id)
      ? currentIds.filter(id => id !== document.id).join(",")
      : [...currentIds, document.id].join(",");
    setSelectedIdsState(newSelectedIds);
    setSelectedIds(newSelectedIds);
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

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight italic text-zinc-900 dark:text-zinc-100">Gérer vos documents</h1>
          <p className="text-sm text-zinc-500">Gérez, visualisez et organisez vos documents classés par l&apos;IA.</p>
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
            className="pl-10 h-11 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl gap-2 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
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
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/30 dark:bg-zinc-950/30 backdrop-blur-sm shadow-sm transition-all duration-300">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
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
                  className="cursor-pointer group hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <p className="font-bold italic">Aucun résultat trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} document(s) sélectionné(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-xs font-bold text-zinc-500 px-2 uppercase tracking-tighter">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-9 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50"
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
