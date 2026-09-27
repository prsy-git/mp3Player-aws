# mp3Player

A full-stack MP3 player built with React, TypeScript, Express, PostgreSQL and AWS.

## Live Demo

https://mp3.pdsry.com

## About

This project was developed with the intention of giving me experience and comfort with designing a deployed full-stack application. This was initially designed as a locally hosted project which supported mock implementations of database user authentication and persistent storage of local files, and was expanded to support cloud architecture and deployment in a production environment.

The production version runs on AWS Lightsail, uses PostgreSQL for application data, and stores uploaded audio files privately in Amazon S3.

## Features

- User registration, login, logout, and persistent authenticated sessions
- MP3 file uploads with private storage in Amazon S3
- Audio playback using temporary signed URLs for private S3 objects
- Play, pause, next, previous, loop, autoplay, and shuffle controls
- Custom playlist creation and deletion
- Add and remove songs from playlists without affecting the original upload
- Persistent song and playlist data stored in PostgreSQL
- User-specific libraries so uploaded songs and playlists are associated with the authenticated user
- Song deletion removes both the database record and corresponding S3 object

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- express-session
- Multer

### AWS / Deployment
- AWS Lightsail
- Amazon S3
- Nginx
- HTTPS / Let's Encrypt
- systemd

## Architecture

The application is split into separate React frontend and Express backend layers. In production, both are hosted on an AWS Lightsail instance with Nginx handling HTTPS traffic and forwarding API requests to the Express server.

PostgreSQL runs on the Lightsail instance and stores users, sessions, song metadata, playlists, and playlist relationships. Uploaded MP3 files are stored separately in a private Amazon S3 bucket rather than in the database or permanently on the server.

When a user requests playback, the backend verifies that the song belongs to the authenticated user and generates a temporary signed S3 URL. This allows the browser to access the requested audio without making the S3 bucket public.

## Deployment and Security

The production application is hosted on AWS Lightsail and uses Nginx as a reverse proxy in front of the Express server. HTTPS is configured with Let's Encrypt, and the Node.js application runs as a systemd service.

Authentication uses server-side sessions stored in PostgreSQL. Session cookies are configured as HTTP-only and secure so they are only transmitted over HTTPS. PostgreSQL runs locally on the Lightsail instance rather than being exposed as a public database.

Uploaded audio is stored in a private Amazon S3 bucket. Playback requests go through authenticated backend routes, which verify song ownership before generating a short-lived signed URL. Application

