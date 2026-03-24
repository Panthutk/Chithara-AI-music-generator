# Chithara-AI-music-generator

This project is part of 0129243-65 Principle of Software Design

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

The following tables describe the models used in the API.

### User

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `userId` | AutoField | Primary Key | Unique identifier for the user. |
| `name` | CharField(255) | | Name of the user. |
| `email` | EmailField | Unique | Email address of the user. |
| `role` | CharField(50) | | Role of the user in the system. |

### MusicLibrary

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `libraryId` | AutoField | Primary Key | Unique identifier for the library. |
| `user` | OneToOneField | Cascade | Foreign key referring to `User`. |
| `createdAt` | DateTimeField | Auto Now Add | Date and time the library was created. |

### MusicTrack

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `trackId` | AutoField | Primary Key | Unique identifier for the track. |
| `title` | CharField(255) | | Title of the music track. |
| `duration` | IntegerField | Null/Blank | Duration of the track in seconds. |
| `genre` | CharField(50) | Choices | Genre of the track (e.g., POP, ROCK). |
| `mood` | CharField(100) | | Mood of the track. |
| `occasion` | CharField(100) | | Occasion for the track. |
| `status` | CharField(50) | Choices, Default | Processing status (AVAILABLE, PROCESSING, FAILED). |
| `user` | ForeignKey | Cascade | Owner of the track. |
| `library` | ForeignKey | Cascade | The library this track belongs to. |

### ListeningActivity

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `activityId` | AutoField | Primary Key | Unique id for the listening activity. |
| `playedAt` | DateTimeField | Auto Now Add | Timestamp when the track was played. |
| `duration` | IntegerField | | Duration played in seconds. |
| `user` | ForeignKey | Cascade | User who listened to the track. |
| `track` | ForeignKey | Cascade | Track that was listened to. |

### GenerationRequest

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `requestId` | AutoField | Primary Key | Unique request identifier. |
| `prompt` | TextField | | The user's prompt text for generation. |
| `status` | CharField(50) | Choices, Default | Generation status (QUEUED, RUNNING, SUCCESS, FAILED). |
| `createdAt` | DateTimeField | Auto Now Add | Request creation timestamp. |
| `user` | ForeignKey | Cascade | User who requested the generation. |
| `track` | OneToOneField | Cascade, Null/Blank| The generated Track associated with the prompt. |

### SharePermission

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `permissionId`| AutoField | Primary Key | Unique permission identifier. |
| `accessLevel` | CharField(50) | Choices | Access level (VIEW, DOWNLOAD, SHARE). |
| `shareLink` | URLField(500) | Null/Blank | URL for sharing the track. |
| `createdAt` | DateTimeField | Auto Now Add | Timestamp when the permission was created. |
| `track` | ForeignKey | Cascade | Track this permission applies to. |

### EmailInvitation

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `invitationId`| AutoField | Primary Key | Unique invitation ID. |
| `email` | EmailField | | The recipient's email address. |
| `status` | CharField(50) | Choices, Default | Status (PENDING, SENT, ACCEPTED, EXPIRED).|
| `sentAt` | DateTimeField | Null/Blank | Timestamp of the sent invitation. |
| `permission` | ForeignKey | Cascade | The permission associated with this invite. |

## Short Video Demonstration

[[Chithara AI Music Generator Database Model Demo]](https://youtu.be/GCpMxChnVcU)
