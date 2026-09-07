CREATE TABLE IF NOT EXISTS Users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    email VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS Playlists (
    playlistId INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    userId INTEGER NOT NULL,

    FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Songs (
    songId INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    uploadingUser INTEGER NOT NULL,

    FOREIGN KEY (uploadinguser) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Playlists_Songs (
    playlistId INTEGER,
    songId INTEGER,
    PRIMARY KEY (playlistId, songId),
    FOREIGN KEY (playlistId) REFERENCES Playlists(playlistId),
    FOREIGN KEY (songId) REFERENCES Songs(songId)
);