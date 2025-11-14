import { ReactNode, FC } from "react";

export const JsonDisplay: FC<{
  title: ReactNode;
  data?: Record<string, unknown>;
}> = ({ data, title }) => {
  const renderValue = (value: unknown) => {
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    if (value === null) {
      return "-";
    }

    if (typeof value === "object") {
      return (
        <div className="my-2 flex flex-col gap-2 border-l pl-4">
          {Object.entries(value).map(([key, subValue]) => (
            <div key={key} className="flex flex-col">
              <span className="text-muted-foreground">{key}</span>
              <span>{renderValue(subValue)}</span>
            </div>
          ))}
        </div>
      );
    }

    return value?.toString();
  };

  const entries = data ? Object.entries(data) : [];

  return (
    <div className="w-full max-w-md p-1">
      {typeof title === "string" ? (
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      ) : (
        title
      )}
      {entries?.length ? (
        <div className="flex flex-col gap-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="block font-medium text-muted-foreground">
                {key}
              </label>
              <div>{renderValue(value)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm font-medium text-muted-foreground">No data</div>
      )}
    </div>
  );
};
