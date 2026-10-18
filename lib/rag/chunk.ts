export type DocChunk = { ord: number; heading: string; content: string };

const MAX_SECTION = 900;

/** 去掉 frontmatter，返回正文 */
export function stripFrontmatter(raw: string): string {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return (m ? raw.slice(m[0].length) : raw).trim();
}

/** 去掉运行时 MDX 的 import 行（对检索无意义） */
function cleanForIndex(text: string): string {
  return text
    .split('\n')
    .filter((l) => !/^\s*import\s.+from\s.+;?\s*$/.test(l))
    .join('\n')
    .trim();
}

/** 单段超长时按段落打包切分（不重叠，够用且简单） */
function splitLong(text: string): string[] {
  if (text.length <= MAX_SECTION) return [text];
  const paras = text.split(/\n{2,}/);
  const out: string[] = [];
  let buf = '';
  for (const p of paras) {
    if (buf && `${buf}\n\n${p}`.length > MAX_SECTION) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
    while (buf.length > MAX_SECTION * 1.5) {
      out.push(buf.slice(0, MAX_SECTION).trim());
      buf = buf.slice(MAX_SECTION);
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/**
 * 按标题层级把一篇文档切成检索分块。
 * heading 为标题路径（如 "快速上手 › 后台写文档"）；无标题的引言段 heading 为空。
 */
export function chunkDoc(raw: string, fallbackTitle = ''): DocChunk[] {
  const body = cleanForIndex(stripFrontmatter(raw));
  const lines = body.split('\n');

  type Section = { heading: string; lines: string[] };
  const sections: Section[] = [];
  const stack: string[] = [];
  let cur: Section = { heading: '', lines: [] };
  const pushCur = () => {
    if (cur.lines.join('').trim()) sections.push(cur);
  };

  for (const line of lines) {
    const h = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (h) {
      pushCur();
      const level = h[1].length;
      stack.length = level - 1;
      stack[level - 1] = h[2];
      cur = { heading: stack.filter(Boolean).join(' › '), lines: [] };
    } else {
      cur.lines.push(line);
    }
  }
  pushCur();

  const out: DocChunk[] = [];
  let ord = 0;
  for (const s of sections) {
    for (const part of splitLong(s.lines.join('\n').trim())) {
      if (part.trim().length < 8) continue;
      out.push({
        ord: ord++,
        heading: s.heading || fallbackTitle,
        content: part,
      });
    }
  }
  return out;
}
