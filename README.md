# SharikNama – Eid-ul-Adha Meat Distribution Tracker

A beautiful, modern, and fully responsive web app for tracking and presenting Qurbani meat share distribution for Eid-ul-Adha.

## Features

- **Festive, Modern UI:** Responsive design with a crescent moon logo, year, and Eid-ul-Adha theme.
- **Editable Table:** Add, edit, and delete parts (meat portions) with fields for part name, total amount, and amount per share.
- **Tally System:** Interactive tally marks (with real tally visuals) for each part, with +/– buttons.
- **Total Row:** Always at the bottom, with merged columns for totals.
- **Local Storage:** All data is saved in your browser and persists between sessions. Option to clear data.
- **Export/Print as PDF:** Print/export a fixed, non-responsive template with only the table rows and totals dynamically generated. Cow and goat images appear as a fixed, mirrored footer on every print page.
- **Offline/Online Toggle:** Switch between offline (PWA) and online modes with a sliding toggle and info tooltip.
- **Accessibility:** Keyboard accessible, color-coded tooltips, and responsive layout for all devices.

## How to Use

1. **Set Total Shares:** Enter the total number of Qurbani shares at the top.
2. **Add Parts:** Click "Add Part" to add a new row. Enter the part name and total amount (kg). The amount per share is calculated automatically.
3. **Tally Distribution:** Use the +/– buttons to track how many shares of each part have been distributed.
4. **Export/Print:** Click "Export as PDF" to open the print dialog. The print layout is fixed and includes festive art and mirrored animal images.
5. **Offline Mode:** Use the toggle to enable offline support (PWA). Data is always saved locally.
6. **Clear Data:** Use the "Clear Saved Data" button to reset all entries.

## Print/Export Details
- The print template is fixed width and non-responsive for consistent results.
- Only the table rows and totals are dynamically generated at print time.
- Cow and goat images appear as a fixed, mirrored footer at the bottom of every print page.
- The year and shares fields are dynamically updated on export.

## Project Structure

```
index.html         # Main UI and print template
style.css          # All styles (UI, print, responsive)
script.js          # App logic (table, tally, storage, print, etc.)
sw.js              # Service worker for offline support
img/
  cow.png          # Cow image for print footer
  goat.png         # Goat image for print footer
```

## Requirements
- Modern browser (Chrome, Edge, Firefox, Safari)
- No installation or server required (pure HTML/CSS/JS)

## License
MIT License

---
Created with ❤️ for Eid-ul-Adha Qurbani distribution.
