"""Convert five numbered single-page PDFs without touching custom project assets."""
from pathlib import Path
import argparse
import re
import sys
import tempfile
import shutil

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=ROOT / 'portfolio-pdfs' / 'project-1')
    parser.add_argument('--output', type=Path, default=ROOT / 'public/projects/craft-academy/pdf')
    parser.add_argument('--width', type=int, default=3840)
    args = parser.parse_args()
    if not 1000 <= args.width <= 8000:
        raise ValueError('Width must be between 1000 and 8000.')
    try:
        import fitz
        from PIL import Image
    except ImportError:
        raise RuntimeError('Install dependencies: py -m pip install pymupdf pillow')
    files = [p for p in args.input.iterdir() if p.is_file() and p.suffix.lower() == '.pdf']
    if len(files) != 5:
        raise ValueError(f'Expected exactly 5 PDF files in {args.input}; found {len(files)}.')
    numbered = []
    for path in files:
        numbers = re.findall(r'\d+', path.stem)
        if not numbers:
            raise ValueError(f'Filename needs a page number: {path.name}')
        numbered.append((int(numbers[-1]), path))
    numbered.sort(key=lambda item: item[0])
    if [n for n, _ in numbered] != [1, 2, 3, 4, 5]:
        raise ValueError('Last number in each filename must be 1, 2, 3, 4, 5 (unique). Originals are unchanged.')
    # Validate every source before creating or replacing any output.
    for _, path in numbered:
        with fitz.open(path) as document:
            if document.needs_pass or len(document) != 1:
                raise ValueError(f'Expected one unlocked page: {path.name}')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=args.output.parent) as temporary:
        stage = Path(temporary)
        for number, path in numbered:
            with fitz.open(path) as document:
                page = document[0]
                scale = args.width / page.rect.width
                pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), colorspace=fitz.csRGB, alpha=False)
                image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
                filename = f'page-{number:02d}.webp'
                image.save(stage / filename, format='WEBP', lossless=True, method=6)
                print(f'{path.name} -> {filename} ({pix.width} x {pix.height})')
        args.output.mkdir(parents=True, exist_ok=True)
        for file in stage.iterdir():
            shutil.copy2(file, args.output / file.name)
    print(f'Done: {args.output}')

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Conversion stopped: {error}', file=sys.stderr)
        sys.exit(1)
