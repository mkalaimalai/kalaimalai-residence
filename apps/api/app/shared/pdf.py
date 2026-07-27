"""Render PDF pages to high-resolution JPEGs.

Uploaded PDFs are drawing sheets and plans. A PDF cannot be shown in an `<img>`, so the
gallery would only ever get a "download" link. Rasterising on upload means a sheet
behaves like every other image in a media set.

This mirrors what `data/drawingSheets.ts` documents for the committed sheets — those were
produced with `pdftocairo -r 200` — but uses PyMuPDF rather than shelling out to poppler,
because poppler is a system package the deploy target does not have, while PyMuPDF ships
as a self-contained wheel.

One JPEG per page: multi-page sheet sets are the norm, and a page is the unit an admin
thinks in.
"""
from __future__ import annotations

from dataclasses import dataclass

import fitz

# 72 dpi is the PDF user-space unit; the zoom factor is therefore dpi/72.
PDF_USER_SPACE_DPI = 72


class PdfRenderError(RuntimeError):
    """The upload claimed to be a PDF but could not be rasterised."""


@dataclass(frozen=True)
class RenderedPage:
    filename: str
    content: bytes
    page: int  # 1-based


def render_pdf_to_jpegs(
    content: bytes,
    *,
    stem: str,
    dpi: int = 200,
    quality: int = 90,
) -> list[RenderedPage]:
    """Rasterise every page. `stem` is the source name without its extension.

    Pages are named `<stem>-01.jpg`, zero-padded to the page count so that a plain
    lexicographic sort (which is what Drive and our `images` array give) stays in reading
    order past page 9.
    """
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:  # fitz raises bare Exception subclasses
        raise PdfRenderError(f"Could not open {stem!r} as a PDF: {exc}") from exc

    with doc:
        if doc.page_count == 0:
            raise PdfRenderError(f"{stem!r} has no pages.")

        # Alpha off: JPEG has no alpha channel, and leaving it on yields a black
        # background wherever the sheet is transparent.
        matrix = fitz.Matrix(dpi / PDF_USER_SPACE_DPI, dpi / PDF_USER_SPACE_DPI)
        width = len(str(doc.page_count))

        pages: list[RenderedPage] = []
        for index, page in enumerate(doc, start=1):
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            pages.append(
                RenderedPage(
                    filename=f"{stem}-{index:0{width}d}.jpg",
                    content=pixmap.tobytes("jpeg", jpg_quality=quality),
                    page=index,
                )
            )
        return pages
