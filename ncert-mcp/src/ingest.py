"""
ncert-mcp — NCERT PDF Ingestion

Downloads all NCERT textbook chapter PDFs from ncert.nic.in for Grades 7–12.
Each book is fetched as a zip archive; individual chapter PDFs are extracted
and saved with a JSON metadata sidecar alongside each file.

Usage:
    python src/ingest.py                         # all grades + subjects
    python src/ingest.py --grades 9 10           # specific grades
    python src/ingest.py --grades 7 --subjects Mathematics Science

Safe to re-run — already-downloaded files are skipped.
"""

import asyncio
import argparse
import io
import json
import zipfile
from pathlib import Path
from datetime import datetime

import httpx
import aiofiles
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

import sys
sys.path.insert(0, str(Path(__file__).parent))

from config import NCERT_PDF_DIR
from tools.filesystem import NCERT_TEXTBOOK_CHAPTERS

console = Console()


async def _download_zip(
    client: httpx.AsyncClient,
    code: str,
    num_chapters: int,
    dest_dir: Path,
    grade: int,
    subject: str,
) -> int:
    """
    Download the full-book zip from ncert.nic.in and extract chapter PDFs.
    Returns the number of newly saved PDFs.
    """
    zip_url = f"https://ncert.nic.in/textbook/pdf/{code}dd.zip"
    try:
        resp = await client.get(zip_url, timeout=120.0)
        resp.raise_for_status()
    except Exception as e:
        console.print(f"[yellow]  ! {code} zip unavailable ({e}), falling back to chapter PDFs...[/yellow]")
        return 0

    newly_saved = 0
    try:
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            namelist = zf.namelist()
            for ch in range(1, num_chapters + 1):
                filename = f"{code}{ch:02d}.pdf"
                dest = dest_dir / filename
                if dest.exists() and dest.stat().st_size > 0:
                    continue

                member = (
                    filename if filename in namelist
                    else (f"{code}dd/{filename}" if f"{code}dd/{filename}" in namelist else None)
                )
                if not member:
                    for n in namelist:
                        if Path(n).name == filename:
                            member = n
                            break
                if not member:
                    continue

                content = zf.read(member)
                if not content.startswith(b"%PDF"):
                    continue

                dest.write_bytes(content)
                meta = {
                    "grade": grade, "subject": subject, "book_code": code,
                    "chapter": ch, "source": "NCERT_nic_in_zip", "url": zip_url,
                    "downloaded_at": datetime.utcnow().isoformat(),
                    "local_file": filename,
                }
                async with aiofiles.open(dest_dir / f"{filename}.meta.json", "w") as f:
                    await f.write(json.dumps(meta, indent=2))
                newly_saved += 1
    except Exception as e:
        console.print(f"[yellow]  ! {code} zip extraction error ({e}), falling back to chapter PDFs...[/yellow]")

    return newly_saved


async def _download_chapter_pdf(
    client: httpx.AsyncClient,
    code: str,
    ch: int,
    dest_dir: Path,
    grade: int,
    subject: str,
) -> bool:
    """
    Download an individual official NCERT chapter PDF.
    Tries the official NCERT direct URL first:
      https://ncert.nic.in/textbook/pdf/{code}{ch:02d}.pdf
    If unavailable or non-PDF, falls back to the official NCERT archive snapshot.
    Verifies HTTP success and PDF content before saving.
    """
    filename = f"{code}{ch:02d}.pdf"
    dest = dest_dir / filename
    meta_path = dest_dir / f"{filename}.meta.json"

    # Check whether the PDF already exists; never overwrite existing files unnecessarily
    if dest.exists() and dest.stat().st_size > 0:
        return True

    primary_url = f"https://ncert.nic.in/textbook/pdf/{code}{ch:02d}.pdf"
    pdf_bytes: bytes | None = None

    # 1. Request official primary URL
    try:
        resp = await client.get(primary_url, timeout=60.0)
        if resp.status_code == 200 and resp.content.startswith(b"%PDF"):
            pdf_bytes = resp.content
    except Exception:
        pass

    # 2. Fall back to official archive snapshot using Wayback Availability API
    if pdf_bytes is None:
        for scheme in ["https", "http"]:
            try:
                avail_url = f"https://archive.org/wayback/available?url={scheme}://ncert.nic.in/textbook/pdf/{filename}"
                avail_resp = await client.get(avail_url, timeout=15.0)
                if avail_resp.status_code == 200:
                    snap = avail_resp.json().get("archived_snapshots", {}).get("closest")
                    if snap and snap.get("available") and snap.get("url"):
                        resp = await client.get(snap["url"], timeout=60.0)
                        if resp.status_code == 200 and resp.content.startswith(b"%PDF"):
                            pdf_bytes = resp.content
                            break
            except Exception:
                pass

    # 3. Fall back to CDX query if needed
    if pdf_bytes is None:
        try:
            cdx_url = f"https://web.archive.org/cdx/search/cdx?url=ncert.nic.in/textbook/pdf/{filename}&filter=statuscode:200&limit=-1&output=json"
            cdx_resp = await client.get(cdx_url, timeout=20.0)
            if cdx_resp.status_code == 200:
                rows = cdx_resp.json()
                if len(rows) > 1:
                    last_ts = rows[-1][1]
                    arch_url = f"https://web.archive.org/web/{last_ts}if_/{primary_url}"
                    resp = await client.get(arch_url, timeout=60.0)
                    if resp.status_code == 200 and resp.content.startswith(b"%PDF"):
                        pdf_bytes = resp.content
        except Exception:
            pass

    # 4. Fall back to direct Wayback snapshot
    if pdf_bytes is None:
        try:
            arch_url = f"https://web.archive.org/web/{primary_url}"
            resp = await client.get(arch_url, timeout=60.0)
            if resp.status_code == 200 and resp.content.startswith(b"%PDF"):
                pdf_bytes = resp.content
        except Exception:
            pass

    if pdf_bytes is None:
        console.print(f"[red]  x Failed to download {filename} ({grade} {subject} Ch {ch})[/red]")
        return False

    # Save PDF
    dest.write_bytes(pdf_bytes)

    # Save metadata sidecar
    meta = {
        "grade": grade,
        "subject": subject,
        "book_code": code,
        "chapter": ch,
        "source": "NCERT_nic_in_pdf",
        "url": primary_url,
        "downloaded_at": datetime.utcnow().isoformat(),
        "local_file": filename,
    }
    async with aiofiles.open(meta_path, "w") as f:
        await f.write(json.dumps(meta, indent=2))

    return True


async def ingest_ncert(grades: list[int], subjects: list[str]) -> dict:
    """Download NCERT chapter PDFs for the given grades and subjects."""
    results: dict[str, int] = {"downloaded": 0, "skipped": 0, "failed": 0}
    NCERT_PDF_DIR.mkdir(parents=True, exist_ok=True)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(follow_redirects=True, headers=headers) as client:
        for grade in grades:
            for subject in subjects:
                entry = NCERT_TEXTBOOK_CHAPTERS.get((grade, subject))
                if not entry:
                    continue

                code, num_chapters = entry
                dest_dir = NCERT_PDF_DIR / f"grade_{grade}" / subject
                dest_dir.mkdir(parents=True, exist_ok=True)

                # Count already existing valid PDFs before this run
                cached = sum(
                    1 for ch in range(1, num_chapters + 1)
                    if (dest_dir / f"{code}{ch:02d}.pdf").exists()
                    and (dest_dir / f"{code}{ch:02d}.pdf").stat().st_size > 0
                )
                results["skipped"] += cached

                if cached == num_chapters:
                    console.print(f"  [dim]Grade {grade} {subject} - all {num_chapters} chapters cached[/dim]")
                    continue

                console.print(f"  Grade {grade} {subject} ({num_chapters} chapters, {cached} cached)...")

                # 1. Try ZIP download first (saves only un-cached chapters)
                zip_saved = await _download_zip(client, code, num_chapters, dest_dir, grade, subject)
                results["downloaded"] += zip_saved

                # 2. For any chapter still missing, fall back to individual chapter PDF download
                fallback_saved = 0
                subject_failed = 0
                for ch in range(1, num_chapters + 1):
                    filename = f"{code}{ch:02d}.pdf"
                    dest = dest_dir / filename
                    if not (dest.exists() and dest.stat().st_size > 0):
                        ok = await _download_chapter_pdf(client, code, ch, dest_dir, grade, subject)
                        if ok:
                            fallback_saved += 1
                        else:
                            subject_failed += 1

                results["downloaded"] += fallback_saved
                results["failed"] += subject_failed

    return results


def parse_args() -> argparse.Namespace:
    all_grades = sorted({g for g, _ in NCERT_TEXTBOOK_CHAPTERS})
    all_subjects = sorted({s for _, s in NCERT_TEXTBOOK_CHAPTERS})

    parser = argparse.ArgumentParser(
        description="Download NCERT textbook PDFs (Grades 7–12) from ncert.nic.in",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Available grades: {all_grades}\nAvailable subjects: {all_subjects}",
    )
    parser.add_argument("--grades",   nargs="+", type=int, default=all_grades,
                        help="Grades to download (default: all)")
    parser.add_argument("--subjects", nargs="+", default=all_subjects,
                        help="Subjects to download (default: all)")
    return parser.parse_args()


async def main() -> None:
    args = parse_args()

    console.rule("[bold blue]ncert-mcp — NCERT Ingestion[/bold blue]")
    console.print(f"Grades:   {args.grades}")
    console.print(f"Subjects: {args.subjects}\n")

    summary = await ingest_ncert(args.grades, args.subjects)

    table = Table(title="Ingestion Summary")
    table.add_column("Status")
    table.add_column("Count", justify="right")
    table.add_row("[green]Downloaded[/green]", str(summary["downloaded"]))
    table.add_row("[dim]Skipped (cached)[/dim]",  str(summary["skipped"]))
    table.add_row("[red]Failed[/red]",    str(summary["failed"]))
    console.print(table)


if __name__ == "__main__":
    asyncio.run(main())
