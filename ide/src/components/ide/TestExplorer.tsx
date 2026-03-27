import { Beaker, ChevronDown, ChevronRight, FileCode2, FolderTree, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseRustTests, type RustDiscoveredTest } from "@/lib/rustTestParser";

type WorkspaceFile = {
  path: string;
  content?: string;
};

type TreeNode =
  | {
      id: string;
      type: "file" | "module";
      label: string;
      children: TreeNode[];
    }
  | {
      id: string;
      type: "test";
      label: string;
      test: RustDiscoveredTest;
    };

interface TestExplorerProps {
  files: WorkspaceFile[];
  onOpenTest?: (test: RustDiscoveredTest) => void;
  onRunTest?: (test: RustDiscoveredTest) => void;
}

function insertTest(tree: TreeNode[], test: RustDiscoveredTest): void {
  let fileNode = tree.find(
    (node): node is Extract<TreeNode, { type: "file" }> =>
      node.type === "file" && node.label === test.filePath
  );

  if (!fileNode) {
    fileNode = {
      id: `file:${test.filePath}`,
      type: "file",
      label: test.filePath,
      children: [],
    };
    tree.push(fileNode);
  }

  let cursor = fileNode.children;

  for (const mod of test.modulePath) {
    let modNode = cursor.find(
      (node): node is Extract<TreeNode, { type: "module" }> =>
        node.type === "module" && node.label === mod
    );

    if (!modNode) {
      modNode = {
        id: `${fileNode.id}:mod:${test.modulePath.join("::")}:${mod}`,
        type: "module",
        label: mod,
        children: [],
      };
      cursor.push(modNode);
    }

    cursor = modNode.children;
  }

  cursor.push({
    id: test.id,
    type: "test",
    label: test.testName,
    test,
  });
}

function buildTree(files: WorkspaceFile[]): TreeNode[] {
  const tree: TreeNode[] = [];

  for (const file of files) {
    if (!file.path.endsWith(".rs") || !file.content) continue;
    const tests = parseRustTests(file.path, file.content);
    for (const test of tests) {
      insertTest(tree, test);
    }
  }

  return tree.sort((a, b) => a.label.localeCompare(b.label));
}

function countTests(nodes: TreeNode[]): number {
  return nodes.reduce((acc, node) => {
    if (node.type === "test") return acc + 1;
    return acc + countTests(node.children);
  }, 0);
}

function collectBranchIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];

  for (const node of nodes) {
    if (node.type !== "test") {
      ids.push(node.id);
      ids.push(...collectBranchIds(node.children));
    }
  }

  return ids;
}

function TreeRow({
  node,
  depth,
  expanded,
  toggle,
  onOpenTest,
  onRunTest,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onOpenTest?: (test: RustDiscoveredTest) => void;
  onRunTest?: (test: RustDiscoveredTest) => void;
}) {
  const isBranch = node.type !== "test";
  const isOpen = expanded.has(node.id);

  return (
    <div>
      <div
        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {isBranch ? (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            className="flex h-4 w-4 items-center justify-center"
            aria-label={isOpen ? "Collapse" : "Expand"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="inline-block h-4 w-4" />
        )}

        {node.type === "file" && (
          <FileCode2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        {node.type === "module" && (
          <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        {node.type === "test" && (
          <Beaker className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        {node.type === "test" ? (
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left"
            onClick={() => onOpenTest?.(node.test)}
            title={`${node.test.filePath}:${node.test.line}`}
          >
            {node.label}
          </button>
        ) : (
          <div className="min-w-0 flex-1 truncate" title={node.label}>
            {node.label}
          </div>
        )}

        {node.type === "test" && (
          <button
            type="button"
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRunTest?.(node.test)}
            title="Run test"
            aria-label={`Run ${node.test.testName}`}
          >
            <Play className="h-4 w-4" />
          </button>
        )}
      </div>

      {isBranch && isOpen && (
        <div>
          {node.children
            .slice()
            .sort((a, b) => {
              if (a.type === "test" && b.type !== "test") return 1;
              if (a.type !== "test" && b.type === "test") return -1;
              return a.label.localeCompare(b.label);
            })
            .map((child) => (
              <TreeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                toggle={toggle}
                onOpenTest={onOpenTest}
                onRunTest={onRunTest}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function TestExplorer({
  files,
  onOpenTest,
  onRunTest,
}: TestExplorerProps) {
  const tree = useMemo(() => buildTree(files), [files]);
  const total = useMemo(() => countTests(tree), [tree]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const branchIds = collectBranchIds(tree);
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of branchIds) {
        if (!prev.has(id)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [tree]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Test Explorer</div>
          <Beaker className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">
          {total} discovered {total === 1 ? "test" : "tests"}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {tree.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No Rust tests found in the workspace.
            </div>
          ) : (
            tree.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                toggle={toggle}
                onOpenTest={onOpenTest}
                onRunTest={onRunTest}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}