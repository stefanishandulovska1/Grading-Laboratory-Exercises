import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";

export default function RegisterPage() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "СТУДЕНТ",
        indexNumber: "",
    });
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.register(form);
            nav("/login");
        } catch {
            setError("Грешка при регистрација.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-blue-700">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-8 border-blue-500"
            >
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-1">
                    Assignment Management System
                </h2>
                <p className="text-center text-purple-500 mb-6">
                    Регистрација
                </p>
                <div className="mb-4 space-y-2">
                    <input
                        placeholder="Име"
                        required
                        onChange={e => setForm({ ...form, firstName: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    />
                    <input
                        placeholder="Презиме"
                        required
                        onChange={e => setForm({ ...form, lastName: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    />
                    <input
                        type="email"
                        placeholder="Email адреса"
                        required
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                    <input
                        type="password"
                        placeholder="Лозинка"
                        required
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    />
                    <select
                        value={form.role}
                        onChange={e => setForm({ ...form, role: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                        <option value="СТУДЕНТ">Студент</option>
                        <option value="НАСТАВНИК">Наставник</option>
                        <option value="АСИСТЕНТ">Асистент</option>
                    </select>
                    {form.role === "СТУДЕНТ" && (
                        <input
                            placeholder="Бр. на индекс"
                            required
                            onChange={e => setForm({ ...form, indexNumber: e.target.value })}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                        />
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-500 font-semibold text-lg transition"
                >
                    Регистрирај се
                </button>

                {/* ДОДАДЕТЕ ГО ОВА КОПЧЕ ЗА ВРАЌАЊЕ НА НАЈАВА */}
                <div className="mt-4 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Веќе имате акаунт? Најавете се
                    </Link>
                </div>

                {error && (
                    <div className="mt-4 text-center text-red-500 bg-red-50 rounded p-2 font-medium">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}