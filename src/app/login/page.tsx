"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";

export default function Login(){
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='));
            if (token) {
                setIsLoggedIn(true);
                router.push('/');
            }
        };
        checkLoginStatus();
    }, [router]);

    const onLogin = async () => {
        try {
            if (!username || !password) {
                toast.error("Vui lòng nhập đầy đủ thông tin");
                return;
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username}),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Đã xảy ra lỗi trong quá trình đăng nhập");
                return;
            }

            // Save token to cookie
            document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24 hours
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsLoggedIn(true);
            router.push('/');
            
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi trong quá trình đăng nhập");
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onLogin()
        }
    }

    return(
        <div className="flex flex-col justify-center items-center h-screen gap-2">
            <ToastContainer/>
            <span className="mb-1 font-bold">
                Đăng nhập
            </span>
            <div className="w-full px-3 flex justify-center">
                <input 
                    onChange={(event)=>setUsername(event.target.value)} 
                    className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid  rounded-2xl bg-gray-100 text-sm" 
                    type="text" 
                    placeholder="Tên người dùng, số điện thoại hoặc email" 
                />
            </div>
            <div className="w-full px-3 flex justify-center">
                <input 
                    onChange={(event)=>setPassword(event.target.value)} 
                    onKeyUp={handleKeyPress}
                    className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid  rounded-2xl bg-gray-100 text-sm" 
                    type="password" 
                    placeholder="Mật khẩu" 
                />
            </div>
            <div className="w-full px-3 flex justify-center">
                <button onClick={onLogin} className="md:w-[370px] w-full px-6 py-4 rounded-2xl bg-black text-white font-bold text-sm">Đăng nhập</button>
            </div>
            <button className="text-gray-400 text-sm mt-2">Bạn quên mật khẩu ư?</button>
            <Link href={'/register'} className="w-full px-3 flex justify-center">
                <button className="md:w-[370px] w-full px-6 py-4  rounded-2xl border border-solid border-black font-bold text-sm">Tạo tài khoản</button>
            </Link>
            <span className="text-gray-400 text-sm mt-2">Hoặc có thể đăng nhập bằng</span>
            {/* <LoginGoogle/> */}
        </div>
    )
}