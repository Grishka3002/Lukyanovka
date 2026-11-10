"""Reproducible Playwright checks. Never sends a booking to the real server.

Requires Python playwright and its Chromium browser. Not executed when absent.
Usage: python tests/browser-check.py --url https://host
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', required=True)
parser.add_argument('--output', default='qa/browser')
args = parser.parse_args()
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height in [(390, 844), (820, 1180), (1440, 1000)]:
        page = browser.new_page(viewport={'width': width, 'height': height})
        # Block real submissions even if a later test accidentally triggers one.
        page.route('**/api/booking', lambda route: route.fulfill(
            status=200, content_type='application/json', body='{"ok":true,"delivered":false}'))
        page.goto(args.url, wait_until='networkidle')
        assert page.locator('h1').count() == 1
        hero = page.locator('.hero-content').bounding_box()
        assert hero['x'] >= 0 and hero['x'] + hero['width'] <= width + 1
        page.screenshot(path=str(out / f'home-{width}.png'))
        if width <= 820:
            toggle = page.get_by_role('button', name='Открыть меню', exact=True)
            toggle.click()
            assert toggle.get_attribute('aria-expanded') == 'true'
            assert page.locator('main').evaluate('(e) => e.inert')
            assert page.locator('#siteNav').evaluate('(e) => getComputedStyle(e).visibility') == 'visible'
            page.screenshot(path=str(out / f'menu-{width}.png'))
            page.keyboard.press('Escape')
            assert toggle.get_attribute('aria-expanded') == 'false'
            assert page.locator('#siteNav').evaluate('(e) => e.inert')
        page.goto(args.url.rstrip('/') + '/booking?room=Комната%2003', wait_until='networkidle')
        assert page.locator('#roomSelect').input_value() == 'Комната 03'
        assert page.locator('.booking-details').get_attribute('open') is not None
        page.get_by_role('button', name='Отправить Катерине', exact=True).click()
        assert page.locator('[name=phone]').evaluate('(e) => document.activeElement === e')
        assert page.locator('[name=phone]').get_attribute('aria-invalid') == 'true'
        page.screenshot(path=str(out / f'validation-{width}.png'))
        results.append({'width': width, 'status': 'passed'})
        page.close()
    browser.close()
(out / 'results.json').write_text(json.dumps(results), encoding='utf-8')
