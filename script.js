/* 
================================================================================
  NEWS CARD PRO - MAIN SCRIPT
================================================================================
  This file controls all the visual generation of the news card. Wait for fonts 
  to load, read the inputs (headline, image, category), and draw everything 
  on a hidden HTML Canvas which is then displayed/downloaded to the user.
================================================================================
*/

// Grab the HTML canvas element where we will draw everything
const canvas = document.getElementById('newsCanvas');
const ctx = canvas.getContext('2d'); // The 2D rendering context for the canvas

// Input elements from the sidebar UI
const imageUpload = document.getElementById('imageUpload');
const headlineInput = document.getElementById('headline');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const sourceInput = document.getElementById('source');
const bgStyleInput = document.getElementById('bgStyle');
const downloadBtn = document.getElementById('downloadBtn');

// Variable to store the loaded image object
let uploadedImage = null;

/*
  CONFIG - Master configuration object
  ------------------------------------
  You can tweak these values to easily change the card's dimensions and colors.
*/
const CONFIG = {
    canvasSize: 1080,         // Final image width/height (1080x1080 is optimized for Instagram/Facebook square)
    padding: 60,              // Safe padding around text elements
    headerHeight: 70,         // Height of the top bar holding the Category and Date
    imageMargin: 12,          // Space between header and image
    // imageHeight controls the aspect ratio of the image. 
    // 608px vertically on a 1080px width canvas maps to a perfect 16:9 ratio.
    imageHeight: 608,
    colors: {
        primary: '#c32026',   // Bold Red (used for Category box and highlighted text)
        text: '#000000',      // Standard black text
        bg: '#ffffff',        // Canvas overall background color
        gridClassic: '#f1f1f1',// Faint gray color for the background grid pattern
        gridBlue: '#dbeafe'    // Blueish print background grid pattern
    }
};

/*
  init() function
  ---------------
  Runs once on page load to set default values.
*/
function init() {
    // If the date field is empty, auto-fill today's date in Bengali
    if (!dateInput.value) {
        const now = new Date();
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        // formatBN ensures numbers like 1,2,3 are formatted properly (if default browser language supports it)
        const formatBN = (n) => n.toLocaleString('bn-BD', { useGrouping: false });
        dateInput.value = `${formatBN(now.getDate())} ${months[now.getMonth()]} ${formatBN(now.getFullYear())}`;
    }

    // Set a default headline if empty so the preview isn't blank
    if (!headlineInput.value) {
        headlineInput.value = "বিএনপি জবাবদিহিমূলক ও [যুগোপযোগী আইন] করতে চায়: আইনমন্ত্রী";
    }

    // Call render to draw the initial state
    render();
}

/*
  EVENT LISTENERS
  ---------------
  These listen for typing or uploading files, and trigger render() instantly 
  to update the preview.
*/
// Redraw immediately when any text field changes
[headlineInput, categoryInput, dateInput, sourceInput, bgStyleInput].forEach(el => {
    el.addEventListener('input', render);
});

// Handle image uploads
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader(); // FileReader lets us read file contents in memory
        reader.onload = (event) => {
            uploadedImage = new Image();
            uploadedImage.onload = render; // Draw to canvas once image is loaded in memory
            uploadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file); // Trigger the reading process
    }
});

// Handle download button click
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a'); // Create a temporary hidden link element
    link.download = `news-card-${Date.now()}.png`; // Set filename with unique timestamp
    link.href = canvas.toDataURL('image/png'); // Convert canvas drawing to PNG image URI
    link.click(); // Programmatically click the link to trigger download
});

/*
  render() function
  -----------------
  The master drawing function. It clears the canvas and redraws every layer 
  from back to front.
*/
function render() {
    // Lock the resolution so it exports sharply at 1080x1080
    canvas.width = CONFIG.canvasSize;
    canvas.height = CONFIG.canvasSize;

    // STEP 1: Draw the base background covering the whole canvas
    ctx.fillStyle = CONFIG.colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // STEP 2: Draw the elements layer by layer
    drawImage();      // Draws the uploaded image (or placeholder)
    drawGrid();       // Draws the faint grid pattern below the image
    drawHeader();     // Draws the Category box and Date text
    drawHeadline();   // Draws the main headline (processing the red [text] syntax)
    drawFooter();     // Draws "Source: Name" at the bottom
}

/*
  drawGrid()
  ----------
  Draws horizontal and vertical lines in the text area to give a premium 
  journalistic / "graph paper" aesthetic.
*/
function drawGrid() {
    ctx.strokeStyle = bgStyleInput.value === 'blue' ? CONFIG.colors.gridBlue : CONFIG.colors.gridClassic;
    ctx.lineWidth = 1;

    // We only want the grid to start below the header and image
    const yStart = CONFIG.headerHeight + CONFIG.imageMargin + CONFIG.imageHeight;

    // Draw Vertical lines every 40 pixels
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw Horizontal lines every 40 pixels
    for (let y = yStart; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

/*
  drawHeader()
  ------------
  Draws the top white bar containing the red Category box on the left, 
  and the gray Date text on the right.
*/
function drawHeader() {
    const margin = 40; // Space from edges
    const barHeight = CONFIG.headerHeight;

    // 1. Draw solid white background for the header bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, barHeight);

    // 2. Setup Category text to measure its width
    ctx.font = "700 32px 'Hind Siliguri'";
    const categoryText = (categoryInput.value || "NEWS").toUpperCase();
    const textWidth = ctx.measureText(categoryText).width;
    const boxPadding = 20; // Padding inside the red box

    // 3. Draw the red Category box
    // Total box width = width of text + padding on both sides
    ctx.fillStyle = CONFIG.colors.primary;
    ctx.fillRect(0, 0, textWidth + (boxPadding * 2), barHeight);

    // 4. Draw the actual category text inside the red box in white
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(categoryText, boxPadding, barHeight / 2 + 2); // +2 for optical centering adjustment

    // 5. Draw the Date text aligned to the right side of the canvas
    ctx.fillStyle = "#666666";
    ctx.font = "700 24px 'Hind Siliguri'";
    ctx.textAlign = "right";
    ctx.fillText(dateInput.value, canvas.width - margin, barHeight / 2 + 2);
}

/*
  drawImage()
  -----------
  Draws the uploaded photo right under the header. Checks for aspect ratio
  and perfectly crops the image via 'cover' technique (like CSS object-fit: cover).
*/
function drawImage() {
    const yOffset = CONFIG.headerHeight + CONFIG.imageMargin; // Image starts below the header bar + margin
    const drawWidth = canvas.width;      // Image spans full width (1080)
    const drawHeight = CONFIG.imageHeight; // Image height (608 to ensure 16:9 ratio)

    if (uploadedImage) {
        // Calculate Aspect Ratios to figure out how to crop the image
        const imgRatio = uploadedImage.width / uploadedImage.height;
        const targetRatio = drawWidth / drawHeight;

        let sw, sh, sx, sy; // Source width, Source height, Source X pos, Source Y pos

        if (imgRatio > targetRatio) {
            // Case 1: Image is wider than 16:9 -> Crop sides
            sh = uploadedImage.height;
            sw = sh * targetRatio;
            sx = (uploadedImage.width - sw) / 2;
            sy = 0;
        } else {
            // Case 2: Image is taller than 16:9 -> Crop top/bottom
            sw = uploadedImage.width;
            sh = sw / targetRatio;
            sx = 0;
            sy = (uploadedImage.height - sh) / 2;
        }

        // Final draw call: Takes cropped source coordinates (sx, sy, sw, sh) 
        // and scales exactly into destination canvas coordinates
        ctx.drawImage(uploadedImage, sx, sy, sw, sh, 0, yOffset, drawWidth, drawHeight);
    } else {
        // If NO image is uploaded, draw a gray placeholder box with instructions
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, yOffset, drawWidth, drawHeight);
        ctx.fillStyle = "#9ca3af";
        ctx.font = "40px 'Inter'";
        ctx.textAlign = "center";
        ctx.fillText("Upload Headline Image", canvas.width / 2, yOffset + drawHeight / 2);
    }
}

/*
  drawHeadline()
  --------------
  The most complex function. It parses the [brackets], determines word wrapping 
  so it doesn't run off the screen, and draws multiple formatted lines centered.
*/
function drawHeadline() {
    const text = headlineInput.value;
    const yStart = CONFIG.headerHeight + CONFIG.imageMargin + CONFIG.imageHeight + 60; // Start distance below the image
    const maxWidth = canvas.width - (CONFIG.padding * 2);         // Usable width for text wrapping

    // Set text styling
    ctx.font = "700 56px 'Hind Siliguri'";
    ctx.textBaseline = "top";

    // STEP 1: PARSING - Convert raw text into an array of color-aware "Tokens"
    // e.g. "We love [apples] largely" -> [{text: "We", isRed: false}, {text: "apples", isRed: true}]
    const tokens = [];
    let isRed = false; // Tracker state for coloring

    const words = text.split(/\s+/); // Split raw text by spaces
    words.forEach(word => {
        if (!word) return;
        let cleanWord = word;

        // If word contains '[', flip coloring ON and strip the bracket out
        if (cleanWord.includes('[')) {
            isRed = true;
            cleanWord = cleanWord.replace(/\[/g, '');
        }

        let wordEndsRed = false;
        // If word contains ']', plan to flip color OFF, strip bracket out
        if (cleanWord.includes(']')) {
            wordEndsRed = true;
            cleanWord = cleanWord.replace(/\]/g, '');
        }

        // Push processed word to our tokens array keeping track of state
        tokens.push({ text: cleanWord, isRed: isRed });

        if (wordEndsRed) {
            isRed = false; // Turn color off only AFTER this word is fully pushed
        }
    });

    // STEP 2: WORD WRAPPING - Group tokens together line by line
    const lines = []; // Will hold an array of "line" objects
    let currentLineTokens = []; // Holds tokens belonging to the current row
    let currentLineWidth = 0;   // Keeps track of pixel width so we know when to wrap
    const spaceWidth = ctx.measureText(" ").width; // Calculate width of a simple standard space

    tokens.forEach(token => {
        const tokenWidth = ctx.measureText(token.text).width;

        // If line is completely empty, it's the first word of the row
        if (currentLineTokens.length === 0) {
            currentLineTokens.push(token);
            currentLineWidth = tokenWidth;
        } else {
            // Check if adding the new word (plus a space) pushes us past maxWidth
            if (currentLineWidth + spaceWidth + tokenWidth <= maxWidth) {
                // If it easily fits, push word onto the current line
                currentLineTokens.push(token);
                currentLineWidth += spaceWidth + tokenWidth;
            } else {
                // Too long! Save the line and start a fresh line with this token
                lines.push({ tokens: currentLineTokens, width: currentLineWidth });
                currentLineTokens = [token];
                currentLineWidth = tokenWidth;
            }
        }
    });

    // Don't forget to push any remaining tokens as the very last row
    if (currentLineTokens.length > 0) {
        lines.push({ tokens: currentLineTokens, width: currentLineWidth });
    }

    // STEP 3: FINAL DRAWING - Render the wrapped lines on text 
    let currentY = yStart; // Represents vertical pixel position for row

    lines.forEach(line => {
        // Calculate true math center X position to start rendering this row
        let startX = (canvas.width - line.width) / 2;

        // Iterate over words in row
        line.tokens.forEach((token, index) => {
            // Set dynamic color 
            ctx.fillStyle = token.isRed ? CONFIG.colors.primary : CONFIG.colors.text;
            ctx.textAlign = "left";
            ctx.fillText(token.text, startX, currentY); // Draw the text element

            // Increment the X position tracking so the next word draws to the right of this one
            // We add the actual pixel width of this text + a space gap (if it isn't the final word)
            startX += ctx.measureText(token.text).width + (index < line.tokens.length - 1 ? spaceWidth : 0);
        });

        currentY += 80; // Add fixed +80 pixels line-height before moving to next row
    });
}

/*
  drawFooter()
  ------------
  Draws the "Source: Name" string in the bottom left corner.
*/
function drawFooter() {
    const margin = 40; // 40px padding distance from bottom-left
    ctx.fillStyle = "#555555";
    ctx.font = "500 24px 'Hind Siliguri'";
    ctx.textAlign = "left";

    // String interpolation embeds user input string
    ctx.fillText(`সূত্র: ${sourceInput.value}`, margin, canvas.height - 40);
}

/*
  FONT LOADING LISTENER
  ---------------------
  Must wait for Google Web Fonts to load before invoking init(), 
  otherwise the drawn Canvas text will immediately fail back to default browser system font.
*/
document.fonts.ready.then(() => {
    init(); // Fonts are loaded! Render initial view.
}).catch(() => {
    init(); // Fallback trigger just in case fonts fail, we still render app.
});
