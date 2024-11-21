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
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const router = useRouter()

    const validateForm = () => {
        let isValid = true
        const newErrors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }

        if (!username) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập'
            isValid = false
        }

        if (!email) {
            newErrors.email = 'Vui lòng nhập email'
            isValid = false
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                newErrors.email = 'Email không hợp lệ'
                isValid = false
            }
        }

        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu'
            isValid = false
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
            isValid = false
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
            isValid = false
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const onRegister = async () => {
        try {
            if (!validateForm()) {
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
                if (data.error === 'Tên người dùng đã tồn tại') {
                    setErrors(prev => ({...prev, username: data.error}))
                } else if (data.error === 'Email đã được sử dụng') {
                    setErrors(prev => ({...prev, email: data.error}))
                } else {
                    toast.error(data.error || "Lỗi đăng ký")
                }
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
                <div className="mb-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                            setErrors(prev => ({...prev, username: ''}))
                        }}
                        placeholder="Tên đăng nhập"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500' : ''}`}
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>
                <div className="mb-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setErrors(prev => ({...prev, email: ''}))
                        }}
                        placeholder="Email"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setErrors(prev => ({...prev, password: ''}))
                        }}
                        placeholder="Mật khẩu"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setErrors(prev => ({...prev, confirmPassword: ''}))
                        }}
                        placeholder="Xác nhận mật khẩu"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        onKeyPress={(e) => e.key === 'Enter' && onRegister()}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
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