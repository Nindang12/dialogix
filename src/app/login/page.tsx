"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from "next/link"

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate inputs
        if (!username.trim() || !password.trim()) {
            toast.error('Please enter both username and password');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok && data.token) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify({ 
                    username: data.username 
                }));

                toast.success('Login successful!');
                
                // Small delay to ensure cookie is set
                setTimeout(() => {
                    router.push('/');
                    router.refresh();
                }, 500);
            } else {
                toast.error(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen gap-2 bg-white text-black">
            <ToastContainer position="top-center" />
            <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md px-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập hoặc email"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
                    disabled={isLoading}
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
                    disabled={isLoading}
                    required
                />
                <button
                    type="submit"
                    className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
                <div className="mt-4 text-center">
                    <Link href="/register" className="text-blue-500 hover:underline">
                        Chưa có tài khoản? Đăng ký ngay
                    </Link>
                </div>
            </form>
        </div>
    )
}