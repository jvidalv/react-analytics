"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  useUpdateError,
  useErrorById,
  AnalyticsError,
} from "@/domains/app/errors/errors.api";
import { useMe } from "@/domains/user/me.api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Bug, Eye, Globe, Loader2 } from "lucide-react";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  appSlug: string;
  errorId?: string | null;
  onErrorIdChange: (id: string | null) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  appSlug,
  errorId,
  onErrorIdChange,
}: DataTableProps<TData, TValue>) {
  const { me } = useMe();
  const updateError = useUpdateError(appSlug, me?.devModeEnabled);

  // Fetch error by ID from URL
  const { error: selectedError, isLoading: isLoadingError } = useErrorById(
    appSlug,
    me?.devModeEnabled,
    errorId,
  );

  // Note editing dialog state
  const [editingNoteErrorId, setEditingNoteErrorId] = useState<string | null>(
    null,
  );
  const [editingNoteValue, setEditingNoteValue] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Sheet note state
  const [sheetNoteValue, setSheetNoteValue] = useState("");
  const [isSavingSheetNote, setIsSavingSheetNote] = useState(false);

  // Sync sheet note value when error changes
  const [lastErrorId, setLastErrorId] = useState<string | null>(null);
  if (selectedError && selectedError.id !== lastErrorId) {
    setSheetNoteValue(selectedError.notes || "");
    setLastErrorId(selectedError.id);
  }

  const handleViewError = (error: AnalyticsError) => {
    onErrorIdChange(error.id);
  };

  const handleCloseSheet = () => {
    onErrorIdChange(null);
    setSheetNoteValue("");
    setLastErrorId(null);
  };

  const handleMarkSeen = async (errId: string) => {
    try {
      await updateError.mutateAsync({ errorId: errId, status: "seen" });
      toast.success("Error marked as seen");
    } catch (_error) {
      toast.error("Failed to update error");
    }
  };

  const handleMarkFixed = async (errId: string) => {
    try {
      await updateError.mutateAsync({ errorId: errId, status: "fixed" });
      toast.success("Error marked as fixed");
      handleCloseSheet();
    } catch (_error) {
      toast.error("Failed to update error");
    }
  };

  const handleEditNote = (errorId: string, currentNotes: string | null) => {
    setEditingNoteErrorId(errorId);
    setEditingNoteValue(currentNotes || "");
  };

  const handleSaveNote = async () => {
    if (!editingNoteErrorId) return;

    setIsSavingNote(true);
    try {
      const newNotes = editingNoteValue.trim() || null;
      await updateError.mutateAsync({
        errorId: editingNoteErrorId,
        notes: newNotes,
      });
      toast.success("Note saved");
      // Update sheet note if it's the same error
      if (selectedError?.id === editingNoteErrorId) {
        setSheetNoteValue(newNotes || "");
      }
      setEditingNoteErrorId(null);
      setEditingNoteValue("");
    } catch (_error) {
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSaveSheetNote = async () => {
    if (!selectedError) return;

    setIsSavingSheetNote(true);
    try {
      const newNotes = sheetNoteValue.trim() || null;
      await updateError.mutateAsync({
        errorId: selectedError.id,
        notes: newNotes,
      });
      toast.success("Note saved");
    } catch (_error) {
      toast.error("Failed to save note");
    } finally {
      setIsSavingSheetNote(false);
    }
  };

  const handleCloseNoteDialog = () => {
    setEditingNoteErrorId(null);
    setEditingNoteValue("");
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onMarkSeen: handleMarkSeen,
      onMarkFixed: handleMarkFixed,
      onEditNote: handleEditNote,
      onViewError: handleViewError,
    },
  });

  return (
    <>
      <div className="border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const width = header.getSize();
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground"
                      style={
                        width !== 150 ? { width: `${width}px` } : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const width = cell.column.getSize();
                    return (
                      <TableCell
                        key={cell.id}
                        style={
                          width !== 150 ? { width: `${width}px` } : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No errors yet. Errors will appear here when tracked via{" "}
                  <code>analytics.error()</code> or caught by the ErrorBoundary.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={editingNoteErrorId !== null}
        onOpenChange={(open) => !open && handleCloseNoteDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Add a private note to this error. Notes are only visible to you
              and your team.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingNoteValue}
            onChange={(e) => setEditingNoteValue(e.target.value)}
            placeholder="Add your note here..."
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseNoteDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={isSavingNote}>
              {isSavingNote ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={!!errorId}
        onOpenChange={(open) => !open && handleCloseSheet()}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Error Details</SheetTitle>
            {selectedError && (
              <SheetDescription>
                Occurred{" "}
                {format(new Date(selectedError.date), "d MMM yyyy 'at' HH:mm")}
              </SheetDescription>
            )}
          </SheetHeader>

          {isLoadingError ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedError ? (
            <>
              <div className="flex flex-col gap-6 p-4">
                {/* Error Message */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Error Message
                  </Label>
                  <div className="bg-destructive/10 border border-destructive/20 p-4">
                    <p className="font-mono text-sm break-all">
                      {selectedError.message}
                    </p>
                    {selectedError.name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {selectedError.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stack Trace */}
                {selectedError.stack && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Stack Trace
                    </Label>
                    <div className="bg-muted/50 p-4 overflow-x-auto max-h-48 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {selectedError.stack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Component Stack */}
                {selectedError.componentStack && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Component Stack
                    </Label>
                    <div className="bg-muted/50 p-4 overflow-x-auto max-h-32 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {selectedError.componentStack}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Status
                    </Label>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        selectedError.status === "new" &&
                          "bg-red-500/20 text-red-400 border-red-500/50",
                        selectedError.status === "seen" &&
                          "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
                        selectedError.status === "fixed" &&
                          "bg-green-500/20 text-green-400 border-green-500/50",
                      )}
                    >
                      {selectedError.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Source
                    </Label>
                    <p className="text-sm">
                      {selectedError.source || "Manual"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Route
                    </Label>
                    <p className="text-sm font-mono break-all">
                      {selectedError.route || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Platform
                    </Label>
                    <div className="flex items-center gap-1">
                      {selectedError.platform === "iOS" && (
                        <IosIcon className="size-4" />
                      )}
                      {selectedError.platform === "Android" && (
                        <AndroidIcon className="size-4" />
                      )}
                      {(!selectedError.platform ||
                        selectedError.platform === "Web") && (
                        <Globe className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">
                        {selectedError.platform || "Web"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Country
                    </Label>
                    {selectedError.country ? (
                      <div className="flex items-center gap-1">
                        <span>{countryCodeToFlag(selectedError.country)}</span>
                        <span className="text-sm">
                          {getCountryName(selectedError.country)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unknown
                      </span>
                    )}
                  </div>
                  {selectedError.browser && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        Browser
                      </Label>
                      <p className="text-sm">{selectedError.browser}</p>
                    </div>
                  )}
                  {selectedError.osVersion && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                        OS Version
                      </Label>
                      <p className="text-sm">{selectedError.osVersion}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      App Version
                    </Label>
                    <p className="text-sm font-mono">
                      {selectedError.appVersion || "-"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Device ID
                    </Label>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {selectedError.identifyId}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                {(selectedError.userName || selectedError.userEmail) && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      User
                    </Label>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={selectedError.userAvatar || undefined}
                        />
                        <AvatarFallback>
                          {selectedError.userName
                            ? selectedError.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : selectedError.userEmail?.[0]?.toUpperCase() ||
                              "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        {selectedError.userName && (
                          <span className="font-medium sensitive">
                            {selectedError.userName}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground sensitive">
                          {selectedError.userEmail || selectedError.identifyId}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Notes
                  </Label>
                  <Textarea
                    value={sheetNoteValue}
                    onChange={(e) => setSheetNoteValue(e.target.value)}
                    placeholder="Add a private note..."
                    rows={3}
                    className="resize-none"
                  />
                  {sheetNoteValue !== (selectedError.notes || "") && (
                    <Button
                      size="sm"
                      onClick={handleSaveSheetNote}
                      disabled={isSavingSheetNote}
                    >
                      {isSavingSheetNote ? "Saving..." : "Save Note"}
                    </Button>
                  )}
                </div>
              </div>

              <SheetFooter className="flex-row gap-2">
                {selectedError.status === "new" && (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkSeen(selectedError.id)}
                    className="flex-1"
                  >
                    <Eye className="size-4" />
                    Mark as Seen
                  </Button>
                )}
                {selectedError.status !== "fixed" && (
                  <Button
                    onClick={() => handleMarkFixed(selectedError.id)}
                    className="flex-1"
                  >
                    <Bug className="size-4" />
                    Mark as Fixed
                  </Button>
                )}
              </SheetFooter>
            </>
          ) : errorId ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-muted-foreground">Error not found</p>
              <Button variant="outline" onClick={handleCloseSheet}>
                Close
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
