Rollercoin → RollercoinCalculator Prefill Extension

What it does
- Adds a floating "Open Calculator" button on pages matching https://rollercoin.com/p/*.
- When clicked it opens https://rollercoincalculator.app/en/ in a new tab and passes the identifier (the path segment after /p/) in the `prefill` query parameter.
- On the calculator site the extension reads `?prefill=...` and fills the first element with class `power-value-input` with that value.

Files
- manifest.json
- content_p.js
- content_calc.js
- README.md

Install locally (Chrome / Edge)
1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable "Developer mode".
3. Click "Load unpacked" and select this folder: `RCIncomeExtension`.
4. Navigate to a Rollercoin page like `https://rollercoin.com/p/XYZ` and click the button.

Notes
- If the calculator site changes its input class name, update `content_calc.js` selector.
- The script waits up to 8s for `.power-value-input` to appear.
