// scripts/scaffold-screen.ts
import * as fs from "node:fs";
import * as path from "node:path";

type Opts = {
	slug: string;
	pascal: string;
	api: boolean;
	parent: string;
	force: boolean;
	pages: boolean;
};

function die(msg: string): never {
	console.error(msg);
	process.exit(1);
}

function toKebab(input: string): string {
	const s = input
		.trim()
		.replace(/[_\s]+/g, "-")
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/[^a-zA-Z0-9-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();
	if (!s) die("Screen name is empty/invalid.");
	return s;
}

function toPascal(kebab: string): string {
	return kebab
		.split("-")
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join("");
}

function ensureDir(dirPath: string) {
	fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileSafe(filePath: string, content: string, force: boolean) {
	if (fs.existsSync(filePath) && !force) return;
	ensureDir(path.dirname(filePath));
	fs.writeFileSync(filePath, content, "utf8");
}

/**
 * Add an export line to a barrel file but avoid duplicates (whitespace/quote tolerant).
 */
function upsertLine(filePath: string, exportSlug: string, forceCreate = true) {
	const line = `export * from "./${exportSlug}";`;
	ensureDir(path.dirname(filePath));
	if (!fs.existsSync(filePath)) {
		if (!forceCreate) return;
		fs.writeFileSync(filePath, line + "\n", "utf8");
		return;
	}
	const existing = fs.readFileSync(filePath, "utf8");
	const re = new RegExp(`export\\s*\\*\\s*from\\s*['"]\\./${escapeRegExp(exportSlug)}['"]`);
	if (re.test(existing)) return;
	// append with single newline
	const next = existing.replace(/\s*$/, "\n") + line + "\n";
	fs.writeFileSync(filePath, next, "utf8");
}

function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(argv: string[]): Opts {
	// first non-flag arg is the screen name
	const positional = argv.find((a) => !a.startsWith("--"));
	if (!positional) {
		die(
			[
				"Missing screen name.",
				"Usage: bun scripts/scaffold-screen.ts <screen-name> [--api] [--parent=app/(_authenticated)] [--force] [--no-pages]"
			].join("\n")
		);
	}

	const api = argv.includes("--api") || argv.includes("--with-api");
	const force = argv.includes("--force");
	const pages = !argv.includes("--no-pages");

	let parent = "app/(_authenticated)";
	const parentArg = argv.find((a) => a.startsWith("--parent="));
	if (parentArg) {
		parent = parentArg.replace("--parent=", "").trim();
	} else {
		const pIdx = argv.findIndex((a) => a === "--parent");
		if (pIdx >= 0 && argv[pIdx + 1]) parent = argv[pIdx + 1].trim();
	}

	parent = parent.replace(/^\/+/, "").replace(/\/+$/, "");
	if (!parent) die("Invalid --parent value.");

	const slug = toKebab(positional);
	const pascal = toPascal(slug);

	return { slug, pascal, api, parent, force, pages };
}

function main() {
	const opts = parseArgs(process.argv.slice(2));
	const ROOT = process.cwd();
	const SRC = path.join(ROOT, "src");

	// 1) screens-component scaffold
	const screenRoot = path.join(SRC, "components", "screens-component", opts.slug);
	ensureDir(screenRoot);
	ensureDir(path.join(screenRoot, "components"));
	ensureDir(path.join(screenRoot, "web-layout"));
	ensureDir(path.join(screenRoot, "mob-layout"));

	writeFileSafe(
		path.join(screenRoot, "index.ts"),
		`export { ${opts.pascal}WebLayout } from './web-layout';
export { ${opts.pascal}MobileLayout } from './mob-layout';
`,
		opts.force
	);

	writeFileSafe(
		path.join(screenRoot, "web-layout", "index.tsx"),
		`export function ${opts.pascal}WebLayout() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">${opts.pascal} (Web)</h1>
    </div>
  );
}
`,
		opts.force
	);

	writeFileSafe(
		path.join(screenRoot, "mob-layout", "index.tsx"),
		`export function ${opts.pascal}MobileLayout() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">${opts.pascal} (Mobile)</h1>
    </div>
  );
}
`,
		opts.force
	);

	writeFileSafe(
		path.join(screenRoot, "components", "index.ts"),
		`// Put screen-specific components here
export {};
`,
		opts.force
	);

	// 2) pages scaffold (optional)
	if (opts.pages) {
		const pageRoot = path.join(SRC, "pages", ...opts.parent.split("/"), opts.slug);
		ensureDir(pageRoot);

		writeFileSafe(
			path.join(pageRoot, "index.tsx"),
			`import { ${opts.pascal}WebLayout } from "@/components/screens-component/${opts.slug}/web-layout";
import { ${opts.pascal}MobileLayout } from "@/components/screens-component/${opts.slug}/mob-layout";
import { useIsMobile } from "@/hooks/use-mobile";

function ${opts.pascal}() {
  const isMobile = useIsMobile();
  return isMobile ? <${opts.pascal}MobileLayout /> : <${opts.pascal}WebLayout />;
}

export default ${opts.pascal};
`,
			opts.force
		);

		const routeId = `/${opts.parent}/${opts.slug}`.replace(/\/+/g, "/");
		writeFileSafe(
			path.join(pageRoot, "routes.ts"),
			`import { createFileRoute } from "@tanstack/react-router";
import ${opts.pascal} from "./index";

export const Route = createFileRoute("${routeId}")({
  component: ${opts.pascal},
});
`,
			opts.force
		);
	}

	// 3) hooks/apis scaffold (optional)
	if (opts.api) {
		const apiRoot = path.join(SRC, "hooks", "apis", opts.slug);
		ensureDir(apiRoot);

		writeFileSafe(
			path.join(apiRoot, "queries.ts"),
			`// TODO: add queries for ${opts.slug}
export const ${opts.pascal}Queries = {} as const;
`,
			opts.force
		);

		writeFileSafe(
			path.join(apiRoot, "type.ts"),
			`// TODO: add types for ${opts.slug}
export type ${opts.pascal}ApiTypes = Record<string, never>;
`,
			opts.force
		);

		// use conventional filename
		writeFileSafe(
			path.join(apiRoot, "mutations.ts"),
			`// TODO: add mutations for ${opts.slug}
export const ${opts.pascal}Mutations = {} as const;
`,
			opts.force
		);

		writeFileSafe(
			path.join(apiRoot, "index.ts"),
			`export * from "./queries";
export * from "./type";
export * from "./mutations";
`,
			opts.force
		);

		// Append export to src/hooks/apis/index.ts (safe upsert)
		const apisBarrel = path.join(SRC, "hooks", "apis", "index.ts");
		upsertLine(apisBarrel, opts.slug);
	}

	console.log(`Created/updated screen scaffold for: ${opts.slug}`);
	console.log(`- screens-component: src/components/screens-component/${opts.slug}`);
	console.log(opts.pages ? `- pages: src/pages/${opts.parent}/${opts.slug}` : `- pages: (skipped)`);
	console.log(
		opts.api
			? `- api: src/hooks/apis/${opts.slug} + updated hooks/apis/index.ts`
			: `- api: (skipped)`
	);
}

main();
