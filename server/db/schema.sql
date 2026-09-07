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

--Find all Songs in Favorites playlist
SELECT Songs.songId, Songs.title, Songs.filePath
FROM Songs
JOIN Playlist_Songs ON Songs.songId = Playlists_Songs.songId
JOIN Playlists ON Playlists_Songs.playlistId = Playlists.playlistId
WHERE Playlists.name = 'Favorites';

--Find all playlists by a user named alice
SELECT Playlists.playlistId, Playlists.name
FROM Playlists
JOIN Users ON Users.userId = Playlists.userId
WHERE Users.username = 'Alice';