import {useEffect, useState} from 'react';

export default function App() {
    const [message, setMessage] = useState<string>('Loading...');

    useEffect(() => {
        fetch('http://localhost:5000/api/ping')
        .then((res) => res.json())
        .then((data) => setMessage(data.message))
        .catch(() => setMessage('Failed to connect backend.'));
    }, [])
    
    return (
        <div>
            <h1>MP3 App Frontend Test</h1>
            <p>Client successfully running</p>
        </div>
    );
}