# Suno API Setup Guide

This project relies on the unofficial Suno API wrapper (`sunoapi.org` or similar community endpoints) to generate music. This guide explains how to obtain and configure your API key.

## 1. Get an API Key
Because Suno does not have a fully public, official developer API yet, this project is configured to use a popular third-party wrapper API (e.g., [SunoAPI.org](https://sunoapi.org) or similar endpoints).

1. Go to the API provider website (e.g., [SunoAPI.org](https://sunoapi.org)).
2. Register for an account.
3. Navigate to your **Dashboard** or **Account Settings**.
4. Locate the section for **API Keys**.
5. Click **Generate New API Key**.
6. Copy the generated key immediately.

## 2. Add the Key to Your Project
1. Open the `.env` file located inside the `backend/` folder of your project. If it doesn't exist, create it.
2. Add the API key using the exact variable name expected by the `SunoGenerationStrategy`:

```env
SUNO_API_KEY=your-suno-api-key-here
```

## 3. Important Considerations
- **Cost**: Real music generation using an API key costs credits/money. Monitor your usage carefully on the provider's dashboard.
- **The Mock Strategy**: If you are grading or testing the project and *do not* want to spend real money on an API key, use the **Mock Generation Strategy**. 
  - Go to the Landing Page.
  - Click `Strategy: SUNO` in the top left navbar and confirm the switch to Mock.
  - Log in via the custom Mock popup.
  - This completely bypasses the Suno API and requires no `.env` configuration!

## 4. Restart the Server
If you add or change the `SUNO_API_KEY` in your `.env` file, you must completely restart your Django backend server for the changes to take effect:
```bash
# In the backend terminal:
CTRL+C
python manage.py runserver
```
