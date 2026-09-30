# import discord
# import asyncio
# import random

# from discord.ext import commands
# from discord import app_commands
from dotenv import load_dotenv
import os

load_dotenv()

import gspread
import json
import re
from pathlib import Path
from google.oauth2.service_account import Credentials

scope = ['https://www.googleapis.com/auth/spreadsheets']
creds = Credentials.from_service_account_file('toc-api.json', scopes=scope)
client = gspread.authorize(creds)

SPREADSHEET_ID = os.getenv('GOOGLE_SHEETS_API_KEY')
spreadsheet = client.open_by_key(SPREADSHEET_ID)

# list
towers_list = spreadsheet.worksheet("Towers")
obby_list = spreadsheet.worksheet("Obby (60 FPS)")
pacebase_list = spreadsheet.worksheet("Pace Based")
creations_list = spreadsheet.worksheet("Creations")

# pack obby
packobby_list = spreadsheet.worksheet("PackObby")

# rank
rank_top_thai = spreadsheet.worksheet("Players DataBase")

def _column_indexes(headers):
    normalized = {
        re.sub(r"[^a-z0-9]+", " ", header.strip().lower()).strip(): index
        for index, header in enumerate(headers)
    }

    def find(*names, default=None):
        for name in names:
            index = normalized.get(name)
            if index is not None:
                return index
        return default

    columns = {
        "top": find("top", default=0),
        "name": find("tower name", "obby name", "name", default=1),
        "rateKey": find("difficulty", default=2),
        "difficulty": find("", default=3),
        "points": find("points", "point", default=5),
        "firstVictor": find("first victor", default=5),
        "firstVictorUrl": find("first victor link", "first victor url"),
        "creators": find("creator s", "creator", "obby creator s", "creators", default=6),
        "location": find("location practice", "location", default=7),
        "locationLink": find("location link"),
        "gameStyle": find("gamestyle", "gameplay style", "game style", default=8),
        "difficultySource": find("difficulty source", "difficulty indicators", default=9),
        "url": find("link video", "link", "url"),
        "fps": find("fps", default=10),
        "length": find("length", default=11),
        "quality": find("quality", default=12),
        "verifiedDate": find("verif date", "verification date", "verified date", default=13),
        "tier": find("tier", "difficulty tiers"),
        "rate": find("etoh", default=3),
        "type": find("type"),
        "playable": find("playable"),
    }

    if "tower name" in normalized:
        columns.update({
            "top": 0, "name": 1, "rateKey": 2, "difficulty": 3,
            "points": 5, "firstVictor": 6, "creators": 8, "location": 9,
            "locationLink": 10, "gameStyle": 11, "difficultySource": 12,
            "url": 7, "fps": 13, "length": 14, "quality": 15, "verifiedDate": 16,
        })
    elif "tower obby name" in normalized:
        columns.update({
            "top": 0, "name": 1, "rateKey": 3, "difficulty": 4,
            "points": 5, "firstVictor": 6, "firstVictorUrl": 7,
            "creators": 8, "location": 10, "locationLink": 11,
            "gameStyle": 12, "difficultySource": 13, "url": 7,
            "fps": 15, "length": 16, "quality": 19, "verifiedDate": 17,
        })
    elif "obby name" in normalized and "fe2" not in normalized:
        columns.update({
            "top": 0, "name": 1, "locationLink": 2, "tier": 3,
            "rateKey": 4, "points": 5, "rate": 6, "firstVictor": 7,
            "url": 8, "creators": 9, "location": 10, "gameStyle": 12,
            "difficultySource": 13, "type": 14, "length": 15,
            "verifiedDate": 16, "quality": 17,
        })
    elif "fe2" in normalized:
        columns.update({
            "top": 0, "name": 1, "creators": 2, "rateKey": 3,
            "fe2": 4, "points": 5, "rate": 6,
            "difficultySource": 8, "length": 9, "playable": 10,
            "locationLink": 12, "firstVictor": 13, "url": 14,
            "verifiedDate": 15, "quality": 16,
        })

    return columns


def _cell(row, columns, key):
    index = columns.get(key)
    return row[index].strip() if index is not None and index < len(row) else ""


def _number(value, default=0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _creators(value):
    return [creator.strip() for creator in value.split(",") if creator.strip()]

def _completion_key(value):
    value = re.sub(r"^\[[^\]]+\]\s*", "", value.strip())
    value = re.sub(r"\s+PB\s*(?:\([^)]*\))?\s*$", "", value, flags=re.IGNORECASE)
    value = re.sub(
        r"\s*[\[(]\s*\d+\??\s*FPS\s*[\])]\s*$",
        "",
        value,
        flags=re.IGNORECASE,
    )
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def _profile_picture(username, value):
    if value:
        return value

    picture_dir = Path(__file__).parent / "images" / "PFP"
    if picture_dir.exists():
        username_key = _completion_key(username)
        for image in picture_dir.iterdir():
            if image.is_file() and _completion_key(image.stem) == username_key:
                return f"/images/PFP/{image.name}"
    return "/images/TOC.png"


def _write_js(output_name, export_name, imports, items, expressions):
    js_items = []
    for item in items:
        fields = []
        for key, value in item.items():
            if key in expressions:
                fields.append(f"    {key}: {expressions[key](value)}")
            else:
                fields.append(f"    {key}: {json.dumps(value, ensure_ascii=True)}")
        js_items.append("  {\n" + ",\n".join(fields) + "\n  }")

    output = Path(__file__).parent / "assets" / output_name
    exports = f"export {{ {export_name} }};"
    if export_name == "players":
        exports += "\nexport { formatCompletionItem };\nexport default players;"
    output.write_text(
        imports + "\n\n" + f"const {export_name} = [\n"
        + ",\n".join(js_items)
        + f"\n];\n\n{exports}\n",
        encoding="utf-8",
    )


def _write_creations_js(verified, unverified, expressions):
    def serialize_items(items):
        js_items = []
        for item in items:
            fields = []
            for key, value in item.items():
                if key in expressions:
                    fields.append(f"    {key}: {expressions[key](value)}")
                else:
                    fields.append(f"    {key}: {json.dumps(value, ensure_ascii=True)}")
            js_items.append("  {\n" + ",\n".join(fields) + "\n  }")
        return ",\n".join(js_items)

    output = Path(__file__).parent / "assets" / "creations_obby.js"
    output.write_text(
        'import { Q_COLORS, DIFF_STYLES } from "./keyword.js";\n\n'
        + "const Verified_Creations_Obby = [\n"
        + serialize_items(verified)
        + "\n];\n\n"
        + "const Unverified_Creations_Obby = [\n"
        + serialize_items(unverified)
        + "\n];\n\n"
        + "const Creations_Obby = [...Verified_Creations_Obby, ...Unverified_Creations_Obby];\n\n"
        + "export { Verified_Creations_Obby, Unverified_Creations_Obby, Creations_Obby };\n",
        encoding="utf-8",
    )
    
#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def get_name_tower(data=None):
    rows = data or towers_list.get_all_values()
    if not rows:
        return []

    columns = _column_indexes(rows[0])
    towers = []

    for row in rows[1:]:
        if not _cell(row, columns, "name"):
            continue
        raw_name = _cell(row, columns, "name")
        name_match = re.match(r"^[^()]+\((.+)\)$", raw_name)
        name = name_match.group(1).strip() if name_match else raw_name
        difficulty_text = _cell(row, columns, "difficulty")
        difficulty = _number(difficulty_text)
        quality = _cell(row, columns, "quality")
        difficulty_name = next(
            (name for name, diffnum in (("Unreal", 13), ("Horrific", 12), ("Catastrophic", 11),
                                        ("Terrifying", 10), ("Extreme", 9), ("Insane", 8))
             if difficulty >= diffnum),
            "Insane",
        )

        towers.append({
            "name": name,
            "difficulty": difficulty_name,
            "rate": difficulty,
            "rateKey": _cell(row, columns, "rateKey"),
            "points": _number(_cell(row, columns, "points")),
            "firstVictor": _cell(row, columns, "firstVictor").rstrip("*"),
            "firstVictorUrl": _cell(row, columns, "firstVictorUrl"),
            "creators": _creators(_cell(row, columns, "creators")),
            "location": _cell(row, columns, "location"),
            "locationLink": _cell(row, columns, "locationLink"),
            "gameStyle": _cell(row, columns, "gameStyle"),
            "difficultySource": _cell(row, columns, "difficultySource"),
            "fps": int(_cell(row, columns, "fps")) if _cell(row, columns, "fps").isdigit() else 0,
            "verifiedDate": _cell(row, columns, "verifiedDate"),
            "length": _cell(row, columns, "length"),
            "quality": quality,
            "top": int(_cell(row, columns, "top")) if _cell(row, columns, "top").isdigit() else len(towers) + 1,
            "url": _cell(row, columns, "url"),
        })

    difficulty_expr = {
        "Unreal": "DIFF_STYLES.Unreal",
        "Horrific": "DIFF_STYLES.Horrific",
        "Catastrophic": "DIFF_STYLES.Catastrophic",
        "Terrifying": "DIFF_STYLES.Terrifying",
        "Extreme": "DIFF_STYLES.Extreme",
        "Insane": "DIFF_STYLES.Insane",
    }
    _write_js(
        "towers_list.js",
        "Towers",
        'import { Q_COLORS, DIFF_STYLES } from "./keyword.js";',
        towers,
        {
            "difficulty": lambda value: difficulty_expr[value],
            "quality": lambda value: f'Q_COLORS[{json.dumps(value)}] || "{value}"',
        },
    )
    return towers

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


def get_name_obby(data=None):
    rows = data or obby_list.get_all_values()
    if not rows:
        return []

    columns = _column_indexes(rows[0])
    obbies = []
    for row in rows[1:]:
        name = _cell(row, columns, "name")
        if not name:
            continue
        tier = int(_number(_cell(row, columns, "tier")))
        obbies.append({
            "name": name,
            "tiers": tier,
            "rate": _number(_cell(row, columns, "rate")),
            "points": _number(_cell(row, columns, "points")),
            "rateKey": _cell(row, columns, "rateKey"),
            "firstVictor": _cell(row, columns, "firstVictor").rstrip("*"),
            "creators": _creators(_cell(row, columns, "creators")),
            "location": _cell(row, columns, "location"),
            "locationLink": _cell(row, columns, "locationLink"),
            "gameStyle": _cell(row, columns, "gameStyle"),
            "difficultySource": _cell(row, columns, "difficultySource"),
            "type": _cell(row, columns, "type"),
            "verifiedDate": _cell(row, columns, "verifiedDate"),
            "length": _cell(row, columns, "length"),
            "quality": _cell(row, columns, "quality"),
            "top": int(_number(_cell(row, columns, "top"), len(obbies) + 1)),
            "url": _cell(row, columns, "url"),
        })

    _write_js(
        "tieredobby_list.js",
        "TieredList",
        'import { Q_COLORS, TIERED_OBBY } from "./keyword.js";',
        obbies,
        {
            "tiers": lambda value: f"TIERED_OBBY[{value}]",
            "quality": lambda value: f'Q_COLORS[{json.dumps(value)}] || "{value}"',
        },
    )
    return obbies

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def get_name_pace(data=None):
    rows = data or pacebase_list.get_all_values()
    if not rows:
        return []

    columns = _column_indexes(rows[0])
    pace_items = []
    for row in rows[1:]:
        name = _cell(row, columns, "name")
        if not name:
            continue
        rate = _number(_cell(row, columns, "rate"), None)
        pace_items.append({
            "name": name,
            "pacediff": "Ethereal" if rate is not None and rate >= 11
            else "Legendary" if rate is not None and rate >= 10
            else "Extreme",
            "rate": rate or 0,
            "points": _number(_cell(row, columns, "points")),
            "rateKey": _cell(row, columns, "rateKey"),
            "firstVictor": _cell(row, columns, "firstVictor").rstrip("*"),
            "creators": _creators(_cell(row, columns, "creators")),
            "location": "",
            "locationLink": _cell(row, columns, "locationLink"),
            "gameStyle": _cell(row, columns, "difficultySource"),
            "difficultySource": _cell(row, columns, "difficultySource"),
            "type": _cell(row, columns, "playable"),
            "verifiedDate": _cell(row, columns, "verifiedDate"),
            "length": _cell(row, columns, "length"),
            "quality": _cell(row, columns, "quality"),
            "top": int(_number(_cell(row, columns, "top"), len(pace_items) + 1)),
            "url": _cell(row, columns, "url"),
        })

    _write_js(
        "pacebased.js",
        "PaceBased",
        'import { Q_COLORS, Pace_Based_STYLES } from "./keyword.js";',
        pace_items,
        {
            "pacediff": lambda value: f"Pace_Based_STYLES.{value}",
            "quality": lambda value: f'Q_COLORS[{json.dumps(value)}] || "{value}"',
        },
    )
    return pace_items

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
def get_name_creations_obby(data=None):
    rows = data or creations_list.get_all_values()
    if not rows:
        return []

    columns = _column_indexes(rows[0])
    verified_creations = []
    unverified_creations = []

    for row in rows[1:]:
        if not _cell(row, columns, "name"):
            continue
        raw_name = _cell(row, columns, "name")
        name_match = re.match(r"^[^()]+\((.+)\)$", raw_name)
        name = name_match.group(1).strip() if name_match else raw_name
        difficulty_text = _cell(row, columns, "difficulty")
        difficulty = _number(difficulty_text)
        quality = _cell(row, columns, "quality")
        difficulty_name = next(
            (name for name, diffnum in (("Unreal", 13), ("Horrific", 12), ("Catastrophic", 11),
                                        ("Terrifying", 10), ("Extreme", 9), ("Insane", 8))
             if difficulty >= diffnum),
            "Insane",
        )

        creation = {
            "name": name,
            "difficulty": difficulty_name,
            "rate": difficulty,
            "rateKey": _cell(row, columns, "rateKey"),
            "points": _number(_cell(row, columns, "points")),
            "firstVictor": _cell(row, columns, "firstVictor").rstrip("*"),
            "creators": _creators(_cell(row, columns, "creators")),
            "location": _cell(row, columns, "location"),
            "locationLink": _cell(row, columns, "locationLink"),
            "gameStyle": _cell(row, columns, "gameStyle"),
            "difficultySource": _cell(row, columns, "difficultySource"),
            "fps": int(_cell(row, columns, "fps")) if _cell(row, columns, "fps").isdigit() else 0,
            "verifiedDate": _cell(row, columns, "verifiedDate"),
            "length": _cell(row, columns, "length"),
            "quality": quality,
            "top": int(_cell(row, columns, "top")) if _cell(row, columns, "top").isdigit() else len(verified_creations) + len(unverified_creations) + 1,
            "url": _cell(row, columns, "url"),
        }
        verification_value = _cell(row, columns, "verifiedDate").strip().lower()
        if verification_value and verification_value not in {"n/a", "na", "none", "-"}:
            verified_creations.append(creation)
        else:
            unverified_creations.append(creation)

    difficulty_expr = {
        "Unreal": "DIFF_STYLES.Unreal",
        "Horrific": "DIFF_STYLES.Horrific",
        "Catastrophic": "DIFF_STYLES.Catastrophic",
        "Terrifying": "DIFF_STYLES.Terrifying",
        "Extreme": "DIFF_STYLES.Extreme",
        "Insane": "DIFF_STYLES.Insane",
    }
    _write_creations_js(
        verified_creations,
        unverified_creations,
        {
            "difficulty": lambda value: difficulty_expr[value],
            "quality": lambda value: f'Q_COLORS[{json.dumps(value)}] || "{value}"',
        },
    )
    return verified_creations + unverified_creations

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def get_pack_obby(data=None):
    rows = data or packobby_list.get_all_values()
    if not rows:
        return {}

    section_names = {
        "main placements for thai list": "tower_pack_obby",
        "tiered obby 60 fps": "tiered_pack_obby_60fps",
        "pace based": "pace_based",
        "misc placements": "misc_placements_obby",
        "tiered obby high fps": "tiered_pack_obby_high_fps",
        "progress": None,
        "progerss": None,
    }
    exports = list(dict.fromkeys(
        section for section in section_names.values() if section
    ))
    items_by_section = {section: [] for section in exports}
    current_section = None
    columns = {}

    for row in rows:
        values = [value.strip() for value in row]
        if not values or not values[0]:
            continue

        normalized = [
            re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
            for value in values
        ]
        if "name" in normalized and "difficulty" in normalized and "points" in normalized:
            columns = {header: index for index, header in enumerate(normalized) if header}
            continue

        if all(not value for value in values[1:]):
            current_section = section_names.get(normalized[0])
            continue

        if not current_section or not columns:
            continue

        name_index = columns["name"]
        name = values[name_index] if name_index < len(values) else ""
        if not name or name.lower() == "n/a":
            continue

        difficulty_index = columns["difficulty"]
        points_index = columns["points"]
        item = {
            "tower_name": name,
            "Difficulty": _number(
                values[difficulty_index] if difficulty_index < len(values) else "",
                None,
            ),
            "points": _number(
                values[points_index] if points_index < len(values) else "",
                None,
            ),
        }
        if "weight" in columns:
            weight_index = columns["weight"]
            item["Weight"] = _number(
                values[weight_index] if weight_index < len(values) else "",
                None,
            )
        if "additional achievements" in columns:
            achievement_index = columns["additional achievements"]
            achievement = values[achievement_index] if achievement_index < len(values) else ""
            if achievement:
                item["additional_achievements"] = achievement

        items_by_section[current_section].append(item)

    js_lines = []
    for section in exports:
        js_lines.append(f"const {section} = [")
        js_items = []
        for item in items_by_section[section]:
            fields = [
                f"  {key}: {json.dumps(value, ensure_ascii=True)}"
                for key, value in item.items()
            ]
            js_items.append("  { " + ", ".join(fields) + " },")
        js_lines.extend(js_items)
        js_lines.append("];\n")

    js_lines.append(f"export {{ {', '.join(exports)} }};")
    output = Path(__file__).parent / "assets" / "packobby.js"
    output.write_text("\n".join(js_lines) + "\n", encoding="utf-8")
    return items_by_section

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def get_top_thai_obbyist(data=None):
    rows = data or rank_top_thai.get_all_values()
    if not rows:
        return []

    headers = {
        re.sub(r"[^a-z0-9]+", " ", header.strip().lower()).strip(): index
        for index, header in enumerate(rows[0])
    }

    def cell(row, *names, default=""):
        for name in names:
            key = re.sub(r"[^a-z0-9]+", " ", name.strip().lower()).strip()
            index = headers.get(key)
            if index is not None and index < len(row):
                return row[index].strip()
        return default

    def completion_list(value):
        if not value or value.strip().lower() == "n/a":
            return []
        return [
            item.strip()
            for item in re.split(r",\s*(?=\[)|\r?\n", value)
            if item.strip() and item.strip().lower() != "n/a"
        ]

    players = []
    for row in rows[1:]:
        username = cell(row, "Name", "Username")
        if not username or username.lower() == "formula":
            continue

        tower_hardest = completion_list(cell(row, "Hardest Tower"))
        tiered_hardest = completion_list(cell(row, "Hardest Tiered"))
        paced_hardest = completion_list(cell(row, "Hardest Paced"))
        hardest = completion_list(cell(row, "Hardest"))
        if not hardest:
            hardest = tower_hardest or tiered_hardest or paced_hardest

        tower_completions = completion_list(cell(row, "Completions Tower"))
        tiered_completions = completion_list(cell(row, "Completions Tiered"))
        paced_completions = completion_list(cell(row, "Completions Paced"))

        players.append({
            "username": username,
            "profileUrl": cell(row, "Channel Link", "Profile Link", "Profile URL"),
            "pfpUrl": _profile_picture(
                username,
                cell(row, "Profile Picture", "Profile Image", "PFP", "PFP URL", "Proflie"),
            ),
            "type": cell(row, "Type", "Player Type"),
            "points": _number(cell(row, "Points", "Point")),
            "hardest_tower": tower_hardest or ["N/A"],
            "hardest_tiered": tiered_hardest or ["N/A"],
            "hardest_paced": paced_hardest or ["N/A"],
            "hardest": hardest or ["N/A"],
            "device": cell(row, "Device", "Platform"),
            "completions_tower": tower_completions or ["N/A"],
            "completions_tiered": tiered_completions or ["N/A"],
            "completions_paced": paced_completions or None,
            "status": cell(row, "Status"),
            "youtubeId": cell(
                row,
                "Completion Proof ID",
                "Completion Records",
                "Completion Record",
                "Completion Record URL",
                "Record Link",
            ),
        })

    _write_js(
        "player.js",
        "players",
            '''import { TIERED_OBBY, DIFF_STYLES, Pace_Based_STYLES } from "./keyword.js";

function formatCompletionItem(item) {
    if (item === "N/A" || typeof item !== "string" || item.trim() === "") return item || "";
    const match = item.match(/^\\[([^\\]]+)\\]/);
    if (!match) return item;
    const style = DIFF_STYLES[match[1]] || Pace_Based_STYLES[match[1]] || TIERED_OBBY[Number(match[1].replace("Tier ", ""))];
    return style ? `<span style="color: ${style.color};">${match[0]}</span>${item.slice(match[0].length)}` : item;
}''',
        players,
        {},
    )
    return players

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

if __name__ == "__main__":
    get_name_tower()
    get_name_obby()
    get_name_pace()
    get_name_creations_obby()
    get_pack_obby()
    get_top_thai_obbyist()