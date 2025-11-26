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
  useUpdateMessage,
  useMessageById,
  Message,
} from "@/domains/app/messages/messages.api";
import { useMe } from "@/domains/user/me.api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, Eye, Globe, Loader2, Mail, Phone } from "lucide-react";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  appSlug: string;
  messageId?: string | null;
  onMessageIdChange: (id: string | null) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  appSlug,
  messageId,
  onMessageIdChange,
}: DataTableProps<TData, TValue>) {
  const { me } = useMe();
  const updateMessage = useUpdateMessage(appSlug, me?.devModeEnabled);

  // Fetch message by ID from URL
  const { message: selectedMessage, isLoading: isLoadingMessage } =
    useMessageById(appSlug, me?.devModeEnabled, messageId);

  // Note editing dialog state
  const [editingNoteMessageId, setEditingNoteMessageId] = useState<
    string | null
  >(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Sheet note state
  const [sheetNoteValue, setSheetNoteValue] = useState("");
  const [isSavingSheetNote, setIsSavingSheetNote] = useState(false);

  // Sync sheet note value when message changes
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  if (selectedMessage && selectedMessage.id !== lastMessageId) {
    setSheetNoteValue(selectedMessage.notes || "");
    setLastMessageId(selectedMessage.id);
  }

  const handleViewMessage = (message: Message) => {
    onMessageIdChange(message.id);
  };

  const handleCloseSheet = () => {
    onMessageIdChange(null);
    setSheetNoteValue("");
    setLastMessageId(null);
  };

  const handleMarkSeen = async (msgId: string) => {
    try {
      await updateMessage.mutateAsync({ messageId: msgId, status: "seen" });
      toast.success("Message marked as seen");
    } catch (_error) {
      toast.error("Failed to update message");
    }
  };

  const handleMarkCompleted = async (msgId: string) => {
    try {
      await updateMessage.mutateAsync({
        messageId: msgId,
        status: "completed",
      });
      toast.success("Message marked as completed");
      handleCloseSheet();
    } catch (_error) {
      toast.error("Failed to update message");
    }
  };

  const handleEditNote = (messageId: string, currentNotes: string | null) => {
    setEditingNoteMessageId(messageId);
    setEditingNoteValue(currentNotes || "");
  };

  const handleSaveNote = async () => {
    if (!editingNoteMessageId) return;

    setIsSavingNote(true);
    try {
      const newNotes = editingNoteValue.trim() || null;
      await updateMessage.mutateAsync({
        messageId: editingNoteMessageId,
        notes: newNotes,
      });
      toast.success("Note saved");
      // Update sheet note if it's the same message
      if (selectedMessage?.id === editingNoteMessageId) {
        setSheetNoteValue(newNotes || "");
      }
      setEditingNoteMessageId(null);
      setEditingNoteValue("");
    } catch (_error) {
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSaveSheetNote = async () => {
    if (!selectedMessage) return;

    setIsSavingSheetNote(true);
    try {
      const newNotes = sheetNoteValue.trim() || null;
      await updateMessage.mutateAsync({
        messageId: selectedMessage.id,
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
    setEditingNoteMessageId(null);
    setEditingNoteValue("");
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onMarkSeen: handleMarkSeen,
      onMarkCompleted: handleMarkCompleted,
      onEditNote: handleEditNote,
      onViewMessage: handleViewMessage,
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
                  No messages yet. Messages will appear here when users submit
                  contact forms using <code>analytics.message()</code>.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={editingNoteMessageId !== null}
        onOpenChange={(open) => !open && handleCloseNoteDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Add a private note to this message. Notes are only visible to you
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
        open={!!messageId}
        onOpenChange={(open) => !open && handleCloseSheet()}
      >
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Message Details</SheetTitle>
            {selectedMessage && (
              <SheetDescription>
                Received{" "}
                {format(
                  new Date(selectedMessage.date),
                  "d MMM yyyy 'at' HH:mm",
                )}
              </SheetDescription>
            )}
          </SheetHeader>

          {isLoadingMessage ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedMessage ? (
            <>
              <div className="flex flex-col gap-6 p-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    From
                  </Label>
                  <div className="flex items-center gap-3">
                    {selectedMessage.userName || selectedMessage.userEmail ? (
                      <>
                        <Avatar className="size-10">
                          <AvatarImage
                            src={selectedMessage.userAvatar || undefined}
                          />
                          <AvatarFallback>
                            {selectedMessage.userName
                              ? selectedMessage.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : selectedMessage.userEmail?.[0]?.toUpperCase() ||
                                "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          {selectedMessage.userName && (
                            <span className="font-medium sensitive">
                              {selectedMessage.userName}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground sensitive">
                            {selectedMessage.userEmail ||
                              selectedMessage.contact}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {selectedMessage.contact.includes("@") ? (
                          <Mail className="size-5 text-muted-foreground" />
                        ) : (
                          <Phone className="size-5 text-muted-foreground" />
                        )}
                        <span className="font-medium sensitive">
                          {selectedMessage.contact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Message
                  </Label>
                  <div className="bg-muted/50 p-4">
                    <p className="whitespace-pre-wrap sensitive">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Status
                    </Label>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        selectedMessage.status === "new" &&
                          "bg-blue-500/20 text-blue-400 border-blue-500/50",
                        selectedMessage.status === "seen" &&
                          "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
                        selectedMessage.status === "completed" &&
                          "bg-green-500/20 text-green-400 border-green-500/50",
                      )}
                    >
                      {selectedMessage.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Platform
                    </Label>
                    <div className="flex items-center gap-1">
                      {selectedMessage.platform === "iOS" && (
                        <IosIcon className="size-4" />
                      )}
                      {selectedMessage.platform === "Android" && (
                        <AndroidIcon className="size-4" />
                      )}
                      {(!selectedMessage.platform ||
                        selectedMessage.platform === "Web") && (
                        <Globe className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">
                        {selectedMessage.platform || "Web"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Country
                    </Label>
                    {selectedMessage.country ? (
                      <div className="flex items-center gap-1">
                        <span>
                          {countryCodeToFlag(selectedMessage.country)}
                        </span>
                        <span className="text-sm">
                          {getCountryName(selectedMessage.country)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unknown
                      </span>
                    )}
                  </div>
                </div>

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
                  {sheetNoteValue !== (selectedMessage.notes || "") && (
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
                {selectedMessage.status === "new" && (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkSeen(selectedMessage.id)}
                    className="flex-1"
                  >
                    <Eye className="size-4" />
                    Mark as Seen
                  </Button>
                )}
                {selectedMessage.status !== "completed" && (
                  <Button
                    onClick={() => handleMarkCompleted(selectedMessage.id)}
                    className="flex-1"
                  >
                    <Check className="size-4" />
                    Mark as Completed
                  </Button>
                )}
              </SheetFooter>
            </>
          ) : messageId ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-muted-foreground">Message not found</p>
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
