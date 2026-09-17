#!/usr/bin/env python3
"""
generate_dataset.py — Phase 1 dataset builder for the AI-Based Fake Identity &
Document Screening System (SIH PS 26188).

Generates FICTIONAL, CLEARLY-MARKED test documents only:
  * Country is the invented state "TESTLAND" (ISO-style code TST) — not a real country
  * Every document carries "SAMPLE - NOT VALID / AI TEST DOCUMENT" banners + watermark
  * All numbers start with TEST / TSTV
  * Photos are procedurally drawn geometric avatars, not real faces

It produces:
  genuine documents  -> PNG + JSON (field values, field bounding boxes, MRZ)
  tampered documents -> PNG + JSON with ground-truth tamper label and bbox
  labels.csv / labels.json -> dataset manifest for training & evaluation

Usage
-----
  python generate_dataset.py generate --count 50 --out SIH_Dataset
  python generate_dataset.py generate --count 20 --tampers name dob expiry --seed 7
  python generate_dataset.py edit SIH_Dataset/passports/genuine/passport_001.json \
         --set dob=01/01/2001 --set name="ROHAN SHARMA" --tamper-type manual
  python generate_dataset.py edit SIH_Dataset/visas/genuine/visa_003.json --interactive

Requires: pillow  (pip install pillow)
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import random
import shutil
from datetime import date, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# --------------------------------------------------------------------------- #
# Fictional-country constants. Keep these obviously fake.
# --------------------------------------------------------------------------- #
COUNTRY_NAME = "REPUBLIC OF TESTLAND"
COUNTRY_CODE = "TST"                 # not a real ISO 3166 code
NATIONALITY = "TESTLANDIAN"
BANNER = "SAMPLE - NOT VALID  |  AI TEST DOCUMENT  |  SYNTHETIC DATA"
WATERMARK = "SAMPLE - NOT VALID"

PASSPORT_SIZE = (1000, 700)
VISA_SIZE = (1000, 680)

INK = (24, 28, 38)
LABEL_INK = (108, 118, 140)
PASSPORT_BG = (238, 236, 228)
PASSPORT_PANEL = (248, 247, 242)
VISA_BG = (232, 238, 244)
VISA_PANEL = (246, 250, 253)
ACCENT = (26, 74, 122)
RED = (176, 42, 46)

# --------------------------------------------------------------------------- #
# Name / place pools (Indian names, fictional document data)
# --------------------------------------------------------------------------- #
MALE_FIRST = [
    "RAHUL", "ROHAN", "ADITYA", "ARJUN", "KARAN", "VIKRAM", "ANIRUDH", "SIDDHARTH",
    "MANISH", "PRATEEK", "NIKHIL", "HARSH", "YASH", "DEVANSH", "KUNAL", "SAURABH",
    "AMAN", "RITESH", "TUSHAR", "GAURAV", "ABHINAV", "SHREYAS", "PARTH", "OMKAR",
]
FEMALE_FIRST = [
    "ANANYA", "PRIYA", "NEHA", "SHREYA", "ISHITA", "KAVYA", "MEGHA", "RIYA",
    "SANJANA", "TANVI", "POOJA", "DIVYA", "SNEHA", "ADITI", "NIDHI", "PALLAVI",
    "RADHIKA", "SWATI", "VAISHNAVI", "ANJALI", "KRITIKA", "MANSI",
]
SURNAMES = [
    "SHARMA", "VERMA", "PATEL", "MEHTA", "REDDY", "NAIR", "IYER", "GUPTA",
    "JOSHI", "DESAI", "CHOPRA", "MALHOTRA", "BHATIA", "SINGH", "RAO", "PILLAI",
    "KULKARNI", "DESHMUKH", "CHAUHAN", "AGARWAL", "SAXENA", "TRIPATHI", "BOSE",
]
BIRTH_PLACES = [
    "INDORE", "BHOPAL", "JAIPUR", "PUNE", "NAGPUR", "LUCKNOW", "SURAT",
    "KOCHI", "PATNA", "RAIPUR", "VADODARA", "MYSURU", "GUWAHATI", "RANCHI",
]
ISSUE_PLACES = ["TESTPUR", "NEW TESTON", "PORT TESTA", "TESTGARH"]
VISA_TYPES = ["TOURIST (T-1)", "BUSINESS (B-2)", "STUDENT (S-3)", "TRANSIT (X-1)", "EMPLOYMENT (E-4)"]
ENTRY_TYPES = ["SINGLE", "MULTIPLE", "DOUBLE"]
PORTS = ["TEST INTL AIRPORT", "PORT TESTA SEAPORT", "TESTGARH LAND BORDER"]

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

FONT_PATHS = {
    "sans": r"C:\Windows\Fonts\arial.ttf",
    "sans_bold": r"C:\Windows\Fonts\arialbd.ttf",
    "mono": r"C:\Windows\Fonts\consola.ttf",
    "mono_bold": r"C:\Windows\Fonts\consolab.ttf",
    "serif_bold": r"C:\Windows\Fonts\timesbd.ttf",
    "alt": r"C:\Windows\Fonts\arialbd.ttf",
}
_FONT_CACHE: dict = {}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    key = (kind, size)
    if key not in _FONT_CACHE:
        path = FONT_PATHS.get(kind, FONT_PATHS["sans"])
        try:
            _FONT_CACHE[key] = ImageFont.truetype(path, size)
        except OSError:
            _FONT_CACHE[key] = ImageFont.truetype(FONT_PATHS["sans"], size)
    return _FONT_CACHE[key]


# --------------------------------------------------------------------------- #
# MRZ (ICAO 9303 TD3 layout, filled with fictional data)
# --------------------------------------------------------------------------- #
def mrz_check_digit(data: str) -> str:
    weights = [7, 3, 1]
    total = 0
    for i, ch in enumerate(data):
        if ch.isdigit():
            val = int(ch)
        elif ch.isalpha():
            val = ord(ch.upper()) - 55
        else:
            val = 0
        total += val * weights[i % 3]
    return str(total % 10)


def _mrz_pad(text: str, length: int) -> str:
    cleaned = "".join(c if c.isalnum() else "<" for c in text.upper())
    return (cleaned + "<" * length)[:length]


def build_mrz(fields: dict) -> list[str]:
    """TD3: two lines of 44 characters."""
    surname, given = fields["surname"], fields["given_name"]
    name_part = _mrz_pad(f"{surname}<<{given}".replace(" ", "<"), 39)
    line1 = f"P<{COUNTRY_CODE}{name_part}"

    doc_no = _mrz_pad(fields["passport_no"], 9)
    dob = to_mrz_date(fields["dob"])
    exp = to_mrz_date(fields["expiry"])
    sex = fields["sex"][0]
    personal = _mrz_pad(fields["file_no"], 14)

    composite = doc_no + mrz_check_digit(doc_no) + dob + mrz_check_digit(dob) + \
        exp + mrz_check_digit(exp) + personal + mrz_check_digit(personal)
    line2 = (doc_no + mrz_check_digit(doc_no) + COUNTRY_CODE + dob +
             mrz_check_digit(dob) + sex + exp + mrz_check_digit(exp) +
             personal + mrz_check_digit(personal) + mrz_check_digit(composite))
    return [line1[:44], line2[:44]]


def to_mrz_date(ddmmyyyy: str) -> str:
    d, m, y = ddmmyyyy.split("/")
    return f"{y[2:]}{m}{d}"


# --------------------------------------------------------------------------- #
# Fictional photo (geometric avatar — never a real face)
# --------------------------------------------------------------------------- #
def make_photo(seed: int, size=(190, 240), variant: int = 0) -> Image.Image:
    rnd = random.Random(seed * 977 + variant * 13)
    w, h = size
    img = Image.new("RGB", size, (235, 238, 242))
    d = ImageDraw.Draw(img)

    bg = tuple(rnd.randint(150, 205) for _ in range(3))
    d.rectangle([0, 0, w, h], fill=bg)
    skin = rnd.choice([(214, 176, 146), (196, 152, 118), (170, 126, 96), (232, 198, 168)])
    hair = rnd.choice([(46, 36, 30), (28, 24, 22), (72, 50, 34), (120, 96, 70)])
    shirt = tuple(rnd.randint(40, 190) for _ in range(3))

    cx, cy, r = w // 2, int(h * 0.42), int(w * 0.28)
    d.ellipse([cx - r - 6, cy - r - 10, cx + r + 6, cy + r - 2], fill=hair)      # hair
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=skin)                      # face
    d.ellipse([cx - r + 4, cy - r - 4, cx + r - 4, cy - r + 14], fill=hair)     # fringe
    eye_y = cy - r // 4
    for ex in (cx - r // 2, cx + r // 2):
        d.ellipse([ex - 6, eye_y - 4, ex + 6, eye_y + 6], fill=(250, 250, 250))
        d.ellipse([ex - 3, eye_y - 1, ex + 3, eye_y + 5], fill=(40, 40, 50))
    d.arc([cx - r // 2, cy + 4, cx + r // 2, cy + r - 4], 20, 160, fill=(120, 70, 60), width=3)
    d.polygon([(cx - int(w * 0.42), h), (cx - int(w * 0.16), int(h * 0.70)),
               (cx + int(w * 0.16), int(h * 0.70)), (cx + int(w * 0.42), h)], fill=shirt)

    # make it unmistakably synthetic
    for i in range(-h, w, 26):
        d.line([(i, 0), (i + h, h)], fill=(255, 255, 255, 40), width=1)
    label = "TEST PHOTO - FAKE"
    fs = 15
    f = font("sans_bold", fs)
    while d.textlength(label, font=f) > w - 10 and fs > 8:
        fs -= 1
        f = font("sans_bold", fs)
    d.rectangle([0, h - 24, w, h], fill=(255, 255, 255))
    d.text((5, h - 21), label, font=f, fill=RED)
    d.rectangle([0, 0, w - 1, h - 1], outline=(90, 95, 105), width=2)
    return img


# --------------------------------------------------------------------------- #
# Random field generation
# --------------------------------------------------------------------------- #
def fmt(d: date) -> str:
    return d.strftime("%d/%m/%Y")


def long_fmt(d: date) -> str:
    return f"{d.day:02d} {MONTHS[d.month - 1]} {d.year}"


def random_person(rnd: random.Random, idx: int) -> dict:
    sex = rnd.choice(["M", "F"])
    given = rnd.choice(MALE_FIRST if sex == "M" else FEMALE_FIRST)
    if rnd.random() < 0.25:
        given += " " + rnd.choice(MALE_FIRST if sex == "M" else FEMALE_FIRST)
    surname = rnd.choice(SURNAMES)

    dob = date(rnd.randint(1975, 2006), rnd.randint(1, 12), rnd.randint(1, 28))
    issue = date(rnd.randint(2018, 2024), rnd.randint(1, 12), rnd.randint(1, 28))
    expiry = issue + timedelta(days=365 * 10)
    return {
        "doc_id": f"{idx:03d}",
        "surname": surname,
        "given_name": given,
        "name": f"{given} {surname}",
        "sex": sex,
        "dob": fmt(dob),
        "place_of_birth": rnd.choice(BIRTH_PLACES),
        "nationality": NATIONALITY,
        "country_code": COUNTRY_CODE,
        "passport_no": f"TEST{rnd.choice('ABCDEFGH')}{rnd.randint(1000, 9999)}",
        "file_no": f"TF{rnd.randint(1000000, 9999999)}",
        "issue": fmt(issue),
        "expiry": fmt(expiry),
        "place_of_issue": rnd.choice(ISSUE_PLACES),
        "photo_seed": rnd.randint(1, 10**6),
        # frozen at issue time: a name forger cannot repaint the signature,
        # so a name tamper leaves a printed-name vs signature mismatch
        "signature_name": f"{given} {surname}",
    }


def random_visa(rnd: random.Random, person: dict) -> dict:
    valid_from = date(rnd.randint(2024, 2026), rnd.randint(1, 12), rnd.randint(1, 28))
    span = rnd.choice([90, 180, 365, 730])
    valid_until = valid_from + timedelta(days=span)
    v = dict(person)
    v.update({
        "visa_no": f"TSTV{rnd.randint(100000, 999999)}",
        "visa_type": rnd.choice(VISA_TYPES),
        "entries": rnd.choice(ENTRY_TYPES),
        "duration": f"{rnd.choice([d for d in (30, 45, 60, 90, 180) if d <= span])} DAYS",
        "valid_from": fmt(valid_from),
        "valid_until": fmt(valid_until),
        "port": rnd.choice(PORTS),
        "issued_at": rnd.choice(ISSUE_PLACES),
        "stamp_date": long_fmt(valid_from),
    })
    return v


# --------------------------------------------------------------------------- #
# Drawing helpers
# --------------------------------------------------------------------------- #
def draw_watermark(img: Image.Image, text: str = WATERMARK) -> None:
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = font("sans_bold", 46)
    step_x, step_y = 430, 210
    for row in range(-1, img.height // step_y + 3):
        for col in range(-1, img.width // step_x + 3):
            d.text((col * step_x + (row % 2) * 215 - 120, row * step_y), text, font=f,
                   fill=(186, 52, 56, 30))
    layer = layer.rotate(-22, resample=Image.BICUBIC, center=(img.width // 2, img.height // 2))
    img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"), (0, 0))


def field(draw: ImageDraw.ImageDraw, key: str, label: str, value: str,
          x: int, y: int, boxes: dict, *, label_font=None, value_font=None,
          value_color=INK, dx: int = 0, dy: int = 0, alt_font=False) -> None:
    """Draw 'LABEL' above 'value' and record the value's bounding box."""
    lf = label_font or font("sans", 13)
    vf = value_font or (font("alt", 22) if alt_font else font("sans_bold", 22))
    draw.text((x, y), label, font=lf, fill=LABEL_INK)
    vx, vy = x + dx, y + 18 + dy
    draw.text((vx, vy), value, font=vf, fill=value_color)
    bbox = draw.textbbox((vx, vy), value, font=vf)
    boxes[key] = [int(bbox[0]) - 4, int(bbox[1]) - 4, int(bbox[2]) + 4, int(bbox[3]) + 4]


# --------------------------------------------------------------------------- #
# Passport renderer
# --------------------------------------------------------------------------- #
def render_passport(data: dict, tamper: dict | None = None) -> tuple[Image.Image, dict]:
    tamper = tamper or {}
    t_field = tamper.get("field")
    W, H = PASSPORT_SIZE
    img = Image.new("RGB", (W, H), PASSPORT_BG)
    d = ImageDraw.Draw(img)
    boxes: dict = {}

    # top banner
    d.rectangle([0, 0, W, 54], fill=ACCENT)
    d.text((24, 8), COUNTRY_NAME + "  -  PASSPORT", font=font("serif_bold", 24), fill=(255, 255, 255))
    d.text((24, 34), BANNER, font=font("sans_bold", 13), fill=(214, 226, 240))
    d.rectangle([0, 54, W, 60], fill=RED)

    # main panel
    d.rectangle([18, 74, W - 18, H - 150], fill=PASSPORT_PANEL, outline=(198, 198, 190), width=2)

    # photo
    photo_variant = 1 if t_field == "photo" else 0
    photo = make_photo(data["photo_seed"], variant=photo_variant)
    px, py = 40, 100
    img.paste(photo, (px, py))
    boxes["photo"] = [px - 3, py - 3, px + photo.width + 3, py + photo.height + 3]
    d.rectangle([px - 3, py - 3, px + photo.width + 3, py + photo.height + 3],
                outline=(120, 124, 132), width=2)
    d.text((px, py + photo.height + 10), "HOLDER PHOTO (FICTIONAL)", font=font("sans", 12), fill=LABEL_INK)

    left, col2 = 270, 660
    jitter = tamper.get("jitter", {})

    def jd(key):
        return jitter.get(key, (0, 0))

    rows = [
        ("type_code", "TYPE / CODE", "P / " + COUNTRY_CODE, left, 100),
        ("passport_no", "PASSPORT NO.", data["passport_no"], col2, 100),
        ("surname", "SURNAME", data["surname"], left, 160),
        ("given_name", "GIVEN NAME(S)", data["given_name"], left, 220),
        ("nationality", "NATIONALITY", data["nationality"], col2, 160),
        ("sex", "SEX", data["sex"], col2, 220),
        ("dob", "DATE OF BIRTH", data["dob"], left, 280),
        ("place_of_birth", "PLACE OF BIRTH", data["place_of_birth"], col2, 280),
        ("issue", "DATE OF ISSUE", data["issue"], left, 340),
        ("expiry", "DATE OF EXPIRY", data["expiry"], col2, 340),
        ("place_of_issue", "PLACE OF ISSUE", data["place_of_issue"], left, 400),
        ("file_no", "FILE NO.", data["file_no"], col2, 400),
    ]
    for key, label, value, x, y in rows:
        is_t = key == t_field
        dx, dy = jd(key) if is_t else (0, 0)
        field(d, key, label, str(value), x, y, boxes,
              value_color=(30, 32, 44) if not is_t else (22, 24, 40),
              dx=dx, dy=dy, alt_font=is_t and tamper.get("alt_font", True))

    # signature / authority strip
    sy = 470
    d.line([(left, sy + 46), (left + 300, sy + 46)], fill=(150, 154, 162), width=1)
    d.text((left, sy + 50), "SIGNATURE OF HOLDER (SPECIMEN)", font=font("sans", 12), fill=LABEL_INK)
    sig = data.get("signature_name") or f"{data['given_name']} {data['surname']}"
    d.text((left + 8, sy + 6), sig.title(),
           font=font("alt", 26), fill=(40, 50, 90))
    bx = col2
    brnd = random.Random(sum(ord(c) for c in data["passport_no"]))
    for i in range(70):
        w_ = brnd.choice([2, 2, 3, 5])
        d.rectangle([bx + i * 4, sy, bx + i * 4 + w_, sy + 42], fill=INK)
        if bx + i * 4 > W - 80:
            break
    d.text((bx, sy + 50), "TEST BARCODE - NON FUNCTIONAL", font=font("sans", 12), fill=LABEL_INK)
    boxes["signature"] = [left, sy, left + 320, sy + 46]
    boxes["barcode"] = [bx, sy - 2, W - 60, sy + 44]

    # MRZ zone
    d.rectangle([18, H - 140, W - 18, H - 30], fill=(252, 252, 250), outline=(198, 198, 190), width=2)
    mrz = data.get("mrz") or build_mrz(data)
    mf = font("mono_bold", 27)
    d.text((34, H - 128), mrz[0], font=mf, fill=INK)
    d.text((34, H - 88), mrz[1], font=mf, fill=INK)
    boxes["mrz"] = [30, H - 132, W - 24, H - 50]
    d.text((34, H - 48), "MACHINE READABLE ZONE - TEST DATA ONLY, NOT AN ICAO-ISSUED DOCUMENT",
           font=font("sans", 12), fill=LABEL_INK)

    d.rectangle([0, H - 26, W, H], fill=RED)
    d.text((24, H - 22), "SAMPLE - NOT VALID FOR TRAVEL - GENERATED FOR AI TRAINING",
           font=font("sans_bold", 14), fill=(255, 255, 255))

    draw_watermark(img)
    return img, boxes


# --------------------------------------------------------------------------- #
# Visa renderer
# --------------------------------------------------------------------------- #
def draw_stamp(img: Image.Image, cx: int, cy: int, text_top: str, text_bottom: str,
               angle: int = -14, color=(38, 92, 60)) -> None:
    s = 230
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([10, 10, s - 10, s - 10], outline=color + (220,), width=5)
    d.ellipse([28, 28, s - 28, s - 28], outline=color + (200,), width=2)
    f1, f2 = font("sans_bold", 19), font("sans_bold", 15)
    for txt, yy, ff in ((text_top, 78, f1), (text_bottom, 130, f2)):
        w = d.textlength(txt, font=ff)
        d.text(((s - w) / 2, yy), txt, font=ff, fill=color + (230,))
    w = d.textlength("TESTLAND", font=f2)
    d.text(((s - w) / 2, 104), "TESTLAND", font=f2, fill=color + (230,))
    layer = layer.rotate(angle, resample=Image.BICUBIC)
    img.paste(Image.alpha_composite(
        img.convert("RGBA").crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2)), layer
    ).convert("RGB"), (cx - s // 2, cy - s // 2))


def render_visa(data: dict, tamper: dict | None = None) -> tuple[Image.Image, dict]:
    tamper = tamper or {}
    t_field = tamper.get("field")
    W, H = VISA_SIZE
    img = Image.new("RGB", (W, H), VISA_BG)
    d = ImageDraw.Draw(img)
    boxes: dict = {}

    # guilloche-ish background lines (purely decorative)
    for i in range(0, W, 8):
        y = 90 + int(18 * math.sin(i / 42.0))
        d.line([(i, y), (i, H - 90)], fill=(224, 232, 240), width=1)

    d.rectangle([0, 0, W, 56], fill=(18, 62, 104))
    d.text((24, 8), COUNTRY_NAME + "  -  VISA", font=font("serif_bold", 24), fill=(255, 255, 255))
    d.text((24, 36), BANNER, font=font("sans_bold", 13), fill=(206, 222, 238))

    d.rectangle([18, 74, W - 18, H - 60], fill=VISA_PANEL, outline=(186, 202, 216), width=2)

    photo_variant = 1 if t_field == "photo" else 0
    photo = make_photo(data["photo_seed"], size=(160, 200), variant=photo_variant)
    px, py = 40, 100
    img.paste(photo, (px, py))
    boxes["photo"] = [px - 3, py - 3, px + photo.width + 3, py + photo.height + 3]
    d.rectangle([px - 3, py - 3, px + photo.width + 3, py + photo.height + 3],
                outline=(120, 124, 132), width=2)

    left, col2 = 240, 640
    jitter = tamper.get("jitter", {})
    rows = [
        ("visa_no", "VISA NO.", data["visa_no"], left, 96),
        ("passport_no", "PASSPORT NO.", data["passport_no"], col2, 96),
        ("name", "FULL NAME", data["name"], left, 152),
        ("nationality", "NATIONALITY", data["nationality"], col2, 152),
        ("dob", "DATE OF BIRTH", data["dob"], left, 208),
        ("sex", "SEX", data["sex"], col2, 208),
        ("visa_type", "VISA TYPE", data["visa_type"], left, 264),
        ("entries", "ENTRIES", data["entries"], col2, 264),
        ("valid_from", "VALID FROM", data["valid_from"], left, 320),
        ("valid_until", "VALID UNTIL", data["valid_until"], col2, 320),
        ("duration", "DURATION OF STAY", data["duration"], left, 376),
        ("issued_at", "ISSUED AT", data["issued_at"], col2, 376),
        ("port", "PORT OF ENTRY", data["port"], left, 432),
    ]
    for key, label, value, x, y in rows:
        is_t = key == t_field
        dx, dy = jitter.get(key, (0, 0)) if is_t else (0, 0)
        field(d, key, label, str(value), x, y, boxes,
              value_font=font("alt", 20) if (is_t and tamper.get("alt_font", True)) else font("sans_bold", 20),
              dx=dx, dy=dy)

    stamp_cx, stamp_cy = W - 190, H - 200
    if t_field != "stamp":
        draw_stamp(img, stamp_cx, stamp_cy, "ENTRY - SAMPLE", data["stamp_date"])
    else:
        # forged stamp: wrong colour, wrong angle, wrong date text
        draw_stamp(img, stamp_cx - 10, stamp_cy + 8, "ENTRY - SAMPLE",
                   data.get("stamp_date_tampered", data["stamp_date"]),
                   angle=6, color=(120, 40, 120))
    boxes["stamp"] = [stamp_cx - 120, stamp_cy - 120, stamp_cx + 120, stamp_cy + 120]

    d.rectangle([0, H - 34, W, H], fill=RED)
    d.text((24, H - 28), "SAMPLE - NOT VALID - SYNTHETIC DOCUMENT FOR AI MODEL TESTING",
           font=font("sans_bold", 14), fill=(255, 255, 255))

    draw_watermark(img)
    return img, boxes


# --------------------------------------------------------------------------- #
# Tampering
# --------------------------------------------------------------------------- #
PASSPORT_TAMPERS = ["name", "dob", "expiry", "photo", "text_block"]
VISA_TAMPERS = ["name", "dob", "expiry", "photo", "stamp"]


def shift_date(value: str, rnd: random.Random) -> str:
    d, m, y = value.split("/")
    mode = rnd.choice(["year", "day", "month"])
    if mode == "year":
        y = str(int(y) + rnd.choice([-2, -1, 1, 2]))
    elif mode == "day":
        d = f"{max(1, min(28, int(d) + rnd.choice([-3, -1, 1, 3]))):02d}"
    else:
        m = f"{max(1, min(12, int(m) + rnd.choice([-2, -1, 1, 2]))):02d}"
    return f"{d}/{m}/{y}"


def swap_name(value: str, rnd: random.Random) -> str:
    parts = value.split()
    pool = MALE_FIRST + FEMALE_FIRST
    if rnd.random() < 0.5 or len(parts) == 1:
        new_first = rnd.choice([n for n in pool if n != parts[0]])
        parts[0] = new_first
    else:
        parts[-1] = rnd.choice([s for s in SURNAMES if s != parts[-1]])
    return " ".join(parts)


def apply_tamper(doc_type: str, data: dict, tamper_type: str, rnd: random.Random,
                 update_mrz: bool = False) -> tuple[dict, dict, dict]:
    """Return (tampered_data, render_hint, change_record)."""
    new = dict(data)
    hint = {"field": None, "alt_font": True, "jitter": {}}
    change = {"tamper_type": tamper_type, "field": None,
              "original_value": None, "new_value": None}

    if tamper_type == "name":
        key = "name" if doc_type == "visa" else rnd.choice(["surname", "given_name"])
        old = data[key]
        new[key] = swap_name(old, rnd)
        if doc_type == "passport":
            new["name"] = f"{new['given_name']} {new['surname']}"
        change.update(field=key, original_value=old, new_value=new[key])
        hint["field"] = key

    elif tamper_type == "dob":
        old = data["dob"]
        new["dob"] = shift_date(old, rnd)
        change.update(field="dob", original_value=old, new_value=new["dob"])
        hint["field"] = "dob"

    elif tamper_type == "expiry":
        key = "valid_until" if doc_type == "visa" else "expiry"
        old = data[key]
        new[key] = shift_date(old, rnd)
        change.update(field=key, original_value=old, new_value=new[key])
        hint["field"] = key

    elif tamper_type == "photo":
        change.update(field="photo", original_value="photo_v0", new_value="photo_v1")
        hint["field"] = "photo"

    elif tamper_type == "stamp":
        old = data["stamp_date"]
        parts = old.split()
        parts[-1] = str(int(parts[-1]) + rnd.choice([-1, 1]))
        new["stamp_date_tampered"] = " ".join(parts)
        change.update(field="stamp", original_value=old, new_value=new["stamp_date_tampered"])
        hint["field"] = "stamp"

    elif tamper_type == "text_block":
        key = rnd.choice(["place_of_issue", "file_no", "place_of_birth"])
        old = data[key]
        if key == "file_no":
            new[key] = f"TF{rnd.randint(1000000, 9999999)}"
        elif key == "place_of_birth":
            new[key] = rnd.choice([p for p in BIRTH_PLACES if p != old])
        else:
            new[key] = rnd.choice([p for p in ISSUE_PLACES if p != old])
        change.update(field=key, original_value=old, new_value=new[key])
        hint["field"] = key

    # visible forgery artefacts: baseline shift of 1-3 px
    if hint["field"] and hint["field"] != "photo":
        hint["jitter"][hint["field"]] = (rnd.choice([-2, -1, 0, 1, 2]), rnd.choice([-3, -2, 2, 3]))

    # MRZ: by default the forger forgets to update it -> cross-field mismatch
    if doc_type == "passport":
        new["mrz"] = build_mrz(new) if update_mrz else data.get("mrz") or build_mrz(data)
        change["mrz_consistent"] = bool(update_mrz) or tamper_type in ("photo", "stamp")
    else:
        change["mrz_consistent"] = None
    return new, hint, change


def add_local_artifacts(img: Image.Image, bbox: list[int], rnd: random.Random) -> Image.Image:
    """Recompress + slightly shift colour in the edited region, like a real splice."""
    x0, y0, x1, y1 = [max(0, v) for v in bbox]
    x1, y1 = min(img.width, x1), min(img.height, y1)
    if x1 <= x0 or y1 <= y0:
        return img
    patch = img.crop((x0, y0, x1, y1))
    buf = io.BytesIO()
    patch.save(buf, format="JPEG", quality=rnd.choice([55, 62, 70]))
    buf.seek(0)
    patch = Image.open(buf).convert("RGB")
    if rnd.random() < 0.5:
        patch = patch.filter(ImageFilter.GaussianBlur(0.4))
    px = patch.load()
    shift = rnd.choice([-6, -4, 4, 6])
    for yy in range(patch.height):
        for xx in range(patch.width):
            r, g, b = px[xx, yy]
            px[xx, yy] = (max(0, min(255, r + shift)), g, max(0, min(255, b - shift)))
    img.paste(patch, (x0, y0))
    return img


# --------------------------------------------------------------------------- #
# Dataset build
# --------------------------------------------------------------------------- #
def save_doc(img: Image.Image, meta: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)
    path.with_suffix(".json").write_text(json.dumps(meta, indent=2))


def generate(args) -> None:
    rnd = random.Random(args.seed)
    out = Path(args.out)
    if out.exists() and args.clean:
        shutil.rmtree(out)
    records: list[dict] = []

    p_tampers = [t for t in args.tampers if t in PASSPORT_TAMPERS]
    v_tampers = [t for t in args.tampers if t in VISA_TAMPERS]

    for i in range(1, args.count + 1):
        person = random_person(rnd, i)
        person["mrz"] = build_mrz(person)
        visa = random_visa(rnd, person)

        for doc_type, data, renderer, tampers, folder, stem in (
            ("passport", person, render_passport, p_tampers, "passports", f"passport_{i:03d}"),
            ("visa", visa, render_visa, v_tampers, "visas", f"visa_{i:03d}"),
        ):
            img, boxes = renderer(data)
            gpath = out / folder / "genuine" / f"{stem}.png"
            meta = {"doc_type": doc_type, "label": "genuine", "source": None,
                    "fields": data, "boxes": boxes}
            save_doc(img, meta, gpath)
            records.append({"file": str(gpath.relative_to(out)), "doc_type": doc_type,
                            "label": "genuine", "tamper_type": "", "field": "",
                            "original_value": "", "new_value": "", "bbox": "",
                            "mrz_consistent": True})

            n = min(args.tampers_per_doc, len(tampers))
            for ttype in rnd.sample(tampers, n):
                t_data, hint, change = apply_tamper(doc_type, data, ttype, rnd,
                                                    update_mrz=rnd.random() < args.mrz_update_rate)
                t_img, t_boxes = renderer(t_data, tamper=hint)
                bbox = t_boxes.get(change["field"] or "", [])
                if bbox and args.artifacts:
                    t_img = add_local_artifacts(t_img, bbox, rnd)
                tpath = out / folder / "tampered" / f"{stem}_{ttype}.png"
                save_doc(t_img, {"doc_type": doc_type, "label": "tampered",
                                 "source": str(gpath.relative_to(out)),
                                 "tamper": change, "tamper_bbox": bbox,
                                 "fields": t_data, "boxes": t_boxes}, tpath)
                records.append({"file": str(tpath.relative_to(out)), "doc_type": doc_type,
                                "label": "tampered", "tamper_type": ttype,
                                "field": change["field"], "original_value": change["original_value"],
                                "new_value": change["new_value"], "bbox": ",".join(map(str, bbox)),
                                "mrz_consistent": change["mrz_consistent"]})

    out.mkdir(parents=True, exist_ok=True)
    (out / "labels.json").write_text(json.dumps(records, indent=2))
    with (out / "labels.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(records[0].keys()))
        w.writeheader()
        w.writerows(records)
    (out / "README.txt").write_text(
        "SYNTHETIC DATASET - FICTIONAL DOCUMENTS ONLY\n"
        "Country 'TESTLAND' does not exist. Every image is watermarked SAMPLE - NOT VALID.\n"
        "Photos are procedurally drawn avatars, not real people.\n"
        "Use only for training/evaluating the SIH document-screening prototype.\n"
    )

    g = sum(1 for r in records if r["label"] == "genuine")
    t = len(records) - g
    print(f"Done -> {out}/\n  genuine : {g}\n  tampered: {t}\n  total   : {len(records)}")
    print(f"  manifest: {out}/labels.csv  and  {out}/labels.json")


# --------------------------------------------------------------------------- #
# Manual edit mode
# --------------------------------------------------------------------------- #
EDITABLE = ["name", "surname", "given_name", "dob", "expiry", "valid_from", "valid_until",
            "passport_no", "visa_no", "nationality", "sex", "place_of_birth",
            "place_of_issue", "issue", "visa_type", "entries", "duration", "port", "photo"]


def edit(args) -> None:
    meta_path = Path(args.meta)
    if meta_path.suffix == ".png":
        meta_path = meta_path.with_suffix(".json")
    meta = json.loads(meta_path.read_text())
    doc_type = meta["doc_type"]
    data = dict(meta["fields"])
    renderer = render_passport if doc_type == "passport" else render_visa
    rnd = random.Random(args.seed)

    edits: dict[str, str] = {}
    for item in args.set or []:
        if "=" not in item:
            raise SystemExit(f"--set expects key=value, got: {item}")
        k, v = item.split("=", 1)
        edits[k.strip()] = v.strip()

    if args.interactive:
        print(f"\nEditing {doc_type}: {meta_path.name}")
        print("Editable fields (blank = keep, 'photo' = type 'replace'):\n")
        for k in EDITABLE:
            if k == "photo":
                ans = input("photo [keep/replace]: ").strip().lower()
                if ans == "replace":
                    edits["photo"] = "replace"
            elif k in data:
                ans = input(f"{k} [{data[k]}]: ").strip()
                if ans:
                    edits[k] = ans

    if not edits:
        raise SystemExit("Nothing to edit. Use --set field=value or --interactive.")

    hint = {"field": None, "alt_font": not args.clean_edit, "jitter": {}}
    changes = []
    for k, v in edits.items():
        if k == "photo":
            hint["field"] = "photo"
            changes.append({"field": "photo", "original_value": "photo_v0", "new_value": "photo_v1"})
            continue
        changes.append({"field": k, "original_value": data.get(k), "new_value": v})
        data[k] = v
        hint["field"] = k
        if not args.clean_edit:
            hint["jitter"][k] = (rnd.choice([-2, -1, 1, 2]), rnd.choice([-3, -2, 2, 3]))

    if doc_type == "passport":
        if "surname" in edits or "given_name" in edits:
            data["name"] = f"{data['given_name']} {data['surname']}"
        data["mrz"] = build_mrz(data) if args.update_mrz else meta["fields"].get("mrz")

    img, boxes = renderer(data, tamper=hint)
    bbox = boxes.get(hint["field"] or "", [])
    if bbox and not args.clean_edit:
        img = add_local_artifacts(img, bbox, rnd)

    out_path = Path(args.out) if args.out else (
        meta_path.parent.parent / "tampered" / f"{meta_path.stem}_{args.tamper_type}.png")
    save_doc(img, {"doc_type": doc_type, "label": "tampered",
                   "source": str(meta_path.with_suffix(".png")),
                   "tamper": {"tamper_type": args.tamper_type, "changes": changes,
                              "mrz_consistent": bool(args.update_mrz)},
                   "tamper_bbox": bbox, "fields": data, "boxes": boxes}, out_path)
    print(f"Saved tampered document -> {out_path}")
    for c in changes:
        print(f"  {c['field']}: {c['original_value']!r} -> {c['new_value']!r}")


# --------------------------------------------------------------------------- #
def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd")

    g = sub.add_parser("generate", help="build the full dataset")
    g.add_argument("--count", type=int, default=50, help="people (1 passport + 1 visa each)")
    g.add_argument("--out", default="SIH_Dataset")
    g.add_argument("--seed", type=int, default=42)
    g.add_argument("--tampers", nargs="+",
                   default=["name", "dob", "expiry", "photo", "stamp", "text_block"])
    g.add_argument("--tampers-per-doc", type=int, default=2)
    g.add_argument("--mrz-update-rate", type=float, default=0.3,
                   help="fraction of tampered passports where the MRZ is also updated (harder cases)")
    g.add_argument("--no-artifacts", dest="artifacts", action="store_false",
                   help="skip local recompression/colour-shift artefacts")
    g.add_argument("--clean", action="store_true", help="delete the output folder first")
    g.set_defaults(func=generate, artifacts=True)

    e = sub.add_parser("edit", help="hand-edit one document into a tampered copy")
    e.add_argument("meta", help="path to a genuine .json (or .png) produced by generate")
    e.add_argument("--set", action="append", metavar="FIELD=VALUE")
    e.add_argument("--interactive", action="store_true")
    e.add_argument("--out", help="output png path")
    e.add_argument("--tamper-type", default="manual")
    e.add_argument("--update-mrz", action="store_true", help="also recompute the MRZ")
    e.add_argument("--clean-edit", action="store_true", help="no font/offset/compression artefacts")
    e.add_argument("--seed", type=int, default=0)
    e.set_defaults(func=edit)

    args = ap.parse_args()
    if not args.cmd:
        args = ap.parse_args(["generate"])
    args.func(args)


if __name__ == "__main__":
    main()
