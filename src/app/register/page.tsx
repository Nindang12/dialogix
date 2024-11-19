"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from "next/link"

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const router = useRouter()

    const onRegister = async () => {
        try {
            if (!username || !email || !password || !confirmPassword) {
                toast.error("Vui lòng nhập đầy đủ thông tin")
                return
            }

            if (password !== confirmPassword) {
                toast.error("Mật khẩu xác nhận không khớp")
                return
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || "Lỗi đăng ký")
                return
            }

            toast.success("Đăng ký thành công")
            router.push('/login')

        } catch (error) {
            console.error('Registration error:', error)
            toast.error("Lỗi đăng ký")
        }
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen gap-2 bg-white text-black">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Đăng ký</h1>
            <div className="w-full max-w-md px-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
                    onKeyPress={(e) => e.key === 'Enter' && onRegister()}
                />
                <button
                    onClick={onRegister}
                    className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                    Đăng ký
                </button>
                <div className="mt-4 text-center">
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Đã có tài khoản? Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    )
}