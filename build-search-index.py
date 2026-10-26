import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "search-index.json"
EXCLUDED_DIRECTORIES = {".git", "node_modules"}
SKIPPED_TAGS = {"script", "style", "noscript", "template"}


class PageTextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.description = ""
        self.text_parts = []
        self.in_title = False
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta" and attributes.get("name", "").lower() == "description":
            self.description = attributes.get("content", "")
        elif tag in SKIPPED_TAGS:
            self.skip_depth += 1
        elif tag == "img" and not self.skip_depth:
            alt = attributes.get("alt", "").strip()
            if alt:
                self.text_parts.append(alt)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag in SKIPPED_TAGS and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        elif not self.skip_depth:
            self.text_parts.append(data)


def read_html(path):
    data = path.read_bytes()
    if data.startswith((b"\xff\xfe", b"\xfe\xff")):
        return data.decode("utf-16")
    if data.startswith(b"\xef\xbb\xbf"):
        return data.decode("utf-8-sig")
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("cp1251")


def normalized_text(parts):
    return " ".join(" ".join(parts).split())


def build_page_record(path):
    relative_path = path.relative_to(ROOT).as_posix()
    parser = PageTextParser()
    parser.feed(read_html(path))
    title = normalized_text(parser.title_parts) or path.stem
    return {
        "title": title,
        "href": "/" + quote(relative_path, safe="/"),
        "path": relative_path,
        "description": normalized_text([parser.description]),
        "text": normalized_text(parser.text_parts),
    }


def main():
    pages = sorted(
        path
        for path in ROOT.rglob("*.html")
        if path.is_file()
        and not any(part in EXCLUDED_DIRECTORIES for part in path.parts)
    )
    records = [build_page_record(path) for path in pages]
    OUTPUT.write_text(
        json.dumps(records, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Indexed {len(records)} HTML pages into {OUTPUT.name}.")


if __name__ == "__main__":
    main()
