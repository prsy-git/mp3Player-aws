import {useState, useEffect} from 'react';

interface AuthenticationFormProps {
    onAuthSuccess: (userId: number) => void;
}

interface formFields {
    username: string;
    password: string;
    email: string;
}

export default function AuthenticationForm({ onAuthSuccess }: AuthenticationFormProps) {
    
    const [userInfo, setUserInfo] = useState<formFields>({
        username: '',
        password: '',
        email: ''
    });

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({...userInfo, username: e.target.value});
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({...userInfo, password: e.target.value});
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({...userInfo, email: e.target.value});
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');

        const requestEndpoint = isLogin 
            ? '/api/users/validate-login'
            : '/api/users/register-user';

        const bodyData = isLogin
            ? {username: userInfo.username, userPassword: userInfo.password}
            : {username: userInfo.username, userPassword: userInfo.password, email: userInfo.email};

            fetch(requestEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(bodyData),
                credentials: 'include'
            })
                .then(async (res) => {
                    const text = await res.text();
                    const data = text ? JSON.parse(text) : {};

                    if (!res.ok) {
                        throw new Error(data.error || 'Authentication failed')
                    }
                    return data;
                })
                .then((data: { userId: number}) => {
                    if (!isLogin) {
                        setIsLogin(true);
                        setErrorMessage('Account created. Please log in.');
                    } else {
                        onAuthSuccess(data.userId);
                    }
                })
                .catch((err) => {
                    setErrorMessage(err.message || 'Could not connect to server')
                });
        };
    
    return (
        <div>
            <h2>{isLogin ? 'Log In' : 'Register Account'}</h2>

            {errorMessage && <p style={{color: 'red',}}>{errorMessage}</p>}

            <form onSubmit={handleSubmit}>                
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={userInfo.username}
                        onChange={handleUsernameChange}
                        required
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label>Email:</label>
                        <input
                            type="text"
                            value={userInfo.email}
                            onChange={handleEmailChange}
                        />
                    </div>
                )}

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={userInfo.password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>

                <button type="submit">
                    {isLogin ? 'Log In' : 'Reigster'}
                </button>                
            </form>

            <button 
                type="button"
                onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMessage('');
                }}
            >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
            </button>
        </div>
    );
}