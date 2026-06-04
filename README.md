# Reaction Game

A small browser-based reaction trainer inspired by Batak machines. The game lights up one target at a time and challenges players to press the matching keyboard key as quickly as possible.

## Repository Description

Neon Batak-inspired reaction time game built with HTML, CSS, and vanilla JavaScript.

## Features

- Four-button reaction grid with `W`, `E`, `S`, and `D` controls.
- Practice mode with last, average, and best reaction time tracking.
- Competition mode with a 30-second countdown, correct count, and incorrect count.
- Space bar pause and resume.
- One-second ready delay before each game starts.
- Immediate next target after each correct input.
- Wrong-key and too-early feedback.
- Simple sound feedback using the Web Audio API.
- Neon lavender, blue, and teal Batak-machine inspired interface.
- No frameworks, libraries, or build tooling.

## Controls

| Key | Action |
| --- | --- |
| `W` | Top-left target |
| `E` | Top-right target |
| `S` | Bottom-left target |
| `D` | Bottom-right target |
| `Space` | Pause / resume |

## Game Modes

### Practice

Practice mode measures reaction time for every correct hit. It tracks:

- Last reaction time
- Average reaction time
- Best reaction time

After a correct key press, the next target lights immediately.

### Competition

Competition mode starts with a one-second ready delay. Once the first target lights up, a 30-second countdown begins.

During the match, the game tracks:

- Time remaining
- Correct hits
- Incorrect inputs

Incorrect inputs include wrong keys and pressing too early during the active match.

## Project Structure

```text
.
├── index.html
├── style.css
├── game.js
└── README.md
```

## Running Locally

Open `index.html` directly in a browser.

No install step is required.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Web Audio API

## Future Improvements

- Add score history or high scores.
- Add touch/click support for mobile play.
- Add adjustable match duration.
- Add difficulty settings.
- Add countdown animations.
- Add a mute toggle for sound feedback.
