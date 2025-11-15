import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { router, useForm, usePage, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
    Trash2Icon,
    PencilIcon,
    CheckCircle2Icon,
    UploadIcon,
    SearchIcon,
    Loader2Icon,
} from "lucide-react";
import Swal from "sweetalert2";
import ReactApexChart from "react-apexcharts";

// SweetAlert Flash Message Handler
const useSweetAlerts = () => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: flash.success,
                showConfirmButton: false,
                timer: 3000,
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: flash.error,
            });
        }
    }, [flash]);
};

// Modal Edit
const EditTodoModal = ({ todo, onClose, onUpdate }) => {
    const { data, setData, put, post, processing, errors, reset } = useForm({
        title: todo.title,
        description: todo.description,
        is_finished: todo.is_finished,
        cover: null,
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(`/todos/${todo.id}`, {
            onSuccess: () => {
                onClose();
                onUpdate();
            },
        });
    };

    const handleCoverUpdate = (e) => {
        e.preventDefault();
        if (!data.cover) return;

        post(`/todos/${todo.id}/cover`, {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                onUpdate();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-6 bg-card">
                <CardHeader className="border-b px-0 pt-0 pb-4">
                    <CardTitle>Ubah Aktivitas</CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-6">
                    <form onSubmit={handleUpdate} className="space-y-4 mb-8">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Judul Aktivitas</FieldLabel>
                                <Input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Deskripsi</FieldLabel>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    className="w-full border rounded-md p-2 bg-transparent"
                                />
                            </Field>

                            <Field>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_finished}
                                        onChange={(e) => setData("is_finished", e.target.checked)}
                                    />
                                    <span>Selesai</span>
                                </label>
                            </Field>

                            <Button className="w-full" type="submit" disabled={processing}>
                                {processing ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </FieldGroup>
                    </form>

                    {/* COVER SECTION */}
                    <form onSubmit={handleCoverUpdate} className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium">Ubah Cover</h4>

                        {todo.cover_url && (
                            <img
                                src={todo.cover_url}
                                className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                        )}

                        <Field>
                            <Input type="file" onChange={(e) => setData("cover", e.target.files[0])} />
                        </Field>

                        <Button
                            variant="secondary"
                            type="submit"
                            disabled={processing || !data.cover}
                            className="w-full"
                        >
                            <UploadIcon className="size-4 mr-2" />
                            Upload Cover
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="px-0 pt-4 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

// Form Tambah
const AddTodoForm = ({ onAddSuccess }) => {
    const { data, setData, post, processing } = useForm({
        title: "",
        description: "",
        cover: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/todos", {
            forceFormData: true,
            onSuccess: () => {
                setData("title", "");
                setData("description", "");
                setData("cover", null);
                onAddSuccess();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Judul Aktivitas</FieldLabel>
                    <Input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel>Deskripsi</FieldLabel>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="w-full border rounded-md p-2 bg-transparent"
                    />
                </Field>

                <Field>
                    <FieldLabel>Cover (Opsional)</FieldLabel>
                    <Input type="file" onChange={(e) => setData("cover", e.target.files[0])} />
                </Field>

                <Button disabled={processing} className="w-full">
                    {processing ? <Loader2Icon className="size-4 animate-spin mr-2" /> : "Tambah Aktivitas"}
                </Button>
            </FieldGroup>
        </form>
    );
};

// Statistik
const TodoStats = ({ total, finished }) => {
    const pending = total - finished;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Aktivitas</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center">
                <ReactApexChart
                    type="donut"
                    height="300"
                    series={[finished, pending]}
                    options={{
                        labels: ["Selesai", "Belum"],
                        colors: ["#34D399", "#F87171"],
                        dataLabels: { enabled: false },
                    }}
                />

                <div className="text-center mt-4">
                    <p className="text-lg font-bold">Total: {total}</p>
                    <p className="text-sm text-green-500">Selesai: {finished}</p>
                    <p className="text-sm text-red-500">Tertunda: {pending}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default function TodoPage() {
    useSweetAlerts();

    const { todos } = usePage().props;
    const { data, links, total, filters } = todos; 
    const [selectedTodo, setSelectedTodo] = useState(null);

    // Dapatkan parameter pencarian saat ini dari URL
    const initialSearch = filters?.search || '';
    const initialStatus = filters?.status || 'all'; 

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    // Fungsi utama untuk memicu pencarian dan filter
    const applyFilters = (newSearchQuery = searchQuery, newStatusFilter = statusFilter) => {
        router.get(
            '/todos', 
            { search: newSearchQuery, status: newStatusFilter }, 
            { 
                preserveState: true, 
                preserveScroll: true,
                only: ['todos']
            }
        );
    };

    // Efek untuk debounce PENCARIAN (berjalan otomatis saat mengetik)
    useEffect(() => {
        const handler = setTimeout(() => {
            // Hanya jalankan Inertia visit jika query berubah
            if (searchQuery !== initialSearch) {
                applyFilters(searchQuery, statusFilter);
            }
        }, 300); // Debounce 300ms

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    // Efek untuk STATUS FILTER (berjalan segera saat tombol ditekan)
    useEffect(() => {
        // Cek hanya jika statusFilter berubah dari nilai awal yang dimuat dari URL
        if (statusFilter !== initialStatus) {
            applyFilters(searchQuery, statusFilter);
        }
    }, [statusFilter]);


    const reloadTodos = () => applyFilters(searchQuery, statusFilter);

    // Fungsi yang dipanggil saat tombol kaca pembesar/Enter ditekan
    const handleSearchClick = () => {
        // Hanya panggil applyFilters jika pencarian belum dilakukan atau filter status aktif
        if (searchQuery !== initialSearch || statusFilter !== initialStatus) {
            applyFilters(searchQuery, statusFilter);
        }
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "Anda yakin?",
            text: "Aktivitas akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
        }).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/todos/${id}`, { onSuccess: reloadTodos });
            }
        });
    };

    const toggleFinish = (todo) => {
        router.put(`/todos/${todo.id}`, {
            title: todo.title,
            description: todo.description,
            is_finished: !todo.is_finished,
        });
    };

    const finishedTodos = data.filter((t) => t.is_finished).length;

    const FilterButton = ({ label, status, activeStatus }) => (
        <Button
            variant={status === activeStatus ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
        >
            {label}
        </Button>
    );

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h2 className="text-4xl font-extrabold mb-8 text-center">
                    Manajemen Daftar Aktivitas
                </h2>

                {/* --- BAGIAN ATAS: 2 KOLOM (Tambah Aktivitas & Statistik) --- */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Card 1: Tambah Aktivitas */}
                    <Card className="p-6">
                        <CardTitle className="mb-4 text-2xl">Tambah Aktivitas</CardTitle>
                        <AddTodoForm onAddSuccess={reloadTodos} />
                    </Card>

                    {/* Card 2: Statistik Aktivitas */}
                    <TodoStats total={total} finished={finishedTodos} />
                </div>

                {/* --- BAGIAN BAWAH: 1 KOLOM (Pencarian & Filter) --- */}
                <div className="mt-8">
                    {/* Menggunakan Card tanpa padding default, lalu CardHeader/Content memberi padding kustom */}
                    <Card className="flex flex-col gap-3">
                        {/* Judul "Pencarian & Filter" */}
                        <CardHeader className="px-4 pt-4 pb-0">
                            <CardTitle className="text-xl">Pencarian & Filter</CardTitle>
                        </CardHeader>

                        <CardContent className="px-4 pt-0 pb-4 space-y-3">
                            
                            {/* Input Pencarian dengan Tombol di Kanan */}
                            <div className="flex items-center space-x-2">
                                {/* Input Pencarian (Melebar Penuh) */}
                                <Input
                                    placeholder="Cari aktivitas berdasarkan judul atau deskripsi..."
                                    className="flex-1 border h-10 bg-transparent px-3 text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchClick();
                                        }
                                    }}
                                />
                                
                                {/* Tombol Pencarian (Ikon Kaca Pembesar) */}
                                <Button
                                    size="icon-lg" 
                                    className="shrink-0 h-10 w-10" // Tinggi dan lebar disamakan dengan input
                                    onClick={handleSearchClick}
                                >
                                    <SearchIcon className="size-5" />
                                </Button>
                            </div>

                            {/* Filter Status (Sudah Selesai / Belum Selesai) */}
                            <div className="flex space-x-2 pt-2 border-t mt-3">
                                <span className="text-sm font-medium self-center text-muted-foreground">Status:</span>
                                <FilterButton label="Semua" status="all" activeStatus={statusFilter} />
                                <FilterButton label="Selesai" status="finished" activeStatus={statusFilter} />
                                <FilterButton label="Belum Selesai" status="pending" activeStatus={statusFilter} />
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* --- DAFTAR AKTIVITAS --- */}
                <div className="mt-12">
                    <h3 className="text-3xl font-bold mb-6">Daftar Aktivitas ({total})</h3>

                    <div className="space-y-4">
                        {data.map((todo) => (
                            <Card
                                key={todo.id}
                                className="flex flex-col md:flex-row justify-between p-4 shadow-md"
                            >
                                <CardContent className="flex flex-1 items-start space-x-4 p-0">
                                    <input
                                        type="checkbox"
                                        checked={todo.is_finished}
                                        onChange={() => toggleFinish(todo)}
                                        className="h-5 w-5 mt-1"
                                    />

                                    <div className={todo.is_finished ? "line-through text-muted-foreground" : ""}>
                                        <h4 className="font-semibold text-lg">{todo.title}</h4>
                                        <p className="text-sm">{todo.description}</p>

                                        {todo.cover_url && (
                                            <p className="text-xs mt-2 flex items-center space-x-1">
                                                <UploadIcon className="size-3" />
                                                <span>Memiliki Cover</span>
                                            </p>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex space-x-2 p-0 mt-4 md:mt-0">
                                    <Button
                                        variant="secondary"
                                        size="icon-sm"
                                        onClick={() => setSelectedTodo(todo)}
                                    >
                                        <PencilIcon className="size-4" />
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="icon-sm"
                                        onClick={() => handleDelete(todo.id)}
                                    >
                                        <Trash2Icon className="size-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {links.length > 3 && (
                        <div className="flex justify-center mt-8 space-x-1">
                            {links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2 rounded-lg text-sm ${
                                        link.active
                                            ? "bg-primary text-white font-bold"
                                            : link.url
                                            ? "hover:bg-gray-100"
                                            : "opacity-50 cursor-not-allowed"
                                    }`}
                                    preserveState
                                    preserveScroll
                                />
                            ))}
                        </div>
                    )}

                    {/* Pesan Tidak Ada Aktivitas */}
                    {data.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border rounded-xl mt-6">
                            <CheckCircle2Icon className="size-12 mx-auto mb-3" />
                            Tidak ada aktivitas.
                        </div>
                    )}
                </div>
            </div>

            {selectedTodo && (
                <EditTodoModal
                    todo={selectedTodo}
                    onClose={() => setSelectedTodo(null)}
                    onUpdate={reloadTodos}
                />
            )}
        </AppLayout>
    );
}