import os
import json
import re
import base64
from playwright.sync_api import sync_playwright

# Output directory on Desktop
OUTPUT_DIR = "/Users/myoozinc/Desktop/imagenes de centros"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read logo base64
LOGO_PATH = "/Users/myoozinc/Desktop/Varios/acopio col/assets/logo.jpg"
logo_base64_src = ""
if os.path.exists(LOGO_PATH):
    with open(LOGO_PATH, "rb") as f:
        logo_base64_src = f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"

# Read data.js
DATA_PATH = "/Users/myoozinc/Desktop/Varios/acopio col/data.js"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    js_content = f.read()

# Extract items from initialData using regex or node output
def sanitize_filename(name):
    clean = re.sub(r'[^\w\s-]', '', name).strip()
    return re.sub(r'[-\s]+', '_', clean)

# Parse data.js by writing a tiny node helper to output JSON
import subprocess
result = subprocess.run([
    'node', '-e', '''
    const fs = require("fs");
    let content = fs.readFileSync("data.js", "utf8").replace(/const /g, "var ");
    eval(content);
    console.log(JSON.stringify(initialData));
    '''
], capture_output=True, text=True, cwd="/Users/myoozinc/Desktop/Varios/acopio col")

data = json.loads(result.stdout)

category_metadata = {
    "collectionCenters": {"emoji": "📦", "name": "Centro de Acopio", "prefix": "Acopio"},
    "shelters": {"emoji": "🏠", "name": "Refugio Temporal", "prefix": "Refugio"},
    "kitchens": {"emoji": "🍲", "name": "Comedor de Auxilio", "prefix": "Comedor"},
    "petShelters": {"emoji": "🐾", "name": "Protección Animal", "prefix": "Mascotas"},
    "volunteerHubs": {"emoji": "🤝", "name": "Puesto Voluntariado", "prefix": "Voluntariado"},
    "hospitals": {"emoji": "🏥", "name": "Salud / Banco de Sangre", "prefix": "Salud"}
}

all_items = []
count = 1

for cat_key, meta in category_metadata.items():
    items = data.get(cat_key, [])
    for item in items:
        all_items.append({
            "index": count,
            "category_key": cat_key,
            "category_emoji": meta["emoji"],
            "category_name": meta["name"],
            "prefix": meta["prefix"],
            "title": item.get("name") or "Espacio de Auxilio",
            "address": f"{item.get('address') or ''} ({item.get('city') or ''})".strip(),
            "contact": item.get("contactName") or "Equipo de Coordinación",
            "phone": item.get("phone") or item.get("contact") or "Línea 123",
            "needs": item.get("needs") or item.get("details") or item.get("acceptedTypes") or item.get("rolesNeeded") or "Coordinación y recepción de insumos",
            "schedule": item.get("schedule") or "Atención Continuada"
        })
        count += 1

print(f"Total items to generate: {len(all_items)}")

html_template = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f8fafc;
    width: 1080px;
    height: 1080px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36px;
    color: #1e293b;
  }}
  
  .card-container {{
    width: 1008px;
    background: #ffffff;
    border-radius: 28px;
    padding: 44px 48px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 1008px;
    position: relative;
  }}

  .card-header {{
    margin-bottom: 20px;
  }}

  .card-title {{
    font-size: 36px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.25;
    margin-bottom: 18px;
    letter-spacing: -0.5px;
  }}

  .badge-row {{
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }}

  .category-pill {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: #475569;
    background: #f1f5f9;
    padding: 7px 18px;
    border-radius: 30px;
    border: 1px solid #cbd5e1;
  }}

  .verified-pill {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 800;
    color: #15803d;
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
    padding: 7px 20px;
    border-radius: 30px;
  }}

  .card-body {{
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 20px;
  }}

  .info-item {{
    display: flex;
    align-items: flex-start;
    gap: 16px;
    font-size: 24px;
    line-height: 1.45;
    color: #334155;
  }}

  .info-icon {{
    font-size: 28px;
    flex-shrink: 0;
    margin-top: 2px;
  }}

  .info-text strong {{
    color: #0f172a;
    font-weight: 800;
  }}

  .phone-link {{
    color: #0284c7;
    text-decoration: underline;
    font-weight: 700;
  }}

  .card-footer {{
    border-top: 2px dashed #e2e8f0;
    padding-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}

  .brand-group {{
    display: flex;
    align-items: center;
    gap: 14px;
  }}

  .brand-logo {{
    width: 46px;
    height: 46px;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }}

  .brand-name {{
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
  }}

  .brand-subtitle {{
    font-size: 16px;
    color: #64748b;
    font-weight: 600;
  }}

  .web-link {{
    font-size: 20px;
    font-weight: 800;
    color: #003893;
    background: rgba(0, 56, 147, 0.06);
    padding: 8px 18px;
    border-radius: 20px;
    border: 1px solid rgba(0, 56, 147, 0.18);
  }}
</style>
</head>
<body>
  <div class="card-container">
    <div>
      <div class="card-header">
        <h1 class="card-title">{title}</h1>
        <div class="badge-row">
          <div class="category-pill">{category_emoji} {category_name}</div>
          <div class="verified-pill">🛡️ Registro Verificado CO (Evidencia en Custodia)</div>
        </div>
      </div>

      <div class="card-body">
        <div class="info-item">
          <span class="info-icon">📍</span>
          <span class="info-text">{address}</span>
        </div>

        <div class="info-item">
          <span class="info-icon">👤</span>
          <span class="info-text"><strong>Contacto:</strong> {contact}</span>
        </div>

        <div class="info-item">
          <span class="info-icon">📞</span>
          <span class="info-text"><span class="phone-link">{phone}</span></span>
        </div>

        <div class="info-item">
          <span class="info-icon">📋</span>
          <span class="info-text"><strong>Insumos:</strong> {needs}</span>
        </div>

        <div class="info-item">
          <span class="info-icon">🕒</span>
          <span class="info-text"><strong>Horario:</strong> {schedule}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="brand-group">
        <img src="{logo_src}" class="brand-logo" alt="Acopio COL">
        <div>
          <div class="brand-name">Acopio COL</div>
          <div class="brand-subtitle">🇨🇴 Respuesta Terremoto Colombia 2026</div>
        </div>
      </div>
      <div class="web-link">acopio-col.vercel.app</div>
    </div>
  </div>
</body>
</html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    page = browser.new_page(viewport={'width': 1080, 'height': 1080})
    
    for item in all_items:
        filename = f"{item['index']:02d}_{item['prefix']}_{sanitize_filename(item['title'])}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        html_rendered = html_template.format(
            title=item["title"],
            category_emoji=item["category_emoji"],
            category_name=item["category_name"],
            address=item["address"],
            contact=item["contact"],
            phone=item["phone"],
            needs=item["needs"],
            schedule=item["schedule"],
            logo_src=logo_base64_src
        )
        
        page.set_content(html_rendered)
        page.wait_for_timeout(50)
        page.screenshot(path=filepath, full_page=True)
        print(f"Generated ({item['index']}/{len(all_items)}): {filename}")

    browser.close()

print(f"\n✨ ALL {len(all_items)} CARDS GENERATED SUCCESSFULLY IN: {OUTPUT_DIR}")
