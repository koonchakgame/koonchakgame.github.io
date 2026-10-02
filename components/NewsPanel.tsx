import { Panel } from "./Panels";
export default function NewsPanel({
  title = "News summary",
  text,
}: {
  title?: string;
  text: string;
}) {
  return (
    <Panel title={title}>
      <p className="summary-text">{text}</p>
    </Panel>
  );
}
