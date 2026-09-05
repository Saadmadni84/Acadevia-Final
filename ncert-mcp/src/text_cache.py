"""
PDF → plain-text cache.

Extracted text is stored in data/processed/text_cache/ as
  {code}{ch:02d}.txt

so we never re-parse the same PDF twice.
"""

import argparse
from pathlib import Path
import re
import sys
import pdfplumber
from rich.console import Console

# Ensure src/ is in sys.path when run directly
sys.path.insert(0, str(Path(__file__).parent))

from config import NCERT_PDF_DIR, PROCESSED

TEXT_CACHE_DIR = PROCESSED / "text_cache"
console = Console()


def _cache_path(pdf_path: Path) -> Path:
    TEXT_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return TEXT_CACHE_DIR / (pdf_path.stem + ".txt")


def is_valid_cache(cache_path: Path) -> bool:
    """Return True if the cached text file exists and has non-zero size."""
    return cache_path.exists() and cache_path.stat().st_size > 0


def extract_text(pdf_path: Path, force: bool = False) -> str:
    """Extract all text from a PDF, caching the result to disk."""
    cache = _cache_path(pdf_path)
    if not force and is_valid_cache(cache):
        return cache.read_text(encoding="utf-8")

    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                pages.append(t)
    text = "\n\n".join(pages)
    cache.write_text(text, encoding="utf-8")
    return text


def extract_page_count(pdf_path: Path) -> int:
    with pdfplumber.open(pdf_path) as pdf:
        return len(pdf.pages)


def _parse_pdf_info(pdf_path: Path) -> tuple[int | None, str, str, int | None]:
    """
    Extract (grade, subject, code, chapter) from PDF path and filename.
    Format on disk: .../grade_{g}/{subject}/{code}{ch:02d}.pdf
    """
    subject = pdf_path.parent.name
    grade_dir = pdf_path.parent.parent.name
    grade = None
    if grade_dir.startswith("grade_"):
        try:
            grade = int(grade_dir.replace("grade_", ""))
        except ValueError:
            pass

    stem = pdf_path.stem
    code = stem[:5]
    chapter = None
    if len(stem) >= 7:
        try:
            chapter = int(stem[5:])
        except ValueError:
            pass

    return grade, subject, code, chapter


def populate_text_cache(
    grades: "list[int] | None" = None,
    subjects: "list[str] | None" = None,
    chapters: "list[int] | None" = None,
    limit: "int | None" = None,
    force: bool = False,
) -> dict[str, int]:
    """
    Scans data/raw/ncert_pdfs/ and extracts text into data/processed/text_cache/.
    Idempotent: skips chapters whose cache is already non-empty.
    Never modifies original PDFs.
    """
    TEXT_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    if not NCERT_PDF_DIR.exists():
        console.print(f"[red]Error: PDF directory not found at {NCERT_PDF_DIR}[/red]")
        return {"extracted": 0, "skipped": 0, "failed": 0}

    all_pdfs = sorted(NCERT_PDF_DIR.rglob("*.pdf"))
    target_pdfs = []

    for p in all_pdfs:
        g, s, code, ch = _parse_pdf_info(p)

        if grades is not None and g not in grades:
            continue
        if subjects is not None:
            subject_matches = any(s.lower() == target.lower() for target in subjects)
            if not subject_matches:
                continue
        if chapters is not None and ch not in chapters:
            continue

        target_pdfs.append((p, g, s, code, ch))

    if limit is not None and limit > 0:
        target_pdfs = target_pdfs[:limit]

    total = len(target_pdfs)
    console.print(f"[bold cyan]Found {total} PDF(s) matching criteria for text extraction.[/bold cyan]")

    extracted = 0
    skipped = 0
    failed = 0

    for idx, (pdf_path, g, s, code, ch) in enumerate(target_pdfs, 1):
        cache_file = _cache_path(pdf_path)
        label = f"Grade {g} {s} Ch {ch:02d} ({pdf_path.name})" if (g and ch) else pdf_path.name

        if not force and is_valid_cache(cache_file):
            console.print(f"[dim][{idx}/{total}] Skipped (cached): {label} -> {cache_file.name}[/dim]")
            skipped += 1
            continue

        try:
            text = extract_text(pdf_path, force=force)
            if text.strip():
                chars = len(text)
                console.print(f"[green][{idx}/{total}] Extracted: {label} -> {cache_file.name} ({chars:,} chars)[/green]")
                extracted += 1
            else:
                console.print(f"[yellow][{idx}/{total}] Warning: Extracted empty text from {label}[/yellow]")
                failed += 1
        except Exception as e:
            console.print(f"[red][{idx}/{total}] Failed: {label} - {e}[/red]")
            failed += 1

    summary = {"extracted": extracted, "skipped": skipped, "failed": failed}
    console.print(
        f"\n[bold]Text Extraction Summary:[/bold] "
        f"[green]Extracted: {extracted}[/green], "
        f"[yellow]Skipped: {skipped}[/yellow], "
        f"[red]Failed: {failed}[/red]"
    )
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract text from NCERT PDFs to data/processed/text_cache/")
    parser.add_argument("--grades", nargs="+", type=int, help="Limit to specific grade numbers (e.g. 9)")
    parser.add_argument("--subject", nargs="+", help="Limit to specific subjects (e.g. Mathematics)")
    parser.add_argument("--chapter", nargs="+", type=int, help="Limit to specific chapter numbers (e.g. 1)")
    parser.add_argument("--limit", type=int, help="Max chapters to extract (useful for testing)")
    parser.add_argument("--force", action="store_true", help="Re-extract even if cache already exists")
    args = parser.parse_args()

    populate_text_cache(
        grades=args.grades,
        subjects=args.subject,
        chapters=args.chapter,
        limit=args.limit,
        force=args.force,
    )
