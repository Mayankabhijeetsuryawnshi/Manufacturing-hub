# Google Sheets Integration Instructions

To connect your application to Google Sheets, follow these steps:

### 1. Set up the Spreadsheet
1. Go to [sheets.new](https://sheets.new) to create a new spreadsheet.
2. Note the URL.
3. Click on **Extensions** > **Apps Script**.

### 2. Add the Script
1. Delete any existing code in `Code.gs`.
2. Copy the content from `CODE_GS.js` in this project and paste it into the Apps Script editor.
3. Click the **Save** icon and name it (e.g., "Growlayer Backend").

### 3. Deploy the Web App
1. Click the **Deploy** button > **New deployment**.
2. Select type **Web app**.
3. Under "Who has access", select **Anyone**. (This is important for the app to communicate).
4. Click **Deploy**.
5. Copy the **Web App URL** provided (it ends with `/exec`).

### 4. Configure the Project
1. In AI Studio, open the **Settings** or **Secrets** panel.
2. Add an environment variable named `VITE_GOOGLE_SHEET_URL`.
3. Paste the **Web App URL** you copied as the value.
4. Restart the dev server or refresh the preview.

### 5. Verify
1. Go to the "Production Log" in your app.
2. Select a customer, enter a quantity, and click **Save Submission**.
3. Check your Google Sheet; a new tab called "Production_Logs" should appear with your data.
