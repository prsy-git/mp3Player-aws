import StatusBadge from './components/StatusCheck';
import SongList from './components/SongList';

export default function App() {
    return (
        <>
        <header>
            <h1>Music App</h1>
            <StatusBadge />
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Test to display SongList component</p>
            <SongList />
        </div>
        
        </>
    )
}