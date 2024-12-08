"use client"; // Assurez-vous que votre composant est un composant client

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
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search, SearchIcon, Settings, UserCheck } from "lucide-react";
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
// Importer la fonction fetchDocuments
import { DocumentData } from "@/types/types"; // Importer le type DocumentData
import { fetchDocuments } from "@/lib/services/CRUD/fetchDocument";
import { useState } from "react";
import DocumentPreview from "./DocumentPreview";

import DropdownMenuplus from "@/components/ui/DropdownMenu";
import {
  LayoutGridIcon,
  TrashIcon,
  Building2,
 
  SettingsIcon,
  ChevronRightIcon,
  BellIcon,
  FilePlus2
} from "lucide-react"


// Ajout d'une interface pour les props
interface DataTableDemoProps {
  onDocumentClick: (document: DocumentData) => void;
  setSelectedIds: (ids: string) => void; 
  onRefresh: (refresh: () => void) => void; // Prop pour gérer la prévisualisation

}
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
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "classification",
    header: "Classification",
    cell: ({ row }) => <div className="capitalize">{row.getValue("classification")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "size",
    header: "Taille (bytes)",
    cell: ({ row }) => <div>{row.getValue("size")}</div>,
  },
  {
    accessorKey: "url", // Ajout de la colonne URL
    header: "URL du document",
    cell: ({ row }) => {
      const url = row.getValue("url") as string | undefined;
      const document = row.original; // Obtenez le document original
     

      return (
        <div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download={name} // Ajoutez cet attribut pour permettre le téléchargement
        >
          <Eye />
        </a>
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(document.id)}
            >
              Copier l&apos;ID du document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Plus</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTableDemo({ onRefresh ,onDocumentClick,setSelectedIds }: DataTableDemoProps) {
  const [documents, setDocuments] = React.useState<DocumentData[]>([]); // État pour stocker les documents
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedIds, setSelectedIdsState] = React.useState<string>("");

  // État pour la pagination
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 6, // Limite de 6 lignes par page
  });

  React.useEffect(() => {
    const loadDocuments = async () => {
      try {
        const fetchedDocuments = await fetchDocuments();  // Récupère les documents
        setDocuments(fetchedDocuments);  // Met à jour l'état avec les documents récupérés
      } catch (error) {
        console.error("Erreur lors de la récupération des documents :", error);
      }
    };
    loadDocuments(); 
    onRefresh(loadDocuments);  // Passe la fonction de rafraîchissement pour être utilisée ailleurs
     // Récupère les documents à l'initialisation
  }, [onRefresh]);  // Ajoute `onRefresh` dans la dépendance si c'est une prop modifiable
  
  
      

    // Fonction pour gérer le clic sur une ligne
    const handleRowClick = (document: DocumentData) => {
      onDocumentClick(document); // Envoyer le document sélectionné au parent pour l'aperçu
      
      const currentIds = selectedIds.split(",").filter(Boolean); // Convertit la chaîne en tableau et filtre les valeurs vides
    const newSelectedIds = currentIds.includes(document.id)
      ? currentIds.filter(id => id !== document.id).join(",") // Désélectionner si déjà sélectionné
      : [...currentIds, document.id].join(","); // Ajouter à la sélection si non sélectionné

    setSelectedIdsState(newSelectedIds); // Mettre à jour l'état local
    setSelectedIds(newSelectedIds);
    
    
    };

    const items = [
      { icon: <FilePlus2 size={16} />, name: "Nouveau document", href: "/documents/nouveau_document" },
      { icon: <Search size={16} />, name: "Nouvelle recherche", href: "/recherche" },
      { icon: <UserCheck size={16} />, name: "Inviter un contact", href: "/inviter-contact" },
      { icon: <Settings size={16} />, name: "Réglage", href: "/account" },
      {
        icon: <TrashIcon size={16} />,
        name: "Supprimer",
        customStyle:
          "!text-red-500 hover:bg-red-500/10 focus-visible:text-red-500 focus-visible:bg-red-500/10 focus-visible:border-red-500/10",
      },
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
      pagination, // Ajoutez l'état de pagination ici
    },
  });
 



  const paginatedData = table.getPaginationRowModel().rows; 

  // Vérifiez si les résultats sont vides
  const isNoResults = paginatedData.length === 0;

  return (
    <div className="w-full">
       <h1 className="text-3xl font-bold text-start  text-blue-600">Gérer vos documents</h1>
      <div className="flex items-center py-2">
        <Input
          placeholder="Recherchez votre document..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className={`max-w-sm focus:transparent ${isNoResults ? "border-red-500 border-solid" :"border-green-500" } `} // Modifiez la classe en fonction des résultats
        />

        <DropdownMenuplus items={items} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border h-[300px] overflow-auto"> {/* Ajustez la hauteur ici */}
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                   onClick={() => handleRowClick(row.original)} className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionné(s).
        </div>
        <div className="flex items-center space-x-2">
  <ButtonAnimation
    variant="expandIcon"
    Icon={ChevronLeft}
    iconPlacement="left"
    size="sm"
    onClick={() => {
      if (pagination.pageIndex > 0) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex - 1,
        }));
      }
    }}
    disabled={pagination.pageIndex === 0}
  >
    Avant
  </ButtonAnimation>
  <ButtonAnimation
    variant="expandIcon"
    Icon={ChevronRight}
    iconPlacement="right"
    size="sm"
    onClick={() => {
      if (
        pagination.pageIndex < table.getPageCount() - 1 &&
        table.getFilteredRowModel().rows.length > 0
      ) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex + 1,
        }));
      }
    }}
    disabled={
      pagination.pageIndex >= table.getPageCount() - 1 ||
      table.getFilteredRowModel().rows.length === 0
    }
  >
    Suivant
  </ButtonAnimation>
</div>

      </div>
     
    </div>
  );
}
