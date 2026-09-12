import StatusBadge from './StatusCheck';

interface HeaderProps {
  userId: number | null;
  onLogout?: () => void;
}

export default function Header({ userId, onLogout }: HeaderProps) {
  return (
    <header>
      <h1>MP3 Player App</h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {userId !== null && onLogout && (  
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}