# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Corrected the API key handling to use Vite's environment variables (`import.meta.env`). The app now looks for `VITE_GEMINI_API_KEY` in the `.env` file.
- Removed redundant API key checks in `geminiService.ts` to rely on a single, global check.
- Added a `.env` file with a placeholder for the API key.
