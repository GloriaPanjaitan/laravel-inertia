import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { router, usePage } from "@inertiajs/react";

export default function HomePage() {
    const { auth } = usePage().props;

    // Fungsi untuk menuju halaman TodoPage dengan langsung fokus tambah aktivitas
    const goToTodoAdd = () => {
        router.get("/todos", { focusAdd: true });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Hero Section */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                        <span role="img" aria-label="wave">👋</span> Hai, {auth.name}!
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8">
                        Selamat datang! Mulai rencanakan aktivitas dan capai produktivitas maksimal hari ini.
                    </p>
                    <Button
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-300"
                        onClick={goToTodoAdd}
                    >
                        Buat Rencana
                    </Button>
                </div>

                {/* Feature / Info Cards */}
                <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold mb-2">Manajemen Aktivitas</h3>
                        <p className="text-gray-600">Tambahkan, edit, dan tandai aktivitas selesai dengan mudah.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold mb-2">Statistik & Progress</h3>
                        <p className="text-gray-600">Pantau progres aktivitas dengan grafik interaktif yang mudah dipahami.</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-xl font-semibold mb-2">Notifikasi Real-time</h3>
                        <p className="text-gray-600">Dapatkan pemberitahuan saat aktivitas ditambahkan, diperbarui, atau selesai.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
