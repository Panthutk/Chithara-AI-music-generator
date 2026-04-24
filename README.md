# Chithara-AI-music-generator

This project is part of 0129243-65 Principle of Software Design

## Key Features

- **Google OAuth 2.0 Authentication**: Secure login flow with single-session enforcement via JWT and database tracking.
- **AI Music Generation**: Users can request custom tracks by specifying prompts, genres, and vocal styles. Requests are managed via a backend queue.
- **Preview & Confirmation**: A pre-generation modal to review track details before starting the AI engine.
- **Personal Music Library**: A dynamic interface to view, search, and sort generated tracks with high-fidelity UI components.
- **Custom Audio Player**: Feature-rich web audio player supporting background playback, volume control, skipping, track shuffling, and looping.
- **Security & Quotas**: Backend API rate limiting restricts generation to 30 tracks per user over a rolling 7-day period to prevent abuse.
- **Live Quota Tracking & Alerts**: The UI tracks your remaining generation coins in real-time and gracefully displays custom bottom-right toast notifications if you run out of credits (bypassing ugly browser alerts).
- **Strategy Pattern Architecture**: Generation logic is abstracted behind a `GenerationStrategy` interface, allowing dynamic runtime switching between actual Suno API generations and cost-free Mock generations without restarting the server or modifying `.env` flags.
- **Track Management**: Rename or completely remove tracks from your personal or shared library.

## Testing & Grading (Mock Strategy)

To test the system without spending API credits, a secret **Mock UI Bypass** is implemented using the Strategy Pattern.

1. On the Landing Page, click the small grey `Strategy: SUNO` text in the top-left navigation bar.
2. Confirm the custom modal to switch to `Strategy: MOCK`.
3. Click the standard "Login with Google" or "Sign up" button.
4. Instead of opening Google OAuth, a Mock Login modal will appear. Select either `special1@chitharamock.com` or `special2@chitharamock.com`.
5. These users are assigned the `MOCK_USER` role in the database. When they generate a track, the `MockGenerationStrategy` safely intercepts the request, copies an existing track from the database, and returns it instantly.

## Setup Instructions

### 1. Clone the Repository

Start by cloning the project repository to your local machine and navigating into it:

```bash
git clone https://github.com/Panthutk/Chithara-AI-music-generator.git
cd Chithara-AI-music-generator
```

### 2. Create a Virtual Environment

Navigate to the `backend` directory and create a virtual environment (`venv`) to isolate the project's dependencies.

```bash
cd backend
```

**On Windows:**

```cmd
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Install the required packages using `pip`. Ensure your virtual environment is active.

```bash
pip install -r requirements.txt
```

### 4. Apply Database Migrations

Apply the database migrations to set up the database schema:

```bash
python manage.py migrate
```

### 5. Create a Superuser

To access the Django admin interface, run the provided script to create a default admin account (Username: `admin`, Password: `admin`):

```bash
python create_superuser.py
```

Alternatively, you can create your own custom superuser:

```bash
python manage.py createsuperuser
```

### 6. Run the Development Server

Start the Django development server:

```bash
python manage.py runserver
```

### 7. Route Endpoints (Localhost)

The Django REST Framework is enabled, providing standard CRUD endpoints for our models.

The following endpoints are available for testing:

```bash
http://127.0.0.1:8000/admin/ - Django admin interface
http://127.0.0.1:8000/api/users/           - Supported: GET, POST
http://127.0.0.1:8000/api/users/<id>/      - Supported: GET, PUT, PATCH, DELETE
http://127.0.0.1:8000/api/libraries/       - Supported: GET, POST
http://127.0.0.1:8000/api/libraries/<id>/  - Supported: GET, PUT, PATCH, DELETE
http://127.0.0.1:8000/api/tracks/          - Supported: GET, POST
http://127.0.0.1:8000/api/tracks/<id>/     - Supported: GET, PUT, PATCH, DELETE

# and similarly for other models:
http://127.0.0.1:8000/api/listening-activities/
http://127.0.0.1:8000/api/generation-requests/
http://127.0.0.1:8000/api/share-permissions/
http://127.0.0.1:8000/api/email-invitations/
```

---

## Database Structure

The following tables describe the actual models used in the API.

### User

| Field             | Type           | Attributes  | Description                             |
| ----------------- | -------------- | ----------- | --------------------------------------- |
| `userId`        | AutoField      | Primary Key | Unique identifier for the user.         |
| `name`          | CharField(255) |             | Name of the user.                       |
| `email`         | EmailField     | Unique      | Email address of the user.              |
| `role`          | CharField(50)  |             | Role of the user in the system.         |
| `session_token` | CharField(255) | Null/Blank  | UUID tracking the active login session. |

### MusicLibrary

| Field         | Type          | Attributes   | Description                            |
| ------------- | ------------- | ------------ | -------------------------------------- |
| `libraryId` | AutoField     | Primary Key  | Unique identifier for the library.     |
| `user`      | OneToOneField | Cascade      | Foreign key referring to `User`.     |
| `createdAt` | DateTimeField | Auto Now Add | Date and time the library was created. |

### MusicTrack

| Field          | Type           | Attributes       | Description                                                |
| -------------- | -------------- | ---------------- | ---------------------------------------------------------- |
| `trackId`    | AutoField      | Primary Key      | Unique identifier for the track.                           |
| `title`      | CharField(255) |                  | Title of the music track.                                  |
| `genre`      | CharField(255) |                  | Style/Genre of the track.                                  |
| `status`     | CharField(50)  | Choices, Default | Generation status (AVAILABLE, PROCESSING, FAILED, HIDDEN). |
| `visibility` | CharField(50)  | Choices, Default | Access control (PRIVATE, PUBLIC).                          |
| `audio_url`  | URLField(1000) | Null/Blank       | URL link to the generated MP3 file.                        |
| `image_url`  | URLField(1000) | Null/Blank       | URL link to the generated cover image.                     |
| `user`       | ForeignKey     | Cascade          | Owner of the track.                                        |
| `library`    | ForeignKey     | Cascade          | The library this track belongs to.                         |

### GenerationRequest

| Field            | Type           | Attributes          | Description                                           |
| ---------------- | -------------- | ------------------- | ----------------------------------------------------- |
| `requestId`    | AutoField      | Primary Key         | Unique request identifier.                            |
| `prompt`       | TextField      |                     | The user's prompt text for generation.                |
| `title`        | CharField(255) | Null/Blank          | Requested title.                                      |
| `style`        | CharField(255) | Null/Blank          | Requested style/genre.                                |
| `negativeTags` | CharField(255) | Null/Blank          | Tags to avoid during generation.                      |
| `vocalGender`  | CharField(10)  | Null/Blank          | Male ('m') or Female ('f') vocals.                    |
| `status`       | CharField(50)  | Choices, Default    | Generation status (QUEUED, RUNNING, SUCCESS, FAILED). |
| `createdAt`    | DateTimeField  | Auto Now Add        | Request creation timestamp.                           |
| `suno_task_id` | CharField(255) | Null/Blank          | Reference ID from the Suno API.                       |
| `user`         | ForeignKey     | Cascade             | User who requested the generation.                    |
| `track`        | OneToOneField  | Cascade, Null/Blank | The generated Track associated with the request.      |

### TrackInvite

| Field             | Type          | Attributes          | Description                                    |
| ----------------- | ------------- | ------------------- | ---------------------------------------------- |
| `inviteId`      | AutoField     | Primary Key         | Unique invitation ID.                          |
| `track`         | ForeignKey    | Cascade             | The track being shared.                        |
| `inviter`       | ForeignKey    | Cascade             | User who sent the invite.                      |
| `invitee_email` | EmailField    |                     | The recipient's email address.                 |
| `invitee`       | ForeignKey    | Cascade, Null/Blank | Recipient user account (if registered).        |
| `status`        | CharField(50) | Choices, Default    | Status (PENDING, ACCEPTED, REJECTED, REMOVED). |
| `created_at`    | DateTimeField | Auto Now Add        | Timestamp of the sent invitation.              |
