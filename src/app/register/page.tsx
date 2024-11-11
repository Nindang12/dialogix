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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = (password: string) => {
        return password.length >= 6
    }

    const onRegister = async () => {
        try {
            // Validate inputs
            if (!username || !email || !password || !confirmPassword) {
                toast.error("Vui lòng nhập đầy đủ thông tin")
                return
            }

            if (!validateEmail(email)) {
                toast.error("Email không hợp lệ")
                return
            }

            if (!validatePassword(password)) {
                toast.error("Mật khẩu phải có ít nhất 6 ký tự")
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
                toast.error(data.error || "Đã xảy ra lỗi trong quá trình đăng ký")
                return
            }

            toast.success("Đăng ký thành công")
            router.push('/login')
            
        } catch (err) {
            console.error(err)
            toast.error("Đã xảy ra lỗi trong quá trình đăng ký")
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onRegister()
        }
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen gap-2">
            <ToastContainer/>
            <span className="mb-1 font-bold">
                Đăng ký
            </span>
            <div className="w-full px-3 flex justify-center">
                <input 
                    onChange={(event) => setUsername(event.target.value)}
                    className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid rounded-2xl bg-gray-100 text-sm"
                    type="text"
                    placeholder="Tên người dùng"
                />
            </div>
            <div className="w-full px-3 flex justify-center">
                <input 
                    onChange={(event) => setEmail(event.target.value)}
                    className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid rounded-2xl bg-gray-100 text-sm"
                    type="email"
                    placeholder="Email"
                />
            </div>
            <div className="w-full px-3 flex justify-center">
                <input 
                    onChange={(event) => setPassword(event.target.value)}
                    className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid rounded-2xl bg-gray-100 text-sm"
                    type="password"
                    placeholder="Mật khẩu"
                />
            </div>
            <div className="w-full px-3 flex justify-center">
                <input 
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    onKeyUp={handleKeyPress}
                    className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid rounded-2xl bg-gray-100 text-sm"
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                />
            </div>
            <div className="w-full px-3 flex justify-center">
                <button 
                    onClick={onRegister}
                    className="md:w-[370px] w-full px-6 py-4 rounded-2xl bg-black text-white font-bold text-sm"
                >
                    Đăng ký
                </button>
            </div>
            <Link href="/login" className="w-full px-3 flex justify-center">
                <button className="md:w-[370px] w-full px-6 py-4 rounded-2xl border border-solid border-black font-bold text-sm">
                    Đã có tài khoản? Đăng nhập
                </button>
            </Link>
        </div>
    )
}