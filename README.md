# Chithara-AI-music-generator
This project is part of 0129243-65 Principle of Software Design

## Setup Instructions

### 1. Create a Virtual Environment

To isolate the project's dependencies, create a virtual environment (`venv`).

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

### 2. Install Dependencies

Install the required packages using `pip`. Ensure your virtual environment is active.
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server

Navigate to the `backend` directory and start the Django development server:
```bash
cd backend
python manage.py runserver
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
