export default function LoadingTemplates() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-56 bg-muted rounded" />
      <div className="rounded border p-4 space-y-4">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-9 bg-muted rounded" />
          <div className="h-9 bg-muted rounded" />
          <div className="h-9 bg-muted rounded" />
          <div className="h-9 bg-muted rounded" />
          <div className="h-9 md:col-span-2 bg-muted rounded" />
          <div className="h-40 md:col-span-2 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="rounded border">
        <div className="h-10 bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-6 bg-muted rounded" />
          <div className="h-6 bg-muted rounded" />
          <div className="h-6 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
