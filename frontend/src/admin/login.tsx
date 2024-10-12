export default function Login() {

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        type Response = {
            "token": string
        }

        if (response.ok) {
            response.json().then((data: Response) => {
                localStorage.setItem('token', data.token);
                window.location.href = '/admin';
            });
        } else {
            console.error(response.statusText);
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', color: "var(--primary-100)" }}>
                登录
            </h1>
            <form onSubmit={handleLogin} autoComplete="off">
                <div style={{ margin: '8px 0' }}>
                    <label htmlFor="username">用户名</label>
                    <input
                        id="username"
                        type="text"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ margin: '8px 0' }}>
                    <label htmlFor="password">密码</label>
                    <input
                        id="password"
                        type="password"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--primary-100)', color: 'white', border: 'none', borderRadius: '4px' }}>
                    登录
                </button>
            </form>
        </div>
    );
}